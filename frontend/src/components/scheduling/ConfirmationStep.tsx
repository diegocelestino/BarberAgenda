import { useState, useRef } from 'react';
import { Alert, Button, Card, Divider, Spin, Typography, theme } from 'antd';
import {
  CheckCircleOutlined, UserOutlined, PhoneOutlined, ScissorOutlined,
  ToolOutlined, CalendarOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAppSelector } from '../../store/hooks';

const { Title, Text } = Typography;

interface ConfirmationStepProps {
  onConfirm: () => Promise<void>;
  onBack: () => void;
  phoneNumber: string;
  barberId: string;
  serviceId: string;
  date: Date;
  time: string;
  name: string;
  service?: any;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  onConfirm, onBack, phoneNumber, barberId, serviceId, date, time, name, service: serviceProp,
}) => {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const barber = useAppSelector((state) => state.barbers.barbers.find(b => b.barberId === barberId));
  const serviceFromRedux = useAppSelector((state) => state.services.services.find(s => s.serviceId === serviceId));
  const service = serviceProp || serviceFromRedux;

  const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '';
  const isDevelopment = process.env.REACT_APP_ENV === 'local' || process.env.NODE_ENV === 'development';

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (token) setError('');
  };

  const handleConfirm = async () => {
    if (!isDevelopment && !recaptchaToken) {
      setError('Por favor, complete a verificação reCAPTCHA.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError('Falha ao agendar. Por favor, tente novamente.');
      setLoading(false);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    }
  };

  const DetailRow = ({ icon, label, value, extra }: { icon: React.ReactNode; label: string; value: string; extra?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ marginRight: 16, color: token.colorTextTertiary, fontSize: 18 }}>{icon}</span>
      <div>
        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{label}</Text>
        <Text>{value}</Text>
        {extra && <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>{extra}</Text>}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <CheckCircleOutlined style={{ fontSize: 32, color: token.colorPrimary, marginRight: 16 }} />
        <Title level={4} style={{ margin: 0 }}>Confirme seu Agendamento</Title>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Por favor, revise os detalhes do seu agendamento
      </Text>

      <Card style={{ marginBottom: 16 }}>
        <DetailRow icon={<UserOutlined />} label="Nome" value={name} />
        <Divider style={{ margin: '8px 0' }} />
        <DetailRow icon={<PhoneOutlined />} label="Telefone" value={phoneNumber} />
        <Divider style={{ margin: '8px 0' }} />
        <DetailRow icon={<ScissorOutlined />} label="Barbeiro" value={barber?.name || 'Desconhecido'} />
        <Divider style={{ margin: '8px 0' }} />
        <DetailRow
          icon={<ToolOutlined />}
          label="Serviço"
          value={service?.title || service?.name || 'Desconhecido'}
          extra={`R$ ${service?.price} • ${service?.duration || service?.durationMinutes} min`}
        />
        <Divider style={{ margin: '8px 0' }} />
        <DetailRow icon={<CalendarOutlined />} label="Data" value={format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
        <Divider style={{ margin: '8px 0' }} />
        <DetailRow icon={<ClockCircleOutlined />} label="Horário" value={time} />
      </Card>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      {!isDevelopment && recaptchaSiteKey && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <ReCAPTCHA ref={recaptchaRef} sitekey={recaptchaSiteKey} onChange={handleRecaptchaChange} hl="pt-BR" />
        </div>
      )}

      {isDevelopment && (
        <Alert type="info" message="🔧 Modo de Desenvolvimento - reCAPTCHA desabilitado" showIcon style={{ marginBottom: 16 }} />
      )}

      <div style={{ display: 'flex', gap: 16 }}>
        <Button block onClick={onBack} disabled={loading}>Voltar</Button>
        <Button
          block
          type="primary"
          onClick={handleConfirm}
          disabled={loading || (!isDevelopment && !recaptchaToken)}
          icon={loading ? <Spin size="small" /> : undefined}
        >
          {loading ? 'Agendando...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
