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
import { now, getWeekBounds, addDays } from '../../utils/dateTime';

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
      const nowTimestamp = now();
      const { startOfWeek, endOfWeek } = getWeekBounds(nowTimestamp);
      
      let startDate: number;
      let endDate: number;
      
      if (filter === 'thisWeek') {
        startDate = startOfWeek;
        endDate = endOfWeek;
      } else {
        // 'next' - all appointments after this week
        startDate = endOfWeek + 1;
        endDate = addDays(nowTimestamp, 365); // Next year
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
