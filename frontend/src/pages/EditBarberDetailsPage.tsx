import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  IconButton,
  Container,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBarberById,
  updateBarber,
  selectSelectedBarber,
  selectBarbersLoading,
  selectBarbersError,
  clearSelectedBarber,
} from '../store/barbers';
import { fetchServices, selectAllServices, selectServicesLoading } from '../store/services';

const EditBarberDetailsPage: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);
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

  useEffect(() => {
    if (barberId) {
      dispatch(fetchBarberById(barberId));
    }
    
    return () => {
      dispatch(clearSelectedBarber());
    };
  }, [barberId, dispatch]);

  useEffect(() => {
    if (barber) {
      setName(barber.name);
      setSelectedServiceIds(barber.serviceIds);
      setRating(barber.rating);
    }
  }, [barber]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !barberId || selectedServiceIds.length === 0) {
      return;
    }

    try {
      await dispatch(
        updateBarber({
          barberId,
          data: {
            name: name.trim(),
            serviceIds: selectedServiceIds,
            rating,
          },
        })
      ).unwrap();

      setSuccessOpen(true);
      setTimeout(() => navigate(`/admin/barber/${barberId}`), 1500);
    } catch (err) {
      console.error('Failed to update barber:', err);
    }
  };

  if (loading && !barber) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!barber) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Barbeiro não encontrado
      </Alert>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(`/admin/barber/${barberId}`)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h2">
            Editar Detalhes - {barber.name}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Serviços *
              </Typography>
              {servicesLoading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Carregando serviços...
                  </Typography>
                </Box>
              ) : services.length === 0 ? (
                <Alert severity="info">
                  Nenhum serviço disponível. Por favor, crie serviços primeiro.
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
              label="Avaliação"
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

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/admin/barber/${barberId}`)}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading || !name.trim() || selectedServiceIds.length === 0}
                fullWidth
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

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
          Barbeiro atualizado com sucesso!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditBarberDetailsPage;
