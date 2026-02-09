import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { updateService } from '../../store/services';
import { Service } from '../../services/servicesApi';

interface EditServiceDialogProps {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditServiceDialog: React.FC<EditServiceDialogProps> = ({
  open,
  service,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(30);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setName(service.name);
      setDescription(service.description || '');
      setPrice(service.price);
      setDuration(service.duration);
    }
  }, [service]);

  const handleSubmit = async () => {
    if (!service || !title || !name || price <= 0 || duration <= 0) {
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        updateService({
          serviceId: service.serviceId,
          data: {
            title,
            name,
            description: description || undefined,
            price,
            duration,
            durationMinutes: duration,
          },
        })
      ).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Failed to update service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Service</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Service Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            helperText="Internal title for admin use"
          />

          <TextField
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            helperText="Name shown to customers"
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            helperText="Optional description for customers"
          />

          <TextField
            label="Price ($)"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            inputProps={{ min: 0, step: 5 }}
            required
            fullWidth
          />

          <TextField
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            inputProps={{ min: 15, step: 15 }}
            required
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !title || !name || price <= 0 || duration <= 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditServiceDialog;
