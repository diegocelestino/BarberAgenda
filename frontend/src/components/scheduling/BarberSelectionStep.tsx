import { useEffect } from 'react';
import { Avatar, Button, Card, Col, Row, Spin, Typography, theme } from 'antd';
import { ScissorOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBarbers } from '../../store/barbers/barbersThunks';
import { selectAllBarbers, selectBarbersLoading } from '../../store/barbers/barbersSelectors';

const { Title, Text } = Typography;

interface BarberSelectionStepProps {
  onNext: (barberId: string) => void;
  onBack: () => void;
  selectedBarberId?: string;
}

const BarberSelectionStep: React.FC<BarberSelectionStepProps> = ({ onNext, onBack, selectedBarberId }) => {
  const { token } = theme.useToken();
  const dispatch = useAppDispatch();
  const barbers = useAppSelector(selectAllBarbers);
  const loading = useAppSelector(selectBarbersLoading);

  useEffect(() => {
    dispatch(fetchBarbers());
  }, [dispatch]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <ScissorOutlined style={{ fontSize: 32, color: token.colorPrimary, marginRight: 16 }} />
        <Title level={4} style={{ margin: 0 }}>Escolha seu Barbeiro</Title>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Selecione o barbeiro de sua preferência
      </Text>

      <Row gutter={[16, 16]}>
        {barbers.map((barber) => (
          <Col xs={24} sm={12} key={barber.barberId}>
            <Card
              hoverable
              onClick={() => onNext(barber.barberId)}
              style={{
                borderColor: selectedBarberId === barber.barberId ? token.colorPrimary : undefined,
                borderWidth: selectedBarberId === barber.barberId ? 2 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar size={56} style={{ backgroundColor: token.colorPrimary }}>
                  {barber.name.charAt(0)}
                </Avatar>
                <div>
                  <Title level={5} style={{ margin: 0 }}>{barber.name}</Title>
                  <Text type="secondary">Avaliação: {barber.rating}/5</Text>
                </div>
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

export default BarberSelectionStep;
