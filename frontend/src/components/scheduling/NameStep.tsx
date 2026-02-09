import { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

interface NameStepProps {
  onNext: (name: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const NameStep: React.FC<NameStepProps> = ({ onNext, onBack, initialValue = '' }) => {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    setError('');
    onNext(name.trim());
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PersonIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Enter Your Name
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        How should we address you?
      </Typography>

      <TextField
        fullWidth
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
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

export default NameStep;
