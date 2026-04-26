import { Modal } from 'antd';
import { useAppDispatch } from '../../store/hooks';
import { deleteAppointment } from '../../store/appointments';

interface DeleteAppointmentDialogProps {
  open: boolean;
  barberId: string;
  appointmentId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAppointmentDialog: React.FC<DeleteAppointmentDialogProps> = ({ open, barberId, appointmentId, onConfirm, onCancel }) => {
  const dispatch = useAppDispatch();

  const handleConfirm = async () => {
    if (appointmentId) {
      await dispatch(deleteAppointment({ barberId, appointmentId }));
      onConfirm();
    }
  };

  return (
    <Modal title="Excluir Agendamento" open={open} onCancel={onCancel} onOk={handleConfirm}
      okText="Excluir" okButtonProps={{ danger: true }} cancelText="Cancelar">
      Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
    </Modal>
  );
};

export default DeleteAppointmentDialog;
