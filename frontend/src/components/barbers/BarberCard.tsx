import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Rating,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Barber } from '../../services/api';

interface BarberCardProps {
  barber: Barber;
  onDelete: (barberId: string) => void;
}

const BarberCard: React.FC<BarberCardProps> = ({ barber, onDelete }) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {barber.name}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Rating value={barber.rating} readOnly precision={0.1} size="small" />
          <Typography variant="body2" color="text.secondary">
            {barber.rating.toFixed(1)} / 5.0
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          {barber.specialties.map((specialty, index) => (
            <Chip
              key={index}
              label={specialty}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/barber/${barber.barberId}`)}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(barber.barberId)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default BarberCard;
