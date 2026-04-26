import { Modal } from 'antd';
import { useAppDispatch } from '../../store/hooks';
import { deleteBarber } from '../../store/barbers';

interface DeleteBarberDialogProps {
  open: boolean;
  barberId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteBarberDialog: React.FC<DeleteBarberDialogProps> = ({ open, barberId, onConfirm, onCancel }) => {
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    if (barberId) {
      await dispatch(deleteBarber(barberId));
      onConfirm();
    }
  };

  return (
    <Modal title="Delete Barber" open={open} onCancel={onCancel} onOk={handleConfirm}
      okText="Delete" okButtonProps={{ danger: true }} cancelText="Cancel">
      Are you sure you want to delete this barber? This action cannot be undone.
    </Modal>
  );
};

export default DeleteBarberDialog;
