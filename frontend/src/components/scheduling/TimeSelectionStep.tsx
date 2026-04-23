import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Grid, Chip, CircularProgress, Alert } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppSelector } from '../../store/hooks';
import { barberApi } from '../../services/api';

interface TimeSelectionStepProps {
  onNext: (time: string) => void;
  onBack: () => void;
  selectedDate: Date;
  barberId: string;
  serviceId: string;
  selectedTime?: string;
}

const TimeSelectionStep: React.FC<TimeSelectionStepProps> = ({
  onNext,
  onBack,
  selectedDate,
  barberId,
  serviceId,
  selectedTime,
}) => {
  const [time, setTime] = useState<string | null>(selectedTime || null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the selected service duration
  const selectedService = useAppSelector((state) => 
    state.services.services.find(s => s.serviceId === serviceId)
  );

  const loadAvailableTimes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const serviceDuration = selectedService?.durationMinutes || selectedService?.duration || 30;
      
      // Format date as YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('Fetching available slots:', { barberId, dateString, serviceDuration });
      
      // Call backend API to get available slots
      const slots = await barberApi.getAvailableSlots(barberId, dateString, serviceDuration);
      
      console.log('Received available slots:', slots);
      
      setAvailableTimes(slots);
    } catch (err) {
      console.error('Error loading available times:', err);
      setError('Erro ao carregar horários disponíveis. Por favor, tente novamente.');
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, barberId, selectedService]);

  useEffect(() => {
    loadAvailableTimes();
  }, [loadAvailableTimes]);

  const handleNext = () => {
    if (time) {
      onNext(time);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TimeIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Escolha um Horário
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Horários disponíveis para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
        {availableTimes.length > 0 
          ? 'Selecione o horário de sua preferência' 
          : 'Não há horários disponíveis para esta data. Por favor, selecione outra data.'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {availableTimes.length > 0 ? (
        <Box sx={{ mb: 2, maxHeight: 300, overflowY: 'auto' }}>
          <Grid container spacing={1}>
            {availableTimes.map((timeSlot) => (
              <Grid item xs={4} sm={3} key={timeSlot}>
                <Chip
                  label={timeSlot}
                  onClick={() => setTime(timeSlot)}
                  color={time === timeSlot ? 'primary' : 'default'}
                  variant={time === timeSlot ? 'filled' : 'outlined'}
                  sx={{ 
                    width: '100%', 
                    cursor: 'pointer',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          textAlign: 'center',
          bgcolor: 'background.default',
          borderRadius: 2,
        }}>
          <Typography variant="body1" color="text.secondary">
            Todos os horários estão reservados para esta data
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          fullWidth
        >
          Voltar
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          fullWidth
          disabled={!time}
        >
          Próximo
        </Button>
      </Box>
    </Box>
  );
};

export default TimeSelectionStep;
