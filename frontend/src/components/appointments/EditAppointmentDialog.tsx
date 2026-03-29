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
import { fetchServices, selectAllServices, selectServicesLoading } from '../../store/services';
import { selectSelectedBarber } from '../../store/barbers';
import { Appointment } from '../../services/appointmentsApi';

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
  const allServices = useAppSelector(selectAllServices);
  const servicesLoading = useAppSelector(selectServicesLoading);
  const barber = useAppSelector(selectSelectedBarber);
  const appointments = useAppSelector((state) => state.appointments.appointments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    startTime: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
    notes: '',
  });

  useEffect(() => {
    if (open && allServices.length === 0) {
      dispatch(fetchServices());
    }
  }, [open, allServices.length, dispatch]);

  useEffect(() => {
    if (appointment) {
      // Service is already stored as ID, use it directly
      
      // Convert timestamp to Brazil timezone (UTC-3) for display
      const appointmentDate = new Date(appointment.startTime);
      
      // Format in Brazil timezone for datetime-local input
      const brazilDate = new Date(appointmentDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      const year = brazilDate.getFullYear();
      const month = String(brazilDate.getMonth() + 1).padStart(2, '0');
      const day = String(brazilDate.getDate()).padStart(2, '0');
      const hours = String(brazilDate.getHours()).padStart(2, '0');
      const minutes = String(brazilDate.getMinutes()).padStart(2, '0');
      const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      setFormData({
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone || '',
        serviceId: appointment.service, // Service is already an ID
        startTime: localDateTimeString,
        status: appointment.status,
        notes: appointment.notes || '',
      });
      setError(''); // Clear error when opening dialog
    }
  }, [appointment, allServices]);

  // Filter services to only show those offered by the barber
  const availableServices = barber
    ? allServices.filter(service => barber.serviceIds.includes(service.serviceId))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!appointment || !formData.serviceId) return;

    const selectedService = allServices.find(s => s.serviceId === formData.serviceId);
    if (!selectedService) {
      setError('Por favor, selecione um serviço válido');
      return;
    }

    // Parse datetime as Brazil timezone (UTC-3)
    // formData.startTime is in format "YYYY-MM-DDTHH:mm"
    const dateTimeString = formData.startTime + ':00-03:00'; // Add seconds and Brazil timezone
    const appointmentDateTime = new Date(dateTimeString);
    
    const startTime = appointmentDateTime.getTime();
    const endTime = startTime + selectedService.durationMinutes * 60 * 1000;
    const now = Date.now();

    // Validation: Cannot schedule in the past
    if (startTime < now && formData.status === 'scheduled') {
      setError('Não é possível agendar um compromisso no passado');
      return;
    }

    // Validation: Cannot complete an appointment before it happens
    if (formData.status === 'completed' && startTime > now) {
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
    return appointment.startTime > Date.now();
  };

  const isAppointmentInPast = () => {
    if (!appointment) return false;
    return appointment.startTime < Date.now();
  };

  const selectedService = allServices.find(s => s.serviceId === formData.serviceId);

  // Get current time in Brazil timezone for min attribute
  const getBrazilNowString = () => {
    const now = new Date();
    const brazilNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const year = brazilNow.getFullYear();
    const month = String(brazilNow.getMonth() + 1).padStart(2, '0');
    const day = String(brazilNow.getDate()).padStart(2, '0');
    const hours = String(brazilNow.getHours()).padStart(2, '0');
    const minutes = String(brazilNow.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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
              helperText={selectedService ? `Duração: ${selectedService.durationMinutes} minutos` : ''}
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
                    {service.title}
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
                min: formData.status === 'scheduled' ? getBrazilNowString() : undefined,
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
