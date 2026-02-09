import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  Stack,
  Rating,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Barber } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchServices, selectAllServices } from '../../store/services';

interface BarberCardProps {
  barber: Barber;
  onDelete: (barberId: string) => void;
}

const BarberCard: React.FC<BarberCardProps> = ({ barber, onDelete }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);

  useEffect(() => {
    if (services.length === 0) {
      dispatch(fetchServices());
    }
  }, [services.length, dispatch]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(barber.barberId);
  };

  const getServiceNames = () => {
    return barber.serviceIds
      .map(id => services.find(s => s.serviceId === id)?.title)
      .filter(Boolean);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <IconButton
        size="small"
        color="error"
        onClick={handleDeleteClick}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'error.dark',
            color: 'white',
          },
        }}
        title="Delete barber"
      >
        <DeleteIcon fontSize="small" />
      </IconButton>

      <CardActionArea
        onClick={() => navigate(`/admin/barber/${barber.barberId}`)}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
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
            {getServiceNames().map((serviceName, index) => (
              <Chip
                key={index}
                label={serviceName}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BarberCard;
