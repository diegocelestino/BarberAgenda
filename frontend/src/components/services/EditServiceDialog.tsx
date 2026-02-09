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
  const [durationMinutes, setDurationMinutes] = useState(60);

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setDurationMinutes(service.durationMinutes);
    }
  }, [service]);

  const handleSubmit = async () => {
    if (!service || !title || durationMinutes <= 0) {
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        updateService({
          serviceId: service.serviceId,
          data: {
            title,
            durationMinutes,
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !title || durationMinutes <= 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditServiceDialog;
