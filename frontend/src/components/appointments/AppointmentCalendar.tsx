import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAppointmentsByBarber,
  selectAllAppointments,
  selectAppointmentsLoading,
  selectAppointmentsError,
} from '../../store/appointments';
import AppointmentList from './AppointmentList';
import CreateAppointmentDialog from './CreateAppointmentDialog';

const AppointmentCalendar: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(selectAllAppointments);
  const loading = useAppSelector(selectAppointmentsLoading);
  const error = useAppSelector(selectAppointmentsError);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (barberId) {
      // Fetch appointments for the next 30 days
      const startDate = Date.now();
      const endDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
      dispatch(fetchAppointmentsByBarber({ barberId, params: { startDate, endDate } }));
    }
  }, [barberId, dispatch]);

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
  };

  if (loading && appointments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Appointments
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`${scheduledCount} Scheduled`} color="primary" size="small" />
            <Chip label={`${completedCount} Completed`} color="success" size="small" />
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New
        </Button>
      </Box>

      {appointments.length === 0 ? (
        <Alert severity="info">
          No appointments scheduled. Click "New" to create one.
        </Alert>
      ) : (
        <AppointmentList appointments={appointments} barberId={barberId || ''} />
      )}

      <CreateAppointmentDialog
        open={createDialogOpen}
        barberId={barberId || ''}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Paper>
  );
};

export default AppointmentCalendar;
