import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchBarberById,
  selectSelectedBarber,
  selectBarbersLoading,
  selectBarbersError,
  clearSelectedBarber,
} from '../../store/barbers';
import { 
  fetchAppointmentsByBarber,
  selectAllAppointments,
  selectAppointmentsLoading,
  clearAppointments 
} from '../../store/appointments';
import AppointmentNavigationCard from '../appointments/AppointmentNavigationCard';

const BarberDetails: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);
  const appointments = useAppSelector(selectAllAppointments);
  const appointmentsLoading = useAppSelector(selectAppointmentsLoading);

  useEffect(() => {
    if (barberId) {
      dispatch(fetchBarberById(barberId));
      
      // Fetch appointments for the next 30 days
      const startDate = Date.now();
      const endDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
      dispatch(fetchAppointmentsByBarber({ barberId, params: { startDate, endDate } }));
    }
    
    return () => {
      dispatch(clearSelectedBarber());
      dispatch(clearAppointments());
    };
  }, [barberId, dispatch]);

  // Get all scheduled appointments sorted by time
  const scheduledAppointments = appointments
    .filter(apt => apt.status === 'scheduled' && apt.startTime >= Date.now())
    .sort((a, b) => a.startTime - b.startTime);

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

  const menuOptions = [
    {
      title: 'Agenda',
      description: 'Ver e gerenciar agendamentos',
      icon: <CalendarMonthIcon sx={{ fontSize: 48 }} />,
      path: `/admin/barbers/${barberId}/appointments`,
      color: '#ed6c02',
    },
    {
      title: 'Detalhes',
      description: 'Editar informações do barbeiro',
      icon: <PersonIcon sx={{ fontSize: 48 }} />,
      path: `/admin/barbers/${barberId}/edit`,
      color: '#1976d2',
    },
    {
      title: 'Expediente',
      description: 'Gerenciar horários de trabalho',
      icon: <ScheduleIcon sx={{ fontSize: 48 }} />,
      path: `/admin/barbers/${barberId}/schedule`,
      color: '#2e7d32',
    },
  ];

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/admin/barbers')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h2">
          {barber.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Next Appointment Card */}
        <Grid item xs={12}>
          <AppointmentNavigationCard
            appointments={scheduledAppointments}
            barberId={barberId || ''}
            loading={appointmentsLoading}
          />
        </Grid>

        {/* Agenda Card - Full Width */}
        <Grid item xs={12}>
          <Card 
            elevation={2}
            sx={{
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <CardActionArea 
              onClick={() => navigate(menuOptions[0].path)}
              sx={{ p: 2 }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: menuOptions[0].color, mb: 2 }}>
                  {menuOptions[0].icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {menuOptions[0].title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {menuOptions[0].description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* Detalhes and Expediente Buttons */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={menuOptions[1].icon}
              onClick={() => navigate(menuOptions[1].path)}
              sx={{ py: 2 }}
            >
              {menuOptions[1].title}
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={menuOptions[2].icon}
              onClick={() => navigate(menuOptions[2].path)}
              sx={{ py: 2 }}
            >
              {menuOptions[2].title}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BarberDetails;
