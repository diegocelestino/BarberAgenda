import { useEffect, useMemo } from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Grid, CircularProgress, Chip } from '@mui/material';
import { MiscellaneousServices as ServicesIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchServices } from '../../store/services/servicesThunks';
import { selectAllServices, selectServicesLoading } from '../../store/services/servicesSelectors';

interface ServiceSelectionStepProps {
  onNext: (serviceId: string) => void;
  onBack: () => void;
  selectedServiceId?: string;
  barberId: string;
}

const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({ onNext, onBack, selectedServiceId, barberId }) => {
  const dispatch = useAppDispatch();
  const allServices = useAppSelector(selectAllServices);
  const loading = useAppSelector(selectServicesLoading);
  
  // Get the selected barber
  const barber = useAppSelector((state) => 
    state.barbers.barbers.find(b => b.barberId === barberId)
  );

  // Filter services based on barber's serviceIds
  const services = useMemo(() => {
    if (!barber || !barber.serviceIds) return allServices;
    return allServices.filter(service => barber.serviceIds.includes(service.serviceId));
  }, [allServices, barber]);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ServicesIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Choose a Service
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        What service would you like?
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
                      label={`$${service.price}`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`${service.duration} min`}
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
    </Box>
  );
};

export default ServiceSelectionStep;
