import { useEffect, useState } from 'react';
import { Alert, Button, Spin, Tag, message } from 'antd';
import { PlusOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAppointmentsByBarber, selectAllAppointments,
  selectAppointmentsLoading, selectAppointmentsError,
} from '../../store/appointments';
import AppointmentList from './AppointmentList';
import CreateAppointmentDialog from './CreateAppointmentDialog';
import RegisterWalkInDialog from './RegisterWalkInDialog';
import { useIsMobile } from '../../hooks/useIsMobile';
import { now, getWeekBounds, addDays } from '../../utils/dateTime';

type FilterType = 'thisWeek' | 'next';

interface Props { barberId?: string; fabTrigger?: number; }

const AppointmentCalendar: React.FC<Props> = ({ barberId: barberIdProp, fabTrigger }) => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const appointments = useAppSelector(selectAllAppointments);
  const loading = useAppSelector(selectAppointmentsLoading);
  const error = useAppSelector(selectAppointmentsError);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('thisWeek');

  // Open create dialog when FAB is pressed
  useEffect(() => { if (fabTrigger && fabTrigger > 0) setCreateDialogOpen(true); }, [fabTrigger]);

  useEffect(() => {
    if (barberIdProp) {
      const nowTs = now();
      const { startOfWeek, endOfWeek } = getWeekBounds(nowTs);
      const [startDate, endDate] = filter === 'thisWeek'
        ? [startOfWeek, endOfWeek]
        : [endOfWeek + 1, addDays(nowTs, 365)];
      dispatch(fetchAppointmentsByBarber({ barberId: barberIdProp, params: { startDate, endDate, sortBy: 'startTime', sortOrder: 'asc' } }));
    }
  }, [barberIdProp, dispatch, filter]);

  if (loading && appointments.length === 0) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><Spin size="large" /></div>;
  if (error) return <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />;

  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="processing">{scheduledCount} Agendados</Tag>
          <Tag color="success">{completedCount} Concluídos</Tag>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<PlusCircleOutlined />} onClick={() => setWalkInDialogOpen(true)}>Walk-in</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDialogOpen(true)}>Novo</Button>
          </div>
        )}
        {isMobile && (
          <Button size="small" icon={<PlusCircleOutlined />} onClick={() => setWalkInDialogOpen(true)}>Walk-in</Button>
        )}
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 4 }}>
        <Button type={filter === 'thisWeek' ? 'primary' : 'default'} size="small" onClick={() => setFilter('thisWeek')}>Esta Semana</Button>
        <Button type={filter === 'next' ? 'primary' : 'default'} size="small" onClick={() => setFilter('next')}>Próximos</Button>
      </div>

      {appointments.length === 0 ? (
        <Alert type="info" message='Nenhum agendamento encontrado.' showIcon />
      ) : (
        <AppointmentList appointments={appointments} barberId={barberIdProp || ''} />
      )}

      <CreateAppointmentDialog open={createDialogOpen} barberId={barberIdProp || ''} onClose={() => setCreateDialogOpen(false)} onSuccess={() => setCreateDialogOpen(false)} />
      <RegisterWalkInDialog open={walkInDialogOpen} barberId={barberIdProp || ''} onClose={() => setWalkInDialogOpen(false)} onSuccess={() => { setWalkInDialogOpen(false); message.success('Atendimento registrado!'); }} />
    </div>
  );
};

export default AppointmentCalendar;
