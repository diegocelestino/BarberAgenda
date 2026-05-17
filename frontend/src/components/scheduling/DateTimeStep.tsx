import React, { useEffect, useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import TimelineView, { TimelineAppointment } from '../../modules/admin/components/TimelineView';
import { appointmentsApi } from '../../services/appointmentsApi';
import { useAppSelector } from '../../store/hooks';

const { Text, Title } = Typography;

interface DateTimeStepProps {
  onNext: (date: Date, time: string) => void;
  onBack: () => void;
  barberId: string;
  serviceId: string;
  selectedDate?: Date;
  selectedTime?: string;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({ onNext, onBack, barberId, serviceId, selectedDate, selectedTime: initialTime }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate ? dayjs(selectedDate) : dayjs());
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime || null);
  const [appointments, setAppointments] = useState<TimelineAppointment[]>([]);

  const services = useAppSelector((state) => state.services.services);
  const service = services.find((s: any) => s.serviceId === serviceId);
  const duration = service?.duration || service?.durationMinutes || 30;
  const serviceNameMap = new Map(services.map((s: any) => [s.serviceId, s.name]));

  const fetchDay = async (date: dayjs.Dayjs) => {
    const startOfDay = date.startOf('day').valueOf();
    const endOfDay = date.endOf('day').valueOf();
    try {
      const appts = await appointmentsApi.getByBarber(barberId, { startDate: startOfDay, endDate: endOfDay });
      setAppointments(appts.map((a) => ({
        id: a.appointmentId,
        startTime: a.startTime,
        endTime: a.endTime,
        customer: a.customerName,
        phone: '',
        service: serviceNameMap.get(a.service) || a.service,
        barber: '',
        status: (a.status === 'scheduled' ? 'confirmed' : a.status === 'completed' ? 'in-progress' : 'cancelled') as TimelineAppointment['status'],
      })));
    } catch {
      setAppointments([]);
    }
  };

  useEffect(() => { fetchDay(currentDate); }, [currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigateDay = (offset: number) => {
    const newDate = currentDate.add(offset, 'day');
    setCurrentDate(newDate);
    setSelectedTime(null);
  };

  const formatDate = (date: dayjs.Dayjs) =>
    date.toDate().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <Title level={4} style={{ marginBottom: 4 }}>Escolha o horário</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>Clique na agenda para selecionar o horário desejado.</Text>

      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'center' }}>
        <Button icon={<LeftOutlined />} onClick={() => navigateDay(-1)} />
        <Button onClick={() => { setCurrentDate(dayjs()); setSelectedTime(null); }}>Hoje</Button>
        <Button icon={<RightOutlined />} onClick={() => navigateDay(1)} />
      </Space>

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <Text strong style={{ textTransform: 'capitalize' }}>{formatDate(currentDate)}</Text>
      </div>

      <div style={{ height: 'calc(100vh - 380px)', minHeight: 250 }}>
        <TimelineView
          appointments={appointments}
          startHour={8}
          endHour={21}
          onSlotClick={setSelectedTime}
          selectedSlot={selectedTime}
          selectedDuration={duration}
          hideDetails
        />
      </div>

      <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 16 }}>
        <Button onClick={onBack}>Voltar</Button>
        <Button
          type="primary"
          disabled={!selectedTime}
          onClick={() => selectedTime && onNext(currentDate.toDate(), selectedTime)}
        >
          {selectedTime ? `Confirmar ${selectedTime}` : 'Selecione um horário'}
        </Button>
      </Space>
    </div>
  );
};

export default DateTimeStep;
