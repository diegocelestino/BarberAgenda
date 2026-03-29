import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Container,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBarberById,
  selectSelectedBarber,
  selectBarbersLoading,
  selectBarbersError,
  clearSelectedBarber,
} from '../store/barbers';
import { clearAppointments } from '../store/appointments';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';

const BarberAppointmentsPage: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);

  useEffect(() => {
    if (barberId) {
      dispatch(fetchBarberById(barberId));
    }
    
    return () => {
      dispatch(clearSelectedBarber());
      dispatch(clearAppointments());
    };
  }, [barberId, dispatch]);

  if (loading && !barber) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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

  if (!barber) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Barbeiro não encontrado
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(`/admin/barber/${barberId}`)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h2">
            Agenda - {barber.name}
          </Typography>
        </Box>

        <AppointmentCalendar />
      </Paper>
    </Container>
  );
};

export default BarberAppointmentsPage;
