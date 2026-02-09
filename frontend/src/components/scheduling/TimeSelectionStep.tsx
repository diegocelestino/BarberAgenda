import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Chip, CircularProgress } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAppointmentsByBarber } from '../../store/appointments/appointmentsThunks';
import { generateTimeSlots } from '../../config/businessHours';

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

  // Get appointments for the selected barber and date
  const appointments = useAppSelector((state) => state.appointments.appointments);

  useEffect(() => {
    const loadAvailableTimes = async () => {
      setLoading(true);
      
      // Fetch appointments for the selected date
      const dayStart = startOfDay(selectedDate).getTime();
      const dayEnd = endOfDay(selectedDate).getTime();
      
      await dispatch(
        fetchAppointmentsByBarber({
          barberId,
          params: {
            startDate: dayStart,
            endDate: dayEnd,
          },
        })
      );

      // Generate all possible time slots from config
      const allTimes = generateTimeSlots();

      // Filter out times that conflict with existing appointments
      const serviceDuration = selectedService?.duration || 30;
      const availableSlots = allTimes.filter((timeSlot) => {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hours, minutes, 0, 0);
        const slotStartTime = slotStart.getTime();
        const slotEndTime = slotStartTime + (serviceDuration * 60 * 1000);

        // Check if this slot conflicts with any existing appointment
        const hasConflict = appointments.some((appointment) => {
          if (appointment.status === 'cancelled') return false;
          
          const appointmentStart = appointment.startTime;
          const appointmentEnd = appointment.endTime;

          // Check for overlap
          return (
            (slotStartTime >= appointmentStart && slotStartTime < appointmentEnd) ||
            (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) ||
            (slotStartTime <= appointmentStart && slotEndTime >= appointmentEnd)
          );
        });

        return !hasConflict;
      });

      setAvailableTimes(availableSlots);
      setLoading(false);
    };

    loadAvailableTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, barberId, serviceId, selectedService?.duration, dispatch]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TimeIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Choose a Time
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Available times for {format(selectedDate, 'MMMM d, yyyy')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
        {availableTimes.length > 0 
          ? 'Select your preferred appointment time' 
          : 'No available times for this date. Please select another date.'}
      </Typography>

      {availableTimes.length > 0 ? (
        <Box sx={{ mb: 3, maxHeight: 300, overflowY: 'auto' }}>
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
          mb: 3, 
          p: 3, 
          textAlign: 'center',
          bgcolor: 'background.default',
          borderRadius: 2,
        }}>
          <Typography variant="body1" color="text.secondary">
            All time slots are booked for this date
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          fullWidth
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          fullWidth
          disabled={!time}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default TimeSelectionStep;
