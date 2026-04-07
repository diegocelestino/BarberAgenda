import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Grid, Chip, CircularProgress } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAppointmentsByBarber } from '../../store/appointments/appointmentsThunks';
import { selectBarberById } from '../../store/barbers/barbersSelectors';
import { BarberSchedule } from '../../services/api';
import { Appointment } from '../../services/appointmentsApi';

const generateSlotsFromSchedule = (schedule: BarberSchedule): string[] => {
  const slots: string[] = [];
  const [openH, openM] = schedule.openTime.split(':').map(Number);
  const [closeH, closeM] = schedule.closeTime.split(':').map(Number);
  const [lunchStartH, lunchStartM] = schedule.lunchStart.split(':').map(Number);
  const [lunchEndH, lunchEndM] = schedule.lunchEnd.split(':').map(Number);

  const startMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60 + closeM;
  const lunchStart = lunchStartH * 60 + lunchStartM;
  const lunchEnd = lunchEndH * 60 + lunchEndM;

  for (let m = startMinutes; m < endMinutes; m += schedule.slotInterval) {
    // Skip lunch break slots
    if (m >= lunchStart && m < lunchEnd) continue;
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
  }
  return slots;
};

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
  const dispatch = useAppDispatch();
  const [time, setTime] = useState<string | null>(selectedTime || null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the selected service duration
  const selectedService = useAppSelector((state) => 
    state.services.services.find(s => s.serviceId === serviceId)
  );

  const barber = useAppSelector((state) => selectBarberById(state, barberId));

  const loadAvailableTimes = useCallback(async () => {
      try {
        setLoading(true);
        console.log('=== Starting loadAvailableTimes ===');
        
        // Fetch appointments for the selected date
        const dayStart = startOfDay(selectedDate).getTime();
        const dayEnd = endOfDay(selectedDate).getTime();
        console.log('Date range:', { dayStart, dayEnd, selectedDate });
        
        const result = await dispatch(
          fetchAppointmentsByBarber({
            barberId,
            params: {
              startDate: dayStart,
              endDate: dayEnd,
            },
          })
        );

        console.log('Dispatch result:', result);

        // Get appointments from the result payload (it's an array)
        const fetchedAppointments = (result.payload as Appointment[]) || [];
        
        console.log('Fetched appointments for time slots:', fetchedAppointments.length, fetchedAppointments);

        // Generate time slots from barber's schedule, fallback to defaults
        const schedule: BarberSchedule = barber?.schedule ?? {
          openTime: '09:00',
          closeTime: '18:00',
          lunchStart: '12:00',
          lunchEnd: '13:00',
          workDays: [1, 2, 3, 4, 5, 6],
          slotInterval: 30,
        };
        console.log('Barber schedule:', schedule);
        
        const allTimes = generateSlotsFromSchedule(schedule);
        console.log('Generated time slots:', allTimes.length, allTimes);

        // Filter out times that conflict with existing appointments or are in the past
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        const serviceDuration = selectedService?.durationMinutes || selectedService?.duration || 30;
        
        console.log('Service duration:', serviceDuration, 'minutes');
        console.log('Selected service:', selectedService);
        console.log('Now:', now.toISOString());
        console.log('One hour from now:', oneHourFromNow.toISOString());
        
        const availableSlots = allTimes.filter((timeSlot) => {
          const [hours, minutes] = timeSlot.split(':').map(Number);
          
          // Create slot time in Brazil timezone (UTC-3)
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          const slotDateTimeString = `${year}-${month}-${day}T${timeStr}:00-03:00`;
          const slotStart = new Date(slotDateTimeString);
          
          const slotStartTime = slotStart.getTime();
          const slotEndTime = slotStartTime + (serviceDuration * 60 * 1000);

          // Check if slot is at least 1 hour in the future
          if (slotStartTime < oneHourFromNow.getTime()) {
            return false;
          }

          // Check if this slot conflicts with any existing appointment
          const hasConflict = fetchedAppointments.some((appointment: any) => {
            if (appointment.status === 'cancelled') return false;
            
            const appointmentStart = appointment.startTime;
            const appointmentEnd = appointment.endTime;

            // Check for overlap: slot overlaps if it starts before appointment ends AND ends after appointment starts
            const overlaps = slotStartTime < appointmentEnd && slotEndTime > appointmentStart;

            if (overlaps) {
              console.log(`Slot ${timeSlot} conflicts with appointment:`, {
                appointmentStart: new Date(appointmentStart).toLocaleString(),
                appointmentEnd: new Date(appointmentEnd).toLocaleString(),
                slotStart: new Date(slotStartTime).toLocaleString(),
                slotEnd: new Date(slotEndTime).toLocaleString(),
                customer: appointment.customerName,
              });
            }

            return overlaps;
          });

          return !hasConflict;
        });

        console.log('Available slots after filtering:', availableSlots.length, availableSlots);

        setAvailableTimes(availableSlots);
        console.log('=== Finished loadAvailableTimes, setting loading to false ===');
        setLoading(false);
      } catch (error) {
        console.error('Error in loadAvailableTimes:', error);
        setLoading(false);
      }
  }, [dispatch, selectedDate, barberId, serviceId, selectedService, barber?.schedule]);

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
