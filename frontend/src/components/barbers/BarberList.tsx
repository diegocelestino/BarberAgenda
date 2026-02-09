import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchBarbers,
  selectAllBarbers,
  selectBarbersLoading,
  selectBarbersError,
} from '../../store/barbers';
import BarberCard from './BarberCard';
import DeleteBarberDialog from './DeleteBarberDialog';

const BarberList: React.FC = () => {
  const dispatch = useAppDispatch();
  const barbers = useAppSelector(selectAllBarbers);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchBarbers());
  }, [dispatch]);

  const handleDeleteClick = (barberId: string) => {
    setSelectedBarberId(barberId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    setSelectedBarberId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedBarberId(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Barbers
      </Typography>

      {barbers.length === 0 ? (
        <Alert severity="info">
          No barbers found. Create one to get started!
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {barbers.map((barber) => (
            <Grid item xs={12} sm={6} md={4} key={barber.barberId}>
              <BarberCard barber={barber} onDelete={handleDeleteClick} />
            </Grid>
          ))}
        </Grid>
      )}

      <DeleteBarberDialog
        open={deleteDialogOpen}
        barberId={selectedBarberId}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default BarberList;
