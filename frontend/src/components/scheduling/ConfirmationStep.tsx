import { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Divider, CircularProgress, Alert } from '@mui/material';
import { CheckCircle as CheckIcon, Person, Phone, ContentCut, MiscellaneousServices, CalendarMonth, AccessTime } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppSelector } from '../../store/hooks';

interface ConfirmationStepProps {
  onConfirm: () => Promise<void>;
  onBack: () => void;
  phoneNumber: string;
  barberId: string;
  serviceId: string;
  date: Date;
  time: string;
  name: string;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  onConfirm,
  onBack,
  phoneNumber,
  barberId,
  serviceId,
  date,
  time,
  name,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const barber = useAppSelector((state) => 
    state.barbers.barbers.find(b => b.barberId === barberId)
  );
  const service = useAppSelector((state) => 
    state.services.services.find(s => s.serviceId === serviceId)
  );

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError('Falha ao agendar. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CheckIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Confirme seu Agendamento
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Por favor, revise os detalhes do seu agendamento
      </Typography>

      <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Person sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nome
              </Typography>
              <Typography variant="body1" color="text.primary">
                {name}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Phone sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Telefone
              </Typography>
              <Typography variant="body1" color="text.primary">
                {phoneNumber}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ContentCut sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Barbeiro
              </Typography>
              <Typography variant="body1" color="text.primary">
                {barber?.name || 'Desconhecido'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MiscellaneousServices sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Serviço
              </Typography>
              <Typography variant="body1" color="text.primary">
                {service?.name || 'Desconhecido'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                R$ {service?.price} • {service?.duration} min
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarMonth sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Data
              </Typography>
              <Typography variant="body1" color="text.primary">
                {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Horário
              </Typography>
              <Typography variant="body1" color="text.primary">
                {time}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          fullWidth
          disabled={loading}
        >
          Voltar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Agendando...' : 'Confirmar Agendamento'}
        </Button>
      </Box>
    </Box>
  );
};

export default ConfirmationStep;
