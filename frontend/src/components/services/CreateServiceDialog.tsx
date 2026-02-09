import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createService, selectServicesLoading, selectServicesError } from '../../store/services';

interface CreateServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateServiceDialog: React.FC<CreateServiceDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectServicesLoading);
  const error = useAppSelector(selectServicesError);

  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(30);
  const [duration, setDuration] = useState(30);

  const handleSubmit = async () => {
    if (!title || !name || price <= 0 || duration <= 0) {
      return;
    }

    try {
      await dispatch(
        createService({
          title,
          name,
          description: description || undefined,
          price,
          duration,
          durationMinutes: duration,
        })
      ).unwrap();

      // Reset form
      setTitle('');
      setName('');
      setDescription('');
      setPrice(30);
      setDuration(30);
      
      onSuccess();
    } catch (err) {
      console.error('Failed to create service:', err);
    }
  };

  const handleClose = () => {
    setTitle('');
    setName('');
    setDescription('');
    setPrice(30);
    setDuration(30);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Service</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <TextField
            label="Service Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            placeholder="e.g., Haircut"
            helperText="Internal title for admin use"
          />

          <TextField
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            placeholder="e.g., Professional Haircut"
            helperText="Name shown to customers"
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="e.g., Professional haircut with styling"
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !title || !name || price <= 0 || duration <= 0}
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateServiceDialog;
