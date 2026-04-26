import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { useAppDispatch } from '../../store/hooks';
import { updateService } from '../../store/services';
import { Service } from '../../services/servicesApi';
import ServiceFormFields, { ServiceFormData } from './ServiceFormFields';

interface Props { open: boolean; service: Service | null; onClose: () => void; onSuccess: () => void; }

const EditServiceDialog: React.FC<Props> = ({ open, service, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ServiceFormData>({ title: '', name: '', description: '', price: 30, duration: 30 });

  useEffect(() => {
    if (service) setData({ title: service.title, name: service.name, description: service.description || '', price: service.price, duration: service.duration });
  }, [service]);

  const onChange = (field: keyof ServiceFormData, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!service || !data.title || !data.name || data.price <= 0 || data.duration <= 0) return;
    setLoading(true);
    try {
      await dispatch(updateService({ serviceId: service.serviceId, data: { ...data, description: data.description || undefined, durationMinutes: data.duration } })).unwrap();
      onSuccess();
    } catch (err) { console.error('Erro ao atualizar serviço:', err); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Editar Serviço" open={open} onCancel={onClose} onOk={handleSubmit}
      okText="Salvar Alterações" cancelText="Cancelar" confirmLoading={loading}
      okButtonProps={{ disabled: loading || !data.title || !data.name || data.price <= 0 || data.duration <= 0 }}>
      <ServiceFormFields data={data} onChange={onChange} />
    </Modal>
  );
};

export default EditServiceDialog;
