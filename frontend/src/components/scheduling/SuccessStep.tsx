import { useState } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { CheckCircleOutline as SuccessIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
        Agendamento Confirmado!
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Obrigado, {name}! Seu agendamento foi realizado com sucesso.
      </Typography>

      <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
        <CardContent>
          <Typography variant="h6" color="text.primary" gutterBottom>
            Detalhes do Agendamento
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {time}
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Você receberá uma mensagem de confirmação em breve. Esperamos ver você!
      </Typography>

      <Button
        variant="contained"
        onClick={onClose}
        size="large"
        fullWidth
      >
        Concluir
      </Button>
    </Box>
  );
};

export default SuccessStep;
