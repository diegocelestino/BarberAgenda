import { Modal } from 'antd';
import { useAppDispatch } from '../../store/hooks';
import { deleteBarber } from '../../store/barbers';

interface Props {
  open: boolean;
  barberId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteBarberDialog: React.FC<Props> = ({ open, barberId, onConfirm, onCancel }) => {
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    if (barberId) {
      await dispatch(deleteBarber(barberId));
      onConfirm();
    }
  };

  return (
    <Modal title="Excluir Barbeiro" open={open} onCancel={onCancel} onOk={handleConfirm}
      okText="Excluir" okButtonProps={{ danger: true }} cancelText="Cancelar">
      Tem certeza que deseja excluir este barbeiro? Esta ação não pode ser desfeita.
    </Modal>
  );
};

export default DeleteBarberDialog;
