import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Card, Spin, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAppointmentsByBarber, selectAllAppointments,
  selectAppointmentsLoading, selectAppointmentsError,
} from '../../store/appointments';
import AppointmentList from './AppointmentList';
import CreateAppointmentDialog from './CreateAppointmentDialog';
import { now, getWeekBounds, addDays } from '../../utils/dateTime';

const { Title } = Typography;

type FilterType = 'thisWeek' | 'next';

const AppointmentCalendar: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(selectAllAppointments);
  const loading = useAppSelector(selectAppointmentsLoading);
  const error = useAppSelector(selectAppointmentsError);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('thisWeek');

  useEffect(() => {
    if (barberId) {
      const nowTs = now();
      const { startOfWeek, endOfWeek } = getWeekBounds(nowTs);
      const [startDate, endDate] = filter === 'thisWeek'
        ? [startOfWeek, endOfWeek]
        : [endOfWeek + 1, addDays(nowTs, 365)];
      dispatch(fetchAppointmentsByBarber({ barberId, params: { startDate, endDate, sortBy: 'startTime', sortOrder: 'asc' } }));
    }
  }, [barberId, dispatch, filter]);

  if (loading && appointments.length === 0) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><Spin size="large" /></div>;
  if (error) return <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />;

  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <Card style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, marginBottom: 8 }}>Agendamentos</Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tag color="processing">{scheduledCount} Agendados</Tag>
            <Tag color="success">{completedCount} Concluídos</Tag>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDialogOpen(true)}>Novo</Button>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 4 }}>
        <Button type={filter === 'thisWeek' ? 'primary' : 'default'} size="small" onClick={() => setFilter('thisWeek')}>Esta Semana</Button>
        <Button type={filter === 'next' ? 'primary' : 'default'} size="small" onClick={() => setFilter('next')}>Próximos</Button>
      </div>

      {appointments.length === 0 ? (
        <Alert type="info" message='Nenhum agendamento encontrado. Clique em "Novo" para criar um.' showIcon />
      ) : (
        <AppointmentList appointments={appointments} barberId={barberId || ''} />
      )}

      <CreateAppointmentDialog open={createDialogOpen} barberId={barberId || ''} onClose={() => setCreateDialogOpen(false)} onSuccess={() => setCreateDialogOpen(false)} />
    </Card>
  );
};

export default AppointmentCalendar;
