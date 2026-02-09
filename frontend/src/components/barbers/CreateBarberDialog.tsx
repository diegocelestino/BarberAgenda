import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createBarber, selectBarbersLoading } from '../../store/barbers';
import { fetchServices, selectAllServices, selectServicesLoading } from '../../store/services';

interface CreateBarberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBarberDialog: React.FC<CreateBarberDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectBarbersLoading);
  const services = useAppSelector(selectAllServices);
  const servicesLoading = useAppSelector(selectServicesLoading);
  
  const [name, setName] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(5);

  useEffect(() => {
    if (open && services.length === 0) {
      dispatch(fetchServices());
    }
  }, [open, services.length, dispatch]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || selectedServiceIds.length === 0) {
      return;
    }

    try {
      await dispatch(
        createBarber({
          name: name.trim(),
          serviceIds: selectedServiceIds,
          rating,
        })
      ).unwrap();

      // Reset form
      setName('');
      setSelectedServiceIds([]);
      setRating(5);
      
      onSuccess();
    } catch (err) {
      console.error('Failed to create barber:', err);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedServiceIds([]);
    setRating(5);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Barber</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Services *
            </Typography>
            {servicesLoading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Loading services...
                </Typography>
              </Box>
            ) : services.length === 0 ? (
              <Alert severity="info">
                No services available. Please create services first.
              </Alert>
            ) : (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                {services.map((service) => (
                  <Chip
                    key={service.serviceId}
                    label={service.title}
                    onClick={() => handleToggleService(service.serviceId)}
                    color={selectedServiceIds.includes(service.serviceId) ? 'primary' : 'default'}
                    variant={selectedServiceIds.includes(service.serviceId) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Stack>
            )}
          </Box>

          <TextField
            label="Rating"
            type="number"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            inputProps={{
              min: 0,
              max: 5,
              step: 0.1,
            }}
            fullWidth
            variant="outlined"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim() || selectedServiceIds.length === 0}
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBarberDialog;
