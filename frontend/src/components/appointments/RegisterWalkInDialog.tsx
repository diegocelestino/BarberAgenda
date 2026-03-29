import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAppointment, updateAppointment } from '../../store/appointments';
import { fetchServices, selectAllServices, selectServicesLoading } from '../../store/services';

interface RegisterWalkInDialogProps {
  open: boolean;
  barberId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterWalkInDialog: React.FC<RegisterWalkInDialogProps> = ({
  open,
  barberId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const servicesLoading = useAppSelector(selectServicesLoading);

  const [customerName, setCustomerName] = useState('LOJA');
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (services.length === 0) {
      dispatch(fetchServices());
    }
  }, [services.length, dispatch]);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setCustomerName('LOJA');
      setSelectedService('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim() || !selectedService) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const now = Date.now();
      
      // selectedService already contains the serviceId
      
      // Create the appointment
      const createdAppointment = await dispatch(
        createAppointment({
          barberId,
          data: {
            customerName: customerName.trim(),
            customerPhone: '',
            service: selectedService, // Send service ID directly
            startTime: now,
            endTime: now + 1000, // 1 second after start
            notes: 'Atendimento sem agendamento',
          },
        })
      ).unwrap();

      // Immediately mark it as completed
      await dispatch(
        updateAppointment({
          barberId,
          appointmentId: createdAppointment.appointmentId,
          data: { status: 'completed' },
        })
      ).unwrap();

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar atendimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Registrar Atendimento</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Nome do Cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              fullWidth
              helperText="Padrão: LOJA (pode ser editado)"
            />

            {servicesLoading ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={20} />
                <span>Carregando serviços...</span>
              </Stack>
            ) : services.length === 0 ? (
              <Alert severity="warning">
                Nenhum serviço disponível. Por favor, crie serviços primeiro.
              </Alert>
            ) : (
              <TextField
                select
                label="Serviço Realizado"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required
                fullWidth
              >
                {services.map((service) => (
                  <MenuItem key={service.serviceId} value={service.serviceId}>
                    {service.title} - R$ {service.price} ({service.duration} min)
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || servicesLoading || services.length === 0}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegisterWalkInDialog;
