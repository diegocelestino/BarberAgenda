import { useState } from 'react';
import { Button, Calendar, Typography, theme } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { startOfDay } from 'date-fns';
import { getMaxBookingDate } from '../../config/businessHours';
import { useAppSelector } from '../../store/hooks';
import { selectBarberById } from '../../store/barbers/barbersSelectors';

dayjs.locale('pt-br');

const { Title, Text } = Typography;

interface DateSelectionStepProps {
  onNext: (date: Date) => void;
  onBack: () => void;
  selectedDate?: Date;
  barberId: string;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({ onNext, onBack, selectedDate, barberId }) => {
  const { token } = theme.useToken();
  const [date, setDate] = useState<Dayjs | null>(selectedDate ? dayjs(selectedDate) : null);
  const barber = useAppSelector((state) => selectBarberById(state, barberId));

  const workDays = barber?.schedule?.workDays ?? [1, 2, 3, 4, 5, 6];
  const minDate = dayjs();
  const maxDate = dayjs(getMaxBookingDate());

  const disabledDate = (current: Dayjs) => {
    if (current.isBefore(minDate, 'day') || current.isAfter(maxDate, 'day')) return true;

    if (!workDays.includes(current.day())) return true;

    const now = new Date();
    const isToday = startOfDay(current.toDate()).getTime() === startOfDay(now).getTime();
    if (isToday && barber?.schedule) {
      const [closeH, closeM] = barber.schedule.closeTime.split(':').map(Number);
      const closingTime = new Date(now);
      closingTime.setHours(closeH, closeM, 0, 0);
      if (now.getTime() >= closingTime.getTime() - 60 * 60 * 1000) return true;
    }

    return false;
  };

  const handleNext = () => {
    if (date) onNext(date.toDate());
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <CalendarOutlined style={{ fontSize: 32, color: token.colorPrimary, marginRight: 16 }} />
        <Title level={4} style={{ margin: 0 }}>Escolha uma Data</Title>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Selecione a data de sua preferência
      </Text>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <Calendar
          fullscreen={false}
          value={date || undefined}
          disabledDate={disabledDate}
          onSelect={(value) => {
            if (!disabledDate(value)) setDate(value);
          }}
          style={{ maxWidth: 400, borderRadius: 8 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <Button block onClick={onBack}>Voltar</Button>
        <Button block type="primary" onClick={handleNext} disabled={!date}>Próximo</Button>
      </div>
    </div>
  );
};

export default DateSelectionStep;
