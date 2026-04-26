import { Modal } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteService, selectServicesLoading } from '../../store/services';

interface Props {
  open: boolean;
  serviceId: string | null;
  serviceName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteServiceDialog: React.FC<Props> = ({ open, serviceId, serviceName, onConfirm, onCancel }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectServicesLoading);

  const handleDelete = async () => {
    if (!serviceId) return;
    try { await dispatch(deleteService(serviceId)).unwrap(); onConfirm(); }
    catch (err) { console.error('Erro ao excluir serviço:', err); }
  };

  return (
    <Modal title="Excluir Serviço" open={open} onCancel={onCancel} onOk={handleDelete}
      okText="Excluir" okButtonProps={{ danger: true, loading }} cancelText="Cancelar">
      Tem certeza que deseja excluir "{serviceName}"? Esta ação não pode ser desfeita.
    </Modal>
  );
};

export default DeleteServiceDialog;
