import { useState } from 'react';
import { Button, List, Tag, Typography, theme } from 'antd';
import { DeleteOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Appointment } from '../../services/appointmentsApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAppointment } from '../../store/appointments';
import { selectAllServices } from '../../store/services';
import DeleteAppointmentDialog from './DeleteAppointmentDialog';
import EditAppointmentDialog from './EditAppointmentDialog';
import { formatShortDateTime, formatDuration, isPast } from '../../utils/dateTime';

const { Text } = Typography;

interface AppointmentListProps {
  appointments: Appointment[];
  barberId: string;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, barberId }) => {
  const { token } = theme.useToken();
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const getServiceName = (serviceId: string) => services.find(s => s.serviceId === serviceId)?.title || serviceId;

  const getStatusLabel = (status: string) => {
    switch (status) { case 'scheduled': return 'Agendado'; case 'completed': return 'Concluído'; case 'cancelled': return 'Cancelado'; default: return status; }
  };
  const getStatusColor = (status: string) => {
    switch (status) { case 'scheduled': return 'processing'; case 'completed': return 'success'; case 'cancelled': return 'error'; default: return 'default'; }
  };

  const handleMarkComplete = async (appointmentId: string, startTime: number) => {
    if (!isPast(startTime)) { alert('Não é possível marcar um agendamento como concluído antes que ele aconteça'); return; }
    await dispatch(updateAppointment({ barberId, appointmentId, data: { status: 'completed' } }));
  };

  return (
    <>
      <List
        dataSource={appointments}
        renderItem={(appointment) => (
          <List.Item
            style={{ opacity: appointment.status === 'cancelled' ? 0.6 : 1 }}
            actions={[
              ...(appointment.status === 'scheduled' && isPast(appointment.startTime) ? [
                <Button key="complete" type="text" size="small" style={{ color: token.colorSuccess }} icon={<CheckCircleOutlined />}
                  onClick={() => handleMarkComplete(appointment.appointmentId, appointment.startTime)} title="Marcar como concluído" />
              ] : []),
              <Button key="edit" type="text" size="small" icon={<EditOutlined />}
                onClick={() => { setSelectedAppointment(appointment); setEditDialogOpen(true); }} title="Editar agendamento" />,
              <Button key="delete" type="text" size="small" danger icon={<DeleteOutlined />}
                onClick={() => { setSelectedAppointmentId(appointment.appointmentId); setDeleteDialogOpen(true); }} />,
            ]}
          >
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{appointment.customerName}</span>
                  <Tag color={getStatusColor(appointment.status)}>{getStatusLabel(appointment.status)}</Tag>
                </div>
              }
              description={
                <div>
                  <Text type="secondary">{formatShortDateTime(appointment.startTime)} • {formatDuration(appointment.startTime, appointment.endTime)}</Text>
                  <br /><Text type="secondary">{getServiceName(appointment.service)}</Text>
                  {appointment.customerPhone && <><br /><Text type="secondary">📞 {appointment.customerPhone}</Text></>}
                  {appointment.notes && <><br /><Text type="secondary">Nota: {appointment.notes}</Text></>}
                </div>
              }
            />
          </List.Item>
        )}
      />

      <DeleteAppointmentDialog open={deleteDialogOpen} barberId={barberId} appointmentId={selectedAppointmentId}
        onConfirm={() => { setDeleteDialogOpen(false); setSelectedAppointmentId(null); }}
        onCancel={() => setDeleteDialogOpen(false)} />

      <EditAppointmentDialog open={editDialogOpen} appointment={selectedAppointment} barberId={barberId}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={() => { setEditDialogOpen(false); setSelectedAppointment(null); }} />
    </>
  );
};

export default AppointmentList;
