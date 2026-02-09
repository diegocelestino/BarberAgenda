import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { CheckCircleOutline as SuccessIcon } from '@mui/icons-material';
import { format } from 'date-fns';

interface SuccessStepProps {
  onClose: () => void;
  date: Date;
  time: string;
  name: string;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ onClose, date, time, name }) => {
  return (
    <Box sx={{ textAlign: 'center' }}>
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
            bgcolor: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SuccessIcon sx={{ fontSize: 60, color: 'white' }} />
        </Box>
      </Box>

      <Typography variant="h4" color="text.primary" gutterBottom>
        Appointment Confirmed!
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Thank you, {name}! Your appointment has been successfully booked.
      </Typography>

      <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
        <CardContent>
          <Typography variant="h6" color="text.primary" gutterBottom>
            Appointment Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {format(date, 'EEEE, MMMM d, yyyy')} at {time}
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        You'll receive a confirmation message shortly. We look forward to seeing you!
      </Typography>

      <Button
        variant="contained"
        onClick={onClose}
        size="large"
        fullWidth
      >
        Done
      </Button>
    </Box>
  );
};

export default SuccessStep;
