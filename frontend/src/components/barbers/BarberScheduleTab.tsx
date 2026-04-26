import { useState } from 'react';
import { Button, Input, InputNumber, Typography, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateBarber, selectBarbersLoading } from '../../store/barbers';
import { BarberSchedule, Barber } from '../../services/api';

const { Text } = Typography;

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DEFAULT_SCHEDULE: BarberSchedule = {
  openTime: '09:00', closeTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00',
  workDays: [1, 2, 3, 4, 5, 6], slotInterval: 30,
};

interface Props { barber: Barber; }

const BarberScheduleTab: React.FC<Props> = ({ barber }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectBarbersLoading);
  const [schedule, setSchedule] = useState<BarberSchedule>(barber.schedule ?? DEFAULT_SCHEDULE);

  const handleChange = (field: keyof BarberSchedule, value: any) => {
    setSchedule((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: number) => {
    const newDays = schedule.workDays.includes(day)
      ? schedule.workDays.filter(d => d !== day)
      : [...schedule.workDays, day].sort();
    handleChange('workDays', newDays);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(updateBarber({ barberId: barber.barberId, data: { schedule } })).unwrap();
    message.success('Agenda salva com sucesso!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Dias de Trabalho</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {DAY_LABELS.map((label, index) => (
              <Button key={index} size="small"
                type={schedule.workDays.includes(index) ? 'primary' : 'default'}
                onClick={() => toggleDay(index)} style={{ minWidth: 48 }}>
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label>Horário de Abertura</label>
            <Input type="time" value={schedule.openTime} onChange={(e) => handleChange('openTime', e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label>Horário de Fechamento</label>
            <Input type="time" value={schedule.closeTime} onChange={(e) => handleChange('closeTime', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label>Início do Almoço</label>
            <Input type="time" value={schedule.lunchStart} onChange={(e) => handleChange('lunchStart', e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label>Fim do Almoço</label>
            <Input type="time" value={schedule.lunchEnd} onChange={(e) => handleChange('lunchEnd', e.target.value)} />
          </div>
        </div>

        <div>
          <label>Intervalo de Horários (minutos)</label>
          <InputNumber min={15} max={120} step={15} value={schedule.slotInterval}
            onChange={(v) => handleChange('slotInterval', v || 30)} style={{ width: '100%' }} />
        </div>

        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} block
          disabled={loading || schedule.workDays.length === 0}>
          {loading ? 'Salvando...' : 'Salvar Agenda'}
        </Button>
      </div>
    </form>
  );
};

export default BarberScheduleTab;
