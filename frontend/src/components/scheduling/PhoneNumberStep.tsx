import { useState } from 'react';
import { Button, Input, Typography, theme } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PhoneNumberStepProps {
  onNext: (phoneNumber: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const PhoneNumberStep: React.FC<PhoneNumberStepProps> = ({ onNext, onBack, initialValue = '' }) => {
  const { token } = theme.useToken();
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  const [error, setError] = useState('');

  const formatPhoneNumber = (value: string): string => {
    const onlyNumbers = value.replace(/\D/g, '');
    if (onlyNumbers.length <= 2) return onlyNumbers;
    if (onlyNumbers.length <= 7) return `${onlyNumbers.slice(0, 2)} ${onlyNumbers.slice(2)}`;
    return `${onlyNumbers.slice(0, 2)} ${onlyNumbers.slice(2, 7)} ${onlyNumbers.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    if (onlyNumbers.length > 11) {
      setError('O telefone não pode ter mais de 11 dígitos');
      return;
    }
    setError('');
    setPhoneNumber(onlyNumbers);
  };

  const handleSubmit = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Por favor, insira um número de telefone válido');
      return;
    }
    setError('');
    onNext(phoneNumber);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <PhoneOutlined style={{ fontSize: 32, color: token.colorPrimary, marginRight: 16 }} />
        <Title level={4} style={{ margin: 0 }}>Digite seu Telefone</Title>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Usaremos para enviar lembretes do seu agendamento
      </Text>

      <div style={{ marginBottom: 16 }}>
        <Input
          size="large"
          placeholder="11 99999 9999"
          value={formatPhoneNumber(phoneNumber)}
          onChange={handleChange}
          inputMode="numeric"
          status={error ? 'error' : undefined}
        />
        {error && <Text type="danger" style={{ fontSize: 12 }}>{error}</Text>}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <Button block onClick={onBack}>Voltar</Button>
        <Button block type="primary" onClick={handleSubmit}>Próximo</Button>
      </div>
    </div>
  );
};

export default PhoneNumberStep;
