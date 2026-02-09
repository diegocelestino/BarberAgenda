import { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';

interface PhoneNumberStepProps {
  onNext: (phoneNumber: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const PhoneNumberStep: React.FC<PhoneNumberStepProps> = ({ onNext, onBack, initialValue = '' }) => {
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Basic phone validation
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    onNext(phoneNumber);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PhoneIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Enter Your Phone Number
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        We'll use this to send you appointment reminders
      </Typography>

      <TextField
        fullWidth
        label="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="(555) 123-4567"
        error={!!error}
        helperText={error}
        sx={{ mb: 3 }}
      />

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
          onClick={handleSubmit}
          fullWidth
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default PhoneNumberStep;
