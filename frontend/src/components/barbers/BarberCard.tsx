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
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Barber } from '../../services/api';

interface BarberCardProps {
  barber: Barber;
  onDelete: (barberId: string) => void;
}

const BarberCard: React.FC<BarberCardProps> = ({ barber, onDelete }) => {
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

      <CardActions>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(barber.barberId)}
          fullWidth
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default BarberCard;
