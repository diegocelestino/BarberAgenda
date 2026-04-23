import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Grid, CircularProgress, Chip, Button } from '@mui/material';
import { MiscellaneousServices as ServicesIcon } from '@mui/icons-material';
import { barberApi } from '../../services/api';

interface ServiceSelectionStepProps {
  onNext: (serviceId: string) => void;
  onBack: () => void;
  selectedServiceId?: string;
  barberId: string;
}

const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({ onNext, onBack, selectedServiceId, barberId }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch pre-filtered services from backend
        const barberServices = await barberApi.getServices(barberId);
        setServices(barberServices);
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [barberId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
        <Button onClick={onBack}>Voltar</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ServicesIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Escolha um Serviço
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Qual serviço você deseja?
      </Typography>

      <Grid container spacing={2}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} key={service.serviceId}>
            <Card
              sx={{
                bgcolor: selectedServiceId === service.serviceId ? 'primary.dark' : 'background.paper',
                border: selectedServiceId === service.serviceId ? 2 : 0,
                borderColor: 'primary.main',
              }}
            >
              <CardActionArea onClick={() => onNext(service.serviceId)}>
                <CardContent>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    {service.name}
                  </Typography>
                  {service.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {service.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`R$ ${service.price}`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`${service.duration || service.durationMinutes} min`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={onBack} fullWidth>
          Voltar
        </Button>
      </Box>
    </Box>
  );
};

export default ServiceSelectionStep;
