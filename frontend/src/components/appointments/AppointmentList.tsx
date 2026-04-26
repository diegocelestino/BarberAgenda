import { useState } from 'react';
import { Button, Card, Tag, Typography, message, theme } from 'antd';
import { DeleteOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Appointment } from '../../services/appointmentsApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAppointment } from '../../store/appointments';
import { selectAllServices } from '../../store/services';
import DeleteAppointmentDialog from './DeleteAppointmentDialog';
import EditAppointmentDialog from './EditAppointmentDialog';
import { formatShortDateTime, formatDuration, isPast } from '../../utils/dateTime';

const { Text } = Typography;

interface Props { appointments: Appointment[]; barberId: string; }

const AppointmentList: React.FC<Props> = ({ appointments, barberId }) => {
  const { token } = theme.useToken();
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const getServiceName = (serviceId: string) => services.find(s => s.serviceId === serviceId)?.title || serviceId;
  const getStatusLabel = (s: string) => ({ scheduled: 'Agendado', completed: 'Concluído', cancelled: 'Cancelado' }[s] || s);
  const getStatusColor = (s: string) => ({ scheduled: 'processing', completed: 'success', cancelled: 'error' }[s] || 'default');

  const handleMarkComplete = async (appointmentId: string, startTime: number) => {
    if (!isPast(startTime)) { message.warning('Não é possível concluir um agendamento futuro'); return; }
    await dispatch(updateAppointment({ barberId, appointmentId, data: { status: 'completed' } }));
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {appointments.map((apt) => (
          <Card key={apt.appointmentId} size="small"
            style={{ opacity: apt.status === 'cancelled' ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <Text strong style={{ fontSize: 14 }}>{apt.customerName}</Text>
                  <Tag color={getStatusColor(apt.status)} style={{ margin: 0 }}>{getStatusLabel(apt.status)}</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  {formatShortDateTime(apt.startTime)} • {formatDuration(apt.startTime, apt.endTime)}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{getServiceName(apt.service)}</Text>
                {apt.customerPhone && <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>📞 {apt.customerPhone}</Text>}
                {apt.notes && <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Nota: {apt.notes}</Text>}
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {apt.status === 'scheduled' && isPast(apt.startTime) && (
                  <Button type="text" size="small" style={{ color: token.colorSuccess }} icon={<CheckCircleOutlined />}
                    onClick={() => handleMarkComplete(apt.appointmentId, apt.startTime)} />
                )}
                <Button type="text" size="small" icon={<EditOutlined />}
                  onClick={() => { setSelectedAppointment(apt); setEditDialogOpen(true); }} />
                <Button type="text" size="small" danger icon={<DeleteOutlined />}
                  onClick={() => { setSelectedAppointmentId(apt.appointmentId); setDeleteDialogOpen(true); }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <DeleteAppointmentDialog open={deleteDialogOpen} barberId={barberId} appointmentId={selectedAppointmentId}
        onConfirm={() => { setDeleteDialogOpen(false); setSelectedAppointmentId(null); }} onCancel={() => setDeleteDialogOpen(false)} />
      <EditAppointmentDialog open={editDialogOpen} appointment={selectedAppointment} barberId={barberId}
        onClose={() => setEditDialogOpen(false)} onSuccess={() => { setEditDialogOpen(false); setSelectedAppointment(null); }} />
    </>
  );
};

export default AppointmentList;
