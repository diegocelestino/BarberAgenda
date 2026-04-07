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
  try {
    const slots: string[] = [];
    
    // Validate schedule has all required properties
    if (!schedule.openTime || !schedule.closeTime || !schedule.lunchStart || !schedule.lunchEnd) {
      console.error('Invalid schedule - missing required time properties:', schedule);
      return [];
    }
    
    const [openH, openM] = schedule.openTime.split(':').map(Number);
    const [closeH, closeM] = schedule.closeTime.split(':').map(Number);
    const [lunchStartH, lunchStartM] = schedule.lunchStart.split(':').map(Number);
    const [lunchEndH, lunchEndM] = schedule.lunchEnd.split(':').map(Number);

    // Validate parsed numbers
    if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM) || 
        isNaN(lunchStartH) || isNaN(lunchStartM) || isNaN(lunchEndH) || isNaN(lunchEndM)) {
      console.error('Invalid schedule - could not parse time values:', schedule);
      return [];
    }

    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;
    const lunchStart = lunchStartH * 60 + lunchStartM;
    const lunchEnd = lunchEndH * 60 + lunchEndM;

    const slotInterval = schedule.slotInterval || 30;

    for (let m = startMinutes; m < endMinutes; m += slotInterval) {
      // Skip lunch break slots
      if (m >= lunchStart && m < lunchEnd) continue;
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
    return slots;
  } catch (error) {
    console.error('Error generating slots from schedule:', error, schedule);
    return [];
  }
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
        console.log('=== [1/10] Starting loadAvailableTimes ===');
        setLoading(true);
        console.log('=== [2/10] Loading state set to true ===');
        
        // Fetch appointments for the selected date
        const dayStart = startOfDay(selectedDate).getTime();
        const dayEnd = endOfDay(selectedDate).getTime();
        console.log('=== [3/10] Date range calculated ===', { dayStart, dayEnd, selectedDate: selectedDate.toISOString() });
        
        console.log('=== [4/10] About to dispatch fetchAppointmentsByBarber ===');
        const result = await dispatch(
          fetchAppointmentsByBarber({
            barberId,
            params: {
              startDate: dayStart,
              endDate: dayEnd,
            },
          })
        );

        console.log('=== [5/10] Dispatch completed ===', { 
          type: result.type, 
          payloadType: typeof result.payload,
          payloadIsArray: Array.isArray(result.payload),
          payloadLength: Array.isArray(result.payload) ? result.payload.length : 'N/A'
        });

        // Get appointments from the result payload (it's an array)
        const fetchedAppointments = (result.payload as Appointment[]) || [];
        
        console.log('=== [6/10] Appointments extracted ===', {
          count: fetchedAppointments.length,
          appointments: fetchedAppointments
        });

        // Validate and clean appointments data
        console.log('=== Validating appointments data ===');
        const validAppointments = fetchedAppointments.filter((appointment: any) => {
          // Skip cancelled appointments
          if (appointment.status === 'cancelled') {
            console.log('Skipping cancelled appointment:', appointment.appointmentId);
            return false;
          }

          // Validate appointment has required time fields
          if (!appointment.startTime || !appointment.endTime) {
            console.warn('⚠️ Appointment missing time fields:', appointment);
            return false;
          }

          // Check for invalid time ranges (endTime before startTime)
          if (appointment.endTime < appointment.startTime) {
            console.warn('⚠️ Appointment has invalid time range (end before start):', {
              appointmentId: appointment.appointmentId,
              startTime: new Date(appointment.startTime).toISOString(),
              endTime: new Date(appointment.endTime).toISOString()
            });
            return false;
          }

          return true;
        });

        console.log('Valid appointments after filtering:', {
          original: fetchedAppointments.length,
          valid: validAppointments.length,
          filtered: fetchedAppointments.length - validAppointments.length
        });

        // Merge overlapping appointments (handle walk-ins registered back-to-back)
        console.log('=== Merging overlapping appointments ===');
        const mergedAppointments: any[] = [];
        
        validAppointments.forEach((appointment: any) => {
          // Check if this appointment overlaps with any already merged appointment
          let merged = false;
          
          for (let i = 0; i < mergedAppointments.length; i++) {
            const existing = mergedAppointments[i];
            
            // Check for overlap: appointments overlap if one starts before the other ends
            const overlaps = 
              (appointment.startTime < existing.endTime && appointment.endTime > existing.startTime);
            
            if (overlaps) {
              console.log('Merging overlapping appointments:', {
                existing: {
                  id: existing.appointmentId,
                  start: new Date(existing.startTime).toLocaleString(),
                  end: new Date(existing.endTime).toLocaleString()
                },
                new: {
                  id: appointment.appointmentId,
                  start: new Date(appointment.startTime).toLocaleString(),
                  end: new Date(appointment.endTime).toLocaleString()
                }
              });
              
              // Merge by extending the time range
              mergedAppointments[i] = {
                ...existing,
                startTime: Math.min(existing.startTime, appointment.startTime),
                endTime: Math.max(existing.endTime, appointment.endTime),
                customerName: `${existing.customerName} + ${appointment.customerName}`,
                appointmentId: `${existing.appointmentId}+${appointment.appointmentId}`,
                merged: true
              };
              
              merged = true;
              break;
            }
          }
          
          if (!merged) {
            mergedAppointments.push({ ...appointment });
          }
        });

        console.log('Appointments after merging:', {
          before: validAppointments.length,
          after: mergedAppointments.length,
          merged: validAppointments.length - mergedAppointments.length
        });

        // Use merged appointments for conflict checking
        const appointmentsForConflictCheck = mergedAppointments;

        console.log('=== [6/10] Appointments extracted ===', {
          count: fetchedAppointments.length,
          appointments: fetchedAppointments
        });

        // Generate time slots from barber's schedule, fallback to defaults
        console.log('=== [7/10] About to generate time slots ===');
        console.log('Barber object:', barber);
        console.log('Barber schedule:', barber?.schedule);
        
        const schedule: BarberSchedule = barber?.schedule ?? {
          openTime: '09:00',
          closeTime: '18:00',
          lunchStart: '12:00',
          lunchEnd: '13:00',
          workDays: [1, 2, 3, 4, 5, 6],
          slotInterval: 30,
        };
        console.log('Using schedule:', schedule);
        
        console.log('=== [8/10] Calling generateSlotsFromSchedule ===');
        const allTimes = generateSlotsFromSchedule(schedule);
        console.log('=== [9/10] Time slots generated ===', { count: allTimes.length, slots: allTimes });
        
        if (allTimes.length === 0) {
          console.error('❌ No time slots generated! Check barber schedule configuration.');
          setAvailableTimes([]);
          setLoading(false);
          console.log('=== [10/10] FINISHED (no slots) ===');
          return;
        }

        // Filter out times that conflict with existing appointments or are in the past
        console.log('=== Starting slot filtering ===');
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        const serviceDuration = selectedService?.durationMinutes || selectedService?.duration || 30;
        
        console.log('Filter parameters:', {
          serviceDuration,
          selectedService,
          now: now.toISOString(),
          oneHourFromNow: oneHourFromNow.toISOString(),
          totalSlotsToFilter: allTimes.length
        });
        
        let slotsChecked = 0;
        let slotsPastOrTooSoon = 0;
        let slotsWithConflicts = 0;
        
        const availableSlots = allTimes.filter((timeSlot) => {
          slotsChecked++;
          if (slotsChecked % 10 === 0) {
            console.log(`Filtering progress: ${slotsChecked}/${allTimes.length} slots checked`);
          }
          
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
            slotsPastOrTooSoon++;
            return false;
          }

          // Check if this slot conflicts with any existing appointment
          const hasConflict = appointmentsForConflictCheck.some((appointment: any) => {
            
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

          if (hasConflict) {
            slotsWithConflicts++;
          }

          return !hasConflict;
        });

        console.log('=== Filtering complete ===', {
          totalSlots: allTimes.length,
          slotsChecked,
          slotsPastOrTooSoon,
          slotsWithConflicts,
          availableSlots: availableSlots.length,
          slots: availableSlots
        });

        setAvailableTimes(availableSlots);
        console.log('=== [10/10] FINISHED - Setting loading to false ===');
        setLoading(false);
      } catch (error) {
        console.error('❌ ERROR in loadAvailableTimes:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        setLoading(false);
      }
  }, [dispatch, selectedDate, barberId, selectedService, barber]);

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
