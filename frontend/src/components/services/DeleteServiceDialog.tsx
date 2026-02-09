import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteService, selectServicesLoading } from '../../store/services';

interface DeleteServiceDialogProps {
  open: boolean;
  serviceId: string | null;
  serviceName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteServiceDialog: React.FC<DeleteServiceDialogProps> = ({
  open,
  serviceId,
  serviceName,
  onConfirm,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectServicesLoading);

  const handleDelete = async () => {
    if (!serviceId) return;

    try {
      await dispatch(deleteService(serviceId)).unwrap();
      onConfirm();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Service</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete "{serviceName}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteServiceDialog;
