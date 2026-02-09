import { useState } from 'react';
import { Container, Typography, Box, Button, Paper, Stepper, Step, StepLabel } from '@mui/material';
import { ContentCut as ContentCutIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import PhoneNumberStep from '../components/scheduling/PhoneNumberStep';
import BarberSelectionStep from '../components/scheduling/BarberSelectionStep';
import ServiceSelectionStep from '../components/scheduling/ServiceSelectionStep';
import DateSelectionStep from '../components/scheduling/DateSelectionStep';
import TimeSelectionStep from '../components/scheduling/TimeSelectionStep';
import NameStep from '../components/scheduling/NameStep';
import ConfirmationStep from '../components/scheduling/ConfirmationStep';
import SuccessStep from '../components/scheduling/SuccessStep';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createAppointment } from '../store/appointments/appointmentsThunks';

const steps = ['Phone', 'Barber', 'Service', 'Date', 'Time', 'Name', 'Confirm'];

interface AppointmentData {
  phoneNumber: string;
  barberId: string;
  serviceId: string;
  date: Date | null;
  time: string;
  name: string;
}

const PublicHomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [schedulingStarted, setSchedulingStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    phoneNumber: '',
    barberId: '',
    serviceId: '',
    date: null,
    time: '',
    name: '',
  });

  // Get selected service for duration calculation
  const selectedService = useAppSelector((state) => 
    appointmentData.serviceId 
      ? state.services.services.find(s => s.serviceId === appointmentData.serviceId)
      : null
  );

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      setSchedulingStarted(false);
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handlePhoneSubmit = (phoneNumber: string) => {
    setAppointmentData((prev) => ({ ...prev, phoneNumber }));
    handleNext();
  };

  const handleBarberSelect = (barberId: string) => {
    setAppointmentData((prev) => ({ ...prev, barberId }));
    handleNext();
  };

  const handleServiceSelect = (serviceId: string) => {
    setAppointmentData((prev) => ({ ...prev, serviceId }));
    handleNext();
  };

  const handleDateSelect = (date: Date) => {
    setAppointmentData((prev) => ({ ...prev, date }));
    handleNext();
  };

  const handleTimeSelect = (time: string) => {
    setAppointmentData((prev) => ({ ...prev, time }));
    handleNext();
  };

  const handleNameSubmit = (name: string) => {
    setAppointmentData((prev) => ({ ...prev, name }));
    handleNext();
  };

  const handleConfirm = async () => {
    if (!appointmentData.date) return;

    // Create date in local timezone (São Paulo)
    const year = appointmentData.date.getFullYear();
    const month = appointmentData.date.getMonth();
    const day = appointmentData.date.getDate();
    const [hours, minutes] = appointmentData.time.split(':');
    
    // Create a new date with local timezone
    const appointmentDateTime = new Date(year, month, day, parseInt(hours), parseInt(minutes), 0, 0);

    // Calculate end time based on service duration
    const startTime = appointmentDateTime.getTime();
    const serviceDuration = selectedService?.durationMinutes || 30; // Default to 30 minutes
    const endTime = startTime + (serviceDuration * 60 * 1000);

    await dispatch(
      createAppointment({
        barberId: appointmentData.barberId,
        data: {
          customerName: appointmentData.name,
          customerPhone: appointmentData.phoneNumber,
          startTime,
          endTime,
          service: appointmentData.serviceId,
        },
      })
    ).unwrap();

    handleNext();
  };

  const handleClose = () => {
    setSchedulingStarted(false);
    setActiveStep(0);
    setAppointmentData({
      phoneNumber: '',
      barberId: '',
      serviceId: '',
      date: null,
      time: '',
      name: '',
    });
  };

  if (!schedulingStarted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={8}
            sx={{
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              borderRadius: 4,
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 3,
                }}
              >
                <ContentCutIcon sx={{ fontSize: 60, color: 'background.paper' }} />
              </Box>
            </Box>

            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 2,
              }}
            >
              Barber Shop
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Book your appointment in just a few clicks
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<CalendarIcon />}
              onClick={() => setSchedulingStarted(true)}
              sx={{
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                borderRadius: 3,
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s',
              }}
            >
              Schedule Appointment
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 4,
            bgcolor: 'background.paper',
          }}
        >
          {activeStep < steps.length && (
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                mb: { xs: 2, sm: 4 },
                '& .MuiStepLabel-label': {
                  display: { xs: 'none', sm: 'block' }
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {activeStep === 0 && (
            <PhoneNumberStep
              onNext={handlePhoneSubmit}
              onBack={handleBack}
              initialValue={appointmentData.phoneNumber}
            />
          )}

          {activeStep === 1 && (
            <BarberSelectionStep
              onNext={handleBarberSelect}
              onBack={handleBack}
              selectedBarberId={appointmentData.barberId}
            />
          )}

          {activeStep === 2 && (
            <ServiceSelectionStep
              onNext={handleServiceSelect}
              onBack={handleBack}
              selectedServiceId={appointmentData.serviceId}
              barberId={appointmentData.barberId}
            />
          )}

          {activeStep === 3 && (
            <DateSelectionStep
              onNext={handleDateSelect}
              onBack={handleBack}
              selectedDate={appointmentData.date || undefined}
            />
          )}

          {activeStep === 4 && appointmentData.date && (
            <TimeSelectionStep
              onNext={handleTimeSelect}
              onBack={handleBack}
              selectedDate={appointmentData.date}
              barberId={appointmentData.barberId}
              serviceId={appointmentData.serviceId}
              selectedTime={appointmentData.time}
            />
          )}

          {activeStep === 5 && (
            <NameStep
              onNext={handleNameSubmit}
              onBack={handleBack}
              initialValue={appointmentData.name}
            />
          )}

          {activeStep === 6 && appointmentData.date && (
            <ConfirmationStep
              onConfirm={handleConfirm}
              onBack={handleBack}
              phoneNumber={appointmentData.phoneNumber}
              barberId={appointmentData.barberId}
              serviceId={appointmentData.serviceId}
              date={appointmentData.date}
              time={appointmentData.time}
              name={appointmentData.name}
            />
          )}

          {activeStep === 7 && appointmentData.date && (
            <SuccessStep
              onClose={handleClose}
              date={appointmentData.date}
              time={appointmentData.time}
              name={appointmentData.name}
            />
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicHomePage;
