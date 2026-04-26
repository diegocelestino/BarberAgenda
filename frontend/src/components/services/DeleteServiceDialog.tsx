import { Modal } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteService, selectServicesLoading } from '../../store/services';

interface DeleteServiceDialogProps {
  open: boolean;
  serviceId: string | null;
  serviceName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteServiceDialog: React.FC<DeleteServiceDialogProps> = ({ open, serviceId, serviceName, onConfirm, onCancel }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectServicesLoading);

  const handleDelete = async () => {
    if (!serviceId) return;
    try { await dispatch(deleteService(serviceId)).unwrap(); onConfirm(); }
    catch (err) { console.error('Failed to delete service:', err); }
  };

  return (
    <Modal title="Delete Service" open={open} onCancel={onCancel} onOk={handleDelete}
      okText="Delete" okButtonProps={{ danger: true, loading }} cancelText="Cancel">
      Are you sure you want to delete "{serviceName}"? This action cannot be undone.
    </Modal>
  );
};

export default DeleteServiceDialog;
