import { useState, useEffect } from 'react';
import { Alert, Input, Modal, Select, Spin, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAppointment, updateAppointment } from '../../store/appointments';
import { fetchServices, selectAllServices, selectServicesLoading } from '../../store/services';

const { Text } = Typography;

interface RegisterWalkInDialogProps {
  open: boolean;
  barberId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterWalkInDialog: React.FC<RegisterWalkInDialogProps> = ({ open, barberId, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const servicesLoading = useAppSelector(selectServicesLoading);

  const [customerName, setCustomerName] = useState('LOJA');
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (services.length === 0) dispatch(fetchServices()); }, [services.length, dispatch]);
  useEffect(() => { if (open) { setCustomerName('LOJA'); setSelectedService(''); setError(''); } }, [open]);

  const handleSubmit = async () => {
    setError('');
    if (!customerName.trim() || !selectedService) { setError('Por favor, preencha todos os campos obrigatórios'); return; }
    setLoading(true);
    try {
      const now = Date.now();
      const created = await dispatch(createAppointment({ barberId, data: { customerName: customerName.trim(), customerPhone: '', service: selectedService, startTime: now, endTime: now + 1000, notes: 'Atendimento sem agendamento' } })).unwrap();
      await dispatch(updateAppointment({ barberId, appointmentId: created.appointmentId, data: { status: 'completed' } })).unwrap();
      onSuccess();
    } catch (err: any) { setError(err.message || 'Erro ao registrar atendimento'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Registrar Atendimento" open={open} onCancel={onClose} onOk={handleSubmit}
      okText={loading ? 'Registrando...' : 'Registrar'} confirmLoading={loading}
      okButtonProps={{ disabled: loading || servicesLoading || services.length === 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        {error && <Alert type="error" message={error} showIcon />}

        <div>
          <label>Nome do Cliente</label>
          <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <Text type="secondary" style={{ fontSize: 12 }}>Padrão: LOJA (pode ser editado)</Text>
        </div>

        {servicesLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spin size="small" /><span>Carregando serviços...</span></div>
        ) : services.length === 0 ? (
          <Alert type="warning" message="Nenhum serviço disponível. Por favor, crie serviços primeiro." />
        ) : (
          <div>
            <label>Serviço Realizado</label>
            <Select style={{ width: '100%' }} value={selectedService || undefined} onChange={setSelectedService} placeholder="Selecione um serviço"
              options={services.map(s => ({ value: s.serviceId, label: `${s.title} - R$ ${s.price} (${s.duration} min)` }))} />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RegisterWalkInDialog;
