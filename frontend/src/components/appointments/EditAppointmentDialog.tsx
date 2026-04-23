import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAppointment } from '../../store/appointments';
import { Appointment } from '../../services/appointmentsApi';
import { barberApi } from '../../services/api';
import { 
  formatDateTimeLocal, 
  parseDateTimeLocal, 
  addMinutes, 
  isPast, 
  isFuture, 
  getCurrentDateTimeLocal 
} from '../../utils/dateTime';

interface EditAppointmentDialogProps {
  open: boolean;
  appointment: Appointment | null;
  barberId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({
  open,
  appointment,
  barberId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const appointments = useAppSelector((state) => state.appointments.appointments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    startTime: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
    notes: '',
  });

  useEffect(() => {
    const loadServices = async () => {
      if (!open) return;
      
      try {
        setServicesLoading(true);
        const services = await barberApi.getServices(barberId);
        setAvailableServices(services);
      } catch (err) {
        console.error('Error loading services:', err);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, [open, barberId]);

  useEffect(() => {
    if (appointment) {
      // Format timestamp for datetime-local input using centralized utility
      const localDateTimeString = formatDateTimeLocal(appointment.startTime);
      
      setFormData({
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone || '',
        serviceId: appointment.service,
        startTime: localDateTimeString,
        status: appointment.status,
        notes: appointment.notes || '',
      });
      setError('');
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!appointment || !formData.serviceId) return;

    const selectedService = availableServices.find(s => s.serviceId === formData.serviceId);
    if (!selectedService) {
      setError('Por favor, selecione um serviço válido');
      return;
    }

    const serviceDuration = selectedService.durationMinutes || selectedService.duration;
    if (!serviceDuration) {
      setError('Serviço inválido - duração não encontrada');
      return;
    }

    // Parse datetime using centralized utility
    const startTime = parseDateTimeLocal(formData.startTime);
    const endTime = addMinutes(startTime, serviceDuration);

    // Validation: Cannot schedule in the past
    if (isPast(startTime) && formData.status === 'scheduled') {
      setError('Não é possível agendar um compromisso no passado');
      return;
    }

    // Validation: Cannot complete an appointment before it happens
    if (formData.status === 'completed' && isFuture(startTime)) {
      setError('Não é possível marcar um agendamento como concluído antes que ele aconteça');
      return;
    }

    // Check for conflicts with other appointments (excluding current one)
    const hasConflict = appointments.some((apt) => {
      // Skip the current appointment being edited
      if (apt.appointmentId === appointment.appointmentId) return false;
      
      // Skip cancelled appointments
      if (apt.status === 'cancelled') return false;
      
      // Skip if different barber
      if (apt.barberId !== barberId) return false;
      
      // Check for time overlap
      const aptStart = apt.startTime;
      const aptEnd = apt.endTime;
      
      // Overlap occurs if: new appointment starts before existing ends AND new appointment ends after existing starts
      return startTime < aptEnd && endTime > aptStart;
    });

    if (hasConflict) {
      setError('Este horário conflita com outro agendamento. Por favor, escolha outro horário.');
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateAppointment({
        barberId,
        appointmentId: appointment.appointmentId,
        data: {
          customerName: formData.customerName,
          customerPhone: formData.customerPhone || undefined,
          service: formData.serviceId, // Send service ID
          startTime,
          endTime,
          status: formData.status,
          notes: formData.notes || undefined,
        },
      })).unwrap();
      onSuccess();
    } catch (err: any) {
      console.error('Failed to update appointment:', err);
      setError(err.message || 'Erro ao atualizar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isAppointmentInFuture = () => {
    if (!appointment) return false;
    return isFuture(appointment.startTime);
  };

  const isAppointmentInPast = () => {
    if (!appointment) return false;
    return isPast(appointment.startTime);
  };

  const selectedService = availableServices.find(s => s.serviceId === formData.serviceId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Editar Agendamento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              label="Nome do Cliente"
              value={formData.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Telefone do Cliente"
              value={formData.customerPhone}
              onChange={(e) => handleChange('customerPhone', e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Serviço"
              value={formData.serviceId}
              onChange={(e) => handleChange('serviceId', e.target.value)}
              required
              fullWidth
              disabled={servicesLoading}
              helperText={selectedService ? `Duração: ${selectedService.durationMinutes || selectedService.duration} minutos` : ''}
            >
              {servicesLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} /> Carregando serviços...
                </MenuItem>
              ) : availableServices.length === 0 ? (
                <MenuItem disabled>Nenhum serviço disponível para este barbeiro</MenuItem>
              ) : (
                availableServices.map((service) => (
                  <MenuItem key={service.serviceId} value={service.serviceId}>
                    {service.title || service.name}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="Horário de Início"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: formData.status === 'scheduled' ? getCurrentDateTimeLocal() : undefined,
              }}
            />

            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              required
              fullWidth
            >
              <MenuItem value="scheduled" disabled={isAppointmentInPast()}>
                Agendado
              </MenuItem>
              <MenuItem value="completed" disabled={isAppointmentInFuture()}>
                Concluído
              </MenuItem>
              <MenuItem value="cancelled">Cancelado</MenuItem>
            </TextField>

            <TextField
              label="Notas"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditAppointmentDialog;
