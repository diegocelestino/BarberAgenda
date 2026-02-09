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
  const [durationMinutes, setDurationMinutes] = useState(60);

  const handleSubmit = async () => {
    if (!title || durationMinutes <= 0) {
      return;
    }

    try {
      await dispatch(
        createService({
          title,
          durationMinutes,
        })
      ).unwrap();

      // Reset form
      setTitle('');
      setDurationMinutes(60);
      
      onSuccess();
    } catch (err) {
      console.error('Failed to create service:', err);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDurationMinutes(60);
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
            placeholder="e.g., Haircut, Beard Trim"
          />

          <TextField
            label="Duration (minutes)"
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
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
          disabled={loading || !title || durationMinutes <= 0}
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateServiceDialog;
