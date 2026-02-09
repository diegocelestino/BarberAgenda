import { useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Grid, CircularProgress, Avatar } from '@mui/material';
import { ContentCut as ContentCutIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBarbers } from '../../store/barbers/barbersThunks';
import { selectAllBarbers, selectBarbersLoading } from '../../store/barbers/barbersSelectors';

interface BarberSelectionStepProps {
  onNext: (barberId: string) => void;
  onBack: () => void;
  selectedBarberId?: string;
}

const BarberSelectionStep: React.FC<BarberSelectionStepProps> = ({ onNext, onBack, selectedBarberId }) => {
  const dispatch = useAppDispatch();
  const barbers = useAppSelector(selectAllBarbers);
  const loading = useAppSelector(selectBarbersLoading);

  useEffect(() => {
    dispatch(fetchBarbers());
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
        <ContentCutIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Choose Your Barber
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Select the barber you'd like to book with
      </Typography>

      <Grid container spacing={2}>
        {barbers.map((barber) => (
          <Grid item xs={12} sm={6} key={barber.barberId}>
            <Card
              sx={{
                bgcolor: selectedBarberId === barber.barberId ? 'primary.dark' : 'background.paper',
                border: selectedBarberId === barber.barberId ? 2 : 0,
                borderColor: 'primary.main',
              }}
            >
              <CardActionArea onClick={() => onNext(barber.barberId)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {barber.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.primary">
                        {barber.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rating: {barber.rating}/5
                      </Typography>
                    </Box>
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

export default BarberSelectionStep;
