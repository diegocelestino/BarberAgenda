import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { deleteAppointment } from '../../store/appointments';

interface DeleteAppointmentDialogProps {
  open: boolean;
  barberId: string;
  appointmentId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAppointmentDialog: React.FC<DeleteAppointmentDialogProps> = ({
  open,
  barberId,
  appointmentId,
  onConfirm,
  onCancel,
}) => {
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    if (appointmentId) {
      await dispatch(deleteAppointment({ barberId, appointmentId }));
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Delete Appointment</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this appointment? This action cannot be undone.
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

export default DeleteAppointmentDialog;
