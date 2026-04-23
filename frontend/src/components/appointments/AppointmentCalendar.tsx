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
  ToggleButton,
  ToggleButtonGroup,
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

type FilterType = 'thisWeek' | 'next';

const getWeekBounds = (date: Date) => {
  // Week starts on Sunday (0) and ends on Saturday (6)
  const current = new Date(date);
  const dayOfWeek = current.getDay();
  
  // Start of week (Sunday at 00:00:00)
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // End of week (Saturday at 23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

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
      const now = new Date();
      const { startOfWeek, endOfWeek } = getWeekBounds(now);
      
      let startDate: number;
      let endDate: number;
      
      if (filter === 'thisWeek') {
        startDate = startOfWeek.getTime();
        endDate = endOfWeek.getTime();
      } else {
        // 'next' - all appointments after this week
        startDate = endOfWeek.getTime() + 1;
        endDate = Date.now() + 365 * 24 * 60 * 60 * 1000; // Next year
      }
      
      // Fetch all appointments (no status filter) sorted by time
      dispatch(fetchAppointmentsByBarber({ 
        barberId, 
        params: { 
          startDate, 
          endDate,
          sortBy: 'startTime',
          sortOrder: 'asc'
        } 
      }));
    }
  }, [barberId, dispatch, filter]);

  const handleFilterChange = (_event: React.MouseEvent<HTMLElement>, newFilter: FilterType | null) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Agendamentos
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`${scheduledCount} Agendados`} color="primary" size="small" />
            <Chip label={`${completedCount} Concluídos`} color="success" size="small" />
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Novo
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          aria-label="appointment filter"
          size="small"
        >
          <ToggleButton value="thisWeek" aria-label="this week">
            Esta Semana
          </ToggleButton>
          <ToggleButton value="next" aria-label="next appointments">
            Próximos
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {appointments.length === 0 ? (
        <Alert severity="info">
          Nenhum agendamento encontrado. Clique em "Novo" para criar um.
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
