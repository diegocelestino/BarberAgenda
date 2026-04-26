import { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Spin, Tag, Typography, theme } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { barberApi } from '../../services/api';

const { Title, Text } = Typography;

interface ServiceSelectionStepProps {
  onNext: (serviceId: string, service: any) => void;
  onBack: () => void;
  selectedServiceId?: string;
  barberId: string;
}

const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({ onNext, onBack, selectedServiceId, barberId }) => {
  const { token } = theme.useToken();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const barberServices = await barberApi.getServices(barberId);
        setServices(barberServices);
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, [barberId]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spin size="large" /></div>;
  }

  if (error) {
    return (
      <div>
        <Text type="danger">{error}</Text>
        <Button onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <ToolOutlined style={{ fontSize: 32, color: token.colorPrimary, marginRight: 16 }} />
        <Title level={4} style={{ margin: 0 }}>Escolha um Serviço</Title>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Qual serviço você deseja?
      </Text>

      <Row gutter={[16, 16]}>
        {services.map((service) => (
          <Col xs={24} sm={12} key={service.serviceId}>
            <Card
              hoverable
              onClick={() => onNext(service.serviceId, service)}
              style={{
                borderColor: selectedServiceId === service.serviceId ? token.colorPrimary : undefined,
                borderWidth: selectedServiceId === service.serviceId ? 2 : 1,
              }}
            >
              <Title level={5} style={{ margin: 0, marginBottom: 4 }}>{service.name}</Title>
              {service.description && (
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>{service.description}</Text>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Tag color="gold">R$ {service.price}</Tag>
                <Tag>{service.duration || service.durationMinutes} min</Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <Button block onClick={onBack}>Voltar</Button>
      </div>
    </div>
  );
};

export default ServiceSelectionStep;
