import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAppointment, selectAppointmentsLoading, selectAppointmentsError } from '../../store/appointments';
import { barberApi } from '../../services/api';

interface CreateAppointmentDialogProps {
  open: boolean;
  barberId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAppointmentDialog: React.FC<CreateAppointmentDialogProps> = ({
  open,
  barberId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppointmentsLoading);
  const error = useAppSelector(selectAppointmentsError);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      if (!open) return;
      
      try {
        setServicesLoading(true);
        setServicesError(null);
        const services = await barberApi.getServices(barberId);
        setAvailableServices(services);
      } catch (err) {
        console.error('Error loading services:', err);
        setServicesError('Failed to load services');
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, [open, barberId]);

  const getSelectedService = () => {
    return availableServices.find(s => s.serviceId === selectedServiceId);
  };

  const handleSubmit = async () => {
    if (!customerName || !date || !startTime || !selectedServiceId) {
      return;
    }

    const selectedService = getSelectedService();
    if (!selectedService) {
      return;
    }

    const serviceDuration = selectedService.durationMinutes || selectedService.duration;
    if (!serviceDuration) {
      return;
    }

    // Parse date and time in Brazil timezone (UTC-3)
    // Format: YYYY-MM-DD and HH:mm
    const dateTimeString = `${date}T${startTime}:00-03:00`;
    const appointmentDateTime = new Date(dateTimeString);
    
    const startDateTime = appointmentDateTime.getTime();
    const endDateTime = startDateTime + serviceDuration * 60 * 1000;
    const now = Date.now();

    // Validation: Cannot schedule in the past
    if (startDateTime < now) {
      alert('Cannot schedule an appointment in the past');
      return;
    }

    // Validation: End time must be after start time
    if (endDateTime <= startDateTime) {
      alert('Invalid duration');
      return;
    }

    try {
      await dispatch(
        createAppointment({
          barberId,
          data: {
            customerName,
            customerPhone,
            startTime: startDateTime,
            endTime: endDateTime,
            service: selectedServiceId, // Send service ID
            notes,
          },
        })
      ).unwrap();

      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setDate('');
      setStartTime('');
      setSelectedServiceId('');
      setNotes('');
      
      onSuccess();
    } catch (err) {
      console.error('Failed to create appointment:', err);
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setCustomerPhone('');
    setDate('');
    setStartTime('');
    setSelectedServiceId('');
    setNotes('');
    onClose();
  };

  const selectedService = getSelectedService();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Appointment</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {servicesError && <Alert severity="error">{servicesError}</Alert>}
          
          <TextField
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Phone Number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Service"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            required
            fullWidth
            disabled={servicesLoading}
            helperText={selectedService ? `Duration: ${selectedService.durationMinutes || selectedService.duration} minutes` : ''}
          >
            {servicesLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} /> Loading services...
              </MenuItem>
            ) : availableServices.length === 0 ? (
              <MenuItem disabled>No services available for this barber</MenuItem>
            ) : (
              availableServices.map((service) => (
                <MenuItem key={service.serviceId} value={service.serviceId}>
                  {service.title || service.name}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date().toISOString().split('T')[0],
            }}
          />

          <TextField
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !customerName || !date || !startTime || !selectedServiceId}
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAppointmentDialog;
