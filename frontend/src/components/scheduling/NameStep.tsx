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
      setError('Por favor, digite seu nome');
      return;
    }
    setError('');
    onNext(name.trim());
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PersonIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Digite seu Nome
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Como devemos te chamar?
      </Typography>

      <TextField
        fullWidth
        label="Nome Completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="João Silva"
        error={!!error}
        helperText={error}
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

export default NameStep;
