import { useState } from 'react';
import { Button, Input, Typography, theme } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface NameStepProps {
  onNext: (name: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const NameStep: React.FC<NameStepProps> = ({ onNext, onBack, initialValue = '' }) => {
  const { token } = theme.useToken();
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (name.trim().length < 2) {
      setError('Por favor, digite seu nome');
      return;
    }
    setError('');
    onNext(name.trim());
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <UserOutlined style={{ fontSize: 32, color: token.colorPrimary, marginRight: 16 }} />
        <Title level={4} style={{ margin: 0 }}>Digite seu Nome</Title>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Como devemos te chamar?
      </Text>

      <div style={{ marginBottom: 16 }}>
        <Input
          size="large"
          placeholder="João Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

export default NameStep;
