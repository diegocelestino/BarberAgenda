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
    if (open && allServices.length === 0) {
      dispatch(fetchServices());
    }
  }, [open, allServices.length, dispatch]);

  useEffect(() => {
    if (appointment) {
      // Find service ID by matching service title
      const matchingService = allServices.find(s => s.title === appointment.service);
      
      // Format date in local timezone for datetime-local input
      const appointmentDate = new Date(appointment.startTime);
      const year = appointmentDate.getFullYear();
      const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
      const day = String(appointmentDate.getDate()).padStart(2, '0');
      const hours = String(appointmentDate.getHours()).padStart(2, '0');
      const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
      const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      setFormData({
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone || '',
        serviceId: matchingService?.serviceId || '',
        startTime: localDateTimeString,
        status: appointment.status,
        notes: appointment.notes || '',
      });
    }
  }, [appointment, allServices]);

  // Filter services to only show those offered by the barber
  const availableServices = barber
    ? allServices.filter(service => barber.serviceIds.includes(service.serviceId))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !formData.serviceId) return;

    const selectedService = allServices.find(s => s.serviceId === formData.serviceId);
    if (!selectedService) {
      alert('Please select a valid service');
      return;
    }

    // Parse datetime in local timezone (São Paulo)
    // formData.startTime is in format "YYYY-MM-DDTHH:mm"
    const dateTimeParts = formData.startTime.split('T');
    const [year, month, day] = dateTimeParts[0].split('-').map(Number);
    const [hours, minutes] = dateTimeParts[1].split(':').map(Number);
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    const startTime = appointmentDateTime.getTime();
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

  const selectedService = allServices.find(s => s.serviceId === formData.serviceId);

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
              ) : availableServices.length === 0 ? (
                <MenuItem disabled>No services available for this barber</MenuItem>
              ) : (
                availableServices.map((service) => (
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
