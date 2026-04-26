import { Button, Typography, theme } from 'antd';
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
    const msg = `Olá! Meu agendamento foi confirmado:\n\n👤 Nome: ${name}\n📞 Telefone: ${phoneNumber}\n✂️ Barbeiro: ${barberName}\n💈 Serviço: ${serviceName}\n📅 Data: ${formattedDate}\n🕐 Horário: ${time}`;
    const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');

    try { await sendAppointmentEmail({ name, phoneNumber, barberName, serviceName, date: formattedDate, time }); }
    catch (err) { console.error('Failed to send email:', err); }
    onClose();
  };

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      {/* Celebration icon */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%', background: token.colorSuccess,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pop 0.4s ease-out',
        }}>
          <CheckCircleOutlined style={{ fontSize: 50, color: 'white' }} />
        </div>
      </div>

      <Title level={3} style={{ marginBottom: 4 }}>🎉 Agendamento Confirmado!</Title>

      <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 15 }}>
        Obrigado, {name}!
      </Text>

      {/* Summary */}
      <div style={{
        background: token.colorBgElevated, borderRadius: 12, padding: 16, marginBottom: 24,
        border: `1px solid ${token.colorBorder}`, textAlign: 'left',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text type="secondary">📅 Data</Text>
          <Text strong>{format(date, "dd/MM/yyyy", { locale: ptBR })}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text type="secondary">🕐 Horário</Text>
          <Text strong>{time}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text type="secondary">✂️ Barbeiro</Text>
          <Text strong>{barberName}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary">💈 Serviço</Text>
          <Text strong>{serviceName}</Text>
        </div>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 13 }}>
        Envie uma mensagem para confirmar pelo WhatsApp
      </Text>

      {/* Big WhatsApp button */}
      <Button type="primary" size="large" block icon={<WhatsAppOutlined />} onClick={handleWhatsAppClick}
        style={{ height: 56, fontSize: 18, fontWeight: 'bold', borderRadius: 12, background: '#25D366', borderColor: '#25D366' }}>
        Concluir via WhatsApp
      </Button>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SuccessStep;
