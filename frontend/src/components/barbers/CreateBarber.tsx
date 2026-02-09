import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Chip,
  Alert,
  Snackbar,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createBarber, selectBarbersLoading } from '../../store/barbers';
import { fetchServices, selectAllServices, selectServicesLoading } from '../../store/services';

const CreateBarber: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectBarbersLoading);
  const services = useAppSelector(selectAllServices);
  const servicesLoading = useAppSelector(selectServicesLoading);
  
  const [name, setName] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (services.length === 0) {
      dispatch(fetchServices());
    }
  }, [services.length, dispatch]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      setSuccessOpen(true);
    } catch (err) {
      console.error('Failed to create barber:', err);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create New Barber
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
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

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            disabled={loading || !name.trim() || selectedServiceIds.length === 0}
            fullWidth
          >
            {loading ? 'Creating...' : 'Create Barber'}
          </Button>
        </Stack>
      </Box>

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
          Barber created successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CreateBarber;
