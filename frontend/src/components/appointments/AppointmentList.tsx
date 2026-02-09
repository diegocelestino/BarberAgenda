import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Appointment } from '../../services/appointmentsApi';
import { useAppDispatch } from '../../store/hooks';
import { deleteAppointment, updateAppointment } from '../../store/appointments';
import DeleteAppointmentDialog from './DeleteAppointmentDialog';
import EditAppointmentDialog from './EditAppointmentDialog';

interface AppointmentListProps {
  appointments: Appointment[];
  barberId: string;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, barberId }) => {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleDeleteClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    setSelectedAppointmentId(null);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleMarkComplete = async (appointmentId: string, startTime: number) => {
    // Validate that appointment has started
    if (startTime > Date.now()) {
      alert('Cannot mark an appointment as completed before it happens');
      return;
    }

    await dispatch(updateAppointment({
      barberId,
      appointmentId,
      data: { status: 'completed' },
    }));
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: number, end: number) => {
    const minutes = Math.round((end - start) / (1000 * 60));
    return `${minutes} min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <List>
        {appointments.map((appointment, index) => (
          <Box key={appointment.appointmentId}>
            {index > 0 && <Divider />}
            <ListItem
              sx={{
                py: 2,
                opacity: appointment.status === 'cancelled' ? 0.6 : 1,
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" component="span">
                      {appointment.customerName}
                    </Typography>
                    <Chip
                      label={appointment.status}
                      size="small"
                      color={getStatusColor(appointment.status)}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(appointment.startTime)} • {formatDuration(appointment.startTime, appointment.endTime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.service}
                    </Typography>
                    {appointment.customerPhone && (
                      <Typography variant="body2" color="text.secondary">
                        📞 {appointment.customerPhone}
                      </Typography>
                    )}
                    {appointment.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Note: {appointment.notes}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {appointment.status === 'scheduled' && appointment.startTime <= Date.now() && (
                    <IconButton
                      edge="end"
                      size="small"
                      color="success"
                      onClick={() => handleMarkComplete(appointment.appointmentId, appointment.startTime)}
                      title="Mark as completed"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleEditClick(appointment)}
                    title="Edit appointment"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(appointment.appointmentId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          </Box>
        ))}
      </List>

      <DeleteAppointmentDialog
        open={deleteDialogOpen}
        barberId={barberId}
        appointmentId={selectedAppointmentId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <EditAppointmentDialog
        open={editDialogOpen}
        appointment={selectedAppointment}
        barberId={barberId}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default AppointmentList;
