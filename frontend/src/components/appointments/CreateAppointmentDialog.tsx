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
import { fetchServices, selectAllServices, selectServicesLoading } from '../../store/services';

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
  const services = useAppSelector(selectAllServices);
  const servicesLoading = useAppSelector(selectServicesLoading);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && services.length === 0) {
      dispatch(fetchServices());
    }
  }, [open, services.length, dispatch]);

  const getSelectedService = () => {
    return services.find(s => s.serviceId === selectedServiceId);
  };

  const handleSubmit = async () => {
    if (!customerName || !date || !startTime || !selectedServiceId) {
      return;
    }

    const selectedService = getSelectedService();
    if (!selectedService) {
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`).getTime();
    const endDateTime = startDateTime + selectedService.durationMinutes * 60 * 1000;
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
            service: selectedService.title,
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
            helperText={selectedService ? `Duration: ${selectedService.durationMinutes} minutes` : ''}
          >
            {servicesLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} /> Loading services...
              </MenuItem>
            ) : services.length === 0 ? (
              <MenuItem disabled>No services available</MenuItem>
            ) : (
              services.map((service) => (
                <MenuItem key={service.serviceId} value={service.serviceId}>
                  {service.title}
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
