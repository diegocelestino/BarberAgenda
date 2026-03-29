import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAppointment } from '../../store/appointments';
import { selectAllServices } from '../../store/services';
import { Appointment } from '../../services/appointmentsApi';
import EditAppointmentDialog from './EditAppointmentDialog';

interface AppointmentNavigationCardProps {
  appointments: Appointment[];
  barberId: string;
  loading?: boolean;
  onAppointmentUpdate?: () => void;
}

const AppointmentNavigationCard: React.FC<AppointmentNavigationCardProps> = ({
  appointments,
  barberId,
  loading = false,
  onAppointmentUpdate,
}) => {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const getServiceName = (serviceId: string): string => {
    const service = services.find(s => s.serviceId === serviceId);
    return service ? service.title : serviceId;
  };

  // Reset index when appointments change
  useEffect(() => {
    setCurrentIndex(0);
  }, [appointments.length]);

  const currentAppointment = appointments[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < appointments.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleEditAppointment = () => {
    setEditDialogOpen(true);
  };

  const handleCompleteClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (!currentAppointment) return;

    setConfirmDialogOpen(false);

    try {
      await dispatch(
        updateAppointment({
          barberId,
          appointmentId: currentAppointment.appointmentId,
          data: { status: 'completed' },
        })
      ).unwrap();

      setSuccessMessage('Agendamento marcado como concluído!');
      setSuccessOpen(true);

      // Notify parent to refresh appointments
      if (onAppointmentUpdate) {
        onAppointmentUpdate();
      }

      // Don't manually change index - let useEffect reset it when appointments update
    } catch (err) {
      console.error('Failed to complete appointment:', err);
    }
  };

  const handleCompleteCancel = () => {
    setConfirmDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSuccessMessage('Agendamento atualizado com sucesso!');
    setSuccessOpen(true);
    
    // Notify parent to refresh appointments
    if (onAppointmentUpdate) {
      onAppointmentUpdate();
    }
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Carregando próximo agendamento...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!currentAppointment) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Alert severity="info" sx={{ border: 'none' }}>
            Nenhum agendamento próximo
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Próximo Agendamento
              </Typography>
              {appointments.length > 1 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({currentIndex + 1} de {appointments.length})
                </Typography>
              )}
            </Box>
            <Box>
              <IconButton 
                size="small" 
                onClick={handlePrevious} 
                disabled={!hasPrevious}
                title="Anterior"
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleNext} 
                disabled={!hasNext}
                title="Próximo"
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {currentAppointment.customerName}
          </Typography>
          <Stack spacing={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {formatDateTime(currentAppointment.startTime).date} às {formatDateTime(currentAppointment.startTime).time}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {getServiceName(currentAppointment.service)}
              </Typography>
            </Box>
            {currentAppointment.customerPhone && (
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {currentAppointment.customerPhone}
                </Typography>
              </Box>
            )}
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditAppointment}
              fullWidth
            >
              Editar
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleCompleteClick}
              fullWidth
            >
              Concluir
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {currentAppointment && (
        <EditAppointmentDialog
          open={editDialogOpen}
          appointment={currentAppointment}
          barberId={barberId}
          onClose={() => setEditDialogOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCompleteCancel}
      >
        <DialogTitle>Confirmar Conclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja marcar este agendamento como concluído?
          </DialogContentText>
          {currentAppointment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Cliente:</strong> {currentAppointment.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Serviço:</strong> {getServiceName(currentAppointment.service)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompleteCancel} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleCompleteConfirm} variant="contained" color="success" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AppointmentNavigationCard;
