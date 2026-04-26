import { Button, Card, Typography, theme } from 'antd';
import { CheckCircleOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WHATSAPP_NUMBER } from '../../config/whatsapp';
import { sendAppointmentEmail } from '../../services/notificationsApi';

const { Title, Text } = Typography;

interface SuccessStepProps {
  onClose: () => void;
  date: Date;
  time: string;
  name: string;
  barberName?: string;
  serviceName?: string;
  phoneNumber?: string;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  onClose, date, time, name, barberName = '', serviceName = '', phoneNumber = '',
}) => {
  const { token } = theme.useToken();
  const handleWhatsAppClick = async () => {
    const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const message = `Olá! Meu agendamento foi confirmado:\n\n` +
      `👤 Nome: ${name}\n📞 Telefone: ${phoneNumber}\n✂️ Barbeiro: ${barberName}\n` +
      `💈 Serviço: ${serviceName}\n📅 Data: ${formattedDate}\n🕐 Horário: ${time}`;

    const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');

    try {
      await sendAppointmentEmail({ name, phoneNumber, barberName, serviceName, date: formattedDate, time });
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    onClose();
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%', background: token.colorSuccess,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircleOutlined style={{ fontSize: 50, color: 'white' }} />
        </div>
      </div>

      <Title level={3}>Agendamento Confirmado!</Title>

      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Obrigado, {name}! Seu agendamento foi realizado com sucesso.
      </Text>

      <Card style={{ marginBottom: 24 }}>
        <Title level={5}>Detalhes do Agendamento</Title>
        <Text type="secondary">
          {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {time}
        </Text>
      </Card>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Você receberá uma mensagem de confirmação em breve. Esperamos ver você!
      </Text>

      <Button type="primary" size="large" block icon={<WhatsAppOutlined />} onClick={handleWhatsAppClick}>
        Concluir
      </Button>
    </div>
  );
};

export default SuccessStep;
