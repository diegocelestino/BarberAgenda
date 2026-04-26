import { useState, useEffect } from 'react';
import { Alert, Modal } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createService, selectServicesLoading, selectServicesError } from '../../store/services';
import ServiceFormFields, { ServiceFormData } from './ServiceFormFields';

const initial: ServiceFormData = { title: '', name: '', description: '', price: 30, duration: 30 };

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

const CreateServiceDialog: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectServicesLoading);
  const error = useAppSelector(selectServicesError);
  const [data, setData] = useState(initial);

  useEffect(() => { if (open) setData(initial); }, [open]);

  const onChange = (field: keyof ServiceFormData, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!data.title || !data.name || data.price <= 0 || data.duration <= 0) return;
    try {
      await dispatch(createService({ ...data, description: data.description || undefined, durationMinutes: data.duration })).unwrap();
      onSuccess();
    } catch (err) { console.error('Erro ao criar serviço:', err); }
  };

  return (
    <Modal title="Novo Serviço" open={open} onCancel={onClose} onOk={handleSubmit}
      okText={loading ? 'Criando...' : 'Criar'} cancelText="Cancelar"
      okButtonProps={{ disabled: loading || !data.title || !data.name || data.price <= 0 || data.duration <= 0 }}>
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
      <ServiceFormFields data={data} onChange={onChange} />
    </Modal>
  );
};

export default CreateServiceDialog;
