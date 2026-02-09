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
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAppointment } from '../../store/appointments';
import { fetchServices, selectAllServices, selectServicesLoading } from '../../store/services';
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
  const services = useAppSelector(selectAllServices);
  const servicesLoading = useAppSelector(selectServicesLoading);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    startTime: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
    notes: '',
  });

  useEffect(() => {
    if (open && services.length === 0) {
      dispatch(fetchServices());
    }
  }, [open, services.length, dispatch]);

  useEffect(() => {
    if (appointment) {
      // Find service ID by matching service title
      const matchingService = services.find(s => s.title === appointment.service);
      
      setFormData({
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone || '',
        serviceId: matchingService?.serviceId || '',
        startTime: new Date(appointment.startTime).toISOString().slice(0, 16),
        status: appointment.status,
        notes: appointment.notes || '',
      });
    }
  }, [appointment, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !formData.serviceId) return;

    const selectedService = services.find(s => s.serviceId === formData.serviceId);
    if (!selectedService) {
      alert('Please select a valid service');
      return;
    }

    const startTime = new Date(formData.startTime).getTime();
    const endTime = startTime + selectedService.durationMinutes * 60 * 1000;
    const now = Date.now();

    // Validation: Cannot schedule in the past
    if (startTime < now && formData.status === 'scheduled') {
      alert('Cannot schedule an appointment in the past');
      return;
    }

    // Validation: Cannot complete an appointment before it happens
    if (formData.status === 'completed' && startTime > now) {
      alert('Cannot mark an appointment as completed before it happens');
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
          service: selectedService.title,
          startTime,
          endTime,
          status: formData.status,
          notes: formData.notes || undefined,
        },
      })).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Failed to update appointment:', error);
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

  const selectedService = services.find(s => s.serviceId === formData.serviceId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Customer Phone"
              value={formData.customerPhone}
              onChange={(e) => handleChange('customerPhone', e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Service"
              value={formData.serviceId}
              onChange={(e) => handleChange('serviceId', e.target.value)}
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
              label="Start Time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: formData.status === 'scheduled' ? new Date().toISOString().slice(0, 16) : undefined,
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
                Scheduled
              </MenuItem>
              <MenuItem value="completed" disabled={isAppointmentInFuture()}>
                Completed
              </MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>

            <TextField
              label="Notes"
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
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditAppointmentDialog;
