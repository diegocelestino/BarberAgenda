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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    if (onlyNumbers.length > 11) {
      setError('O telefone não pode ter mais de 11 dígitos');
      return;
    }
    setError('');
    setPhoneNumber(onlyNumbers);
  };

  const handleSubmit = () => {
    // Basic phone validation
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Por favor, insira um número de telefone válido');
      return;
    }
    setError('');
    onNext(phoneNumber);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PhoneIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Digite seu Telefone
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Usaremos para enviar lembretes do seu agendamento
      </Typography>

      <TextField
        fullWidth
        label="Telefone"
        value={phoneNumber}
        onChange={handleChange}
        placeholder="11999999999"
        error={!!error}
        helperText={error}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        sx={{ mb: 2 }}
      />

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
          onClick={handleSubmit}
          fullWidth
        >
          Próximo
        </Button>
      </Box>
    </Box>
  );
};

export default PhoneNumberStep;
