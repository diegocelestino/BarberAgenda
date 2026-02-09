import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { deleteBarber } from '../../store/barbers';

interface DeleteBarberDialogProps {
  open: boolean;
  barberId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteBarberDialog: React.FC<DeleteBarberDialogProps> = ({
  open,
  barberId,
  onConfirm,
  onCancel,
}) => {
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    if (barberId) {
      await dispatch(deleteBarber(barberId));
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Delete Barber</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this barber? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteBarberDialog;
