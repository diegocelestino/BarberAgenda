import { useState, useEffect, useCallback } from 'react';
import { Alert, Button, Col, Row, Spin, Tag, Typography, theme } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppSelector } from '../../store/hooks';
import { barberApi } from '../../services/api';

const { Title, Text } = Typography;

interface TimeSelectionStepProps {
  onNext: (time: string) => void;
  onBack: () => void;
  selectedDate: Date;
  barberId: string;
  serviceId: string;
  selectedTime?: string;
}

const TimeSelectionStep: React.FC<TimeSelectionStepProps> = ({
  onNext, onBack, selectedDate, barberId, serviceId, selectedTime,
}) => {
  const { token } = theme.useToken();
  const [time, setTime] = useState<string | null>(selectedTime || null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedService = useAppSelector((state) =>
    state.services.services.find(s => s.serviceId === serviceId)
  );

  const loadAvailableTimes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const serviceDuration = selectedService?.durationMinutes || selectedService?.duration || 30;
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      const slots = await barberApi.getAvailableSlots(barberId, dateString, serviceDuration);
      setAvailableTimes(slots);
    } catch (err) {
      console.error('Error loading available times:', err);
      setError('Erro ao carregar horários disponíveis. Por favor, tente novamente.');
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, barberId, selectedService]);

  useEffect(() => {
    loadAvailableTimes();
  }, [loadAvailableTimes]);

  const handleNext = () => {
    if (time) onNext(time);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <ClockCircleOutlined style={{ fontSize: 32, color: token.colorPrimary, marginRight: 16 }} />
        <Title level={4} style={{ margin: 0 }}>Escolha um Horário</Title>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Horários disponíveis para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </Text>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
        {availableTimes.length > 0
          ? 'Selecione o horário de sua preferência'
          : 'Não há horários disponíveis para esta data. Por favor, selecione outra data.'}
      </Text>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      {availableTimes.length > 0 ? (
        <div style={{ marginBottom: 16, maxHeight: 300, overflowY: 'auto' }}>
          <Row gutter={[8, 8]}>
            {availableTimes.map((timeSlot) => (
              <Col xs={8} sm={6} key={timeSlot}>
                <Tag
                  color={time === timeSlot ? 'gold' : undefined}
                  onClick={() => setTime(timeSlot)}
                  style={{ width: '100%', textAlign: 'center', cursor: 'pointer', padding: '4px 0', fontSize: 13 }}
                >
                  {timeSlot}
                </Tag>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <div style={{ marginBottom: 16, padding: 16, textAlign: 'center', borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
          <Text type="secondary">Todos os horários estão reservados para esta data</Text>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16 }}>
        <Button block onClick={onBack}>Voltar</Button>
        <Button block type="primary" onClick={handleNext} disabled={!time}>Próximo</Button>
      </div>
    </div>
  );
};

export default TimeSelectionStep;
