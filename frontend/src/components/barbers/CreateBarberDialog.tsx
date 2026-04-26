import { useState, useEffect } from 'react';
import { Alert, Input, InputNumber, Modal, Spin, Tag, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createBarber, selectBarbersLoading } from '../../store/barbers';
import { fetchServices, selectAllServices, selectServicesLoading } from '../../store/services';

const { Text } = Typography;

interface CreateBarberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBarberDialog: React.FC<CreateBarberDialogProps> = ({ open, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectBarbersLoading);
  const services = useAppSelector(selectAllServices);
  const servicesLoading = useAppSelector(selectServicesLoading);

  const [name, setName] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(5);

  useEffect(() => { if (open && services.length === 0) dispatch(fetchServices()); }, [open, services.length, dispatch]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds(prev => prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]);
  };

  const handleSubmit = async () => {
    if (!name.trim() || selectedServiceIds.length === 0) return;
    try {
      await dispatch(createBarber({ name: name.trim(), serviceIds: selectedServiceIds, rating })).unwrap();
      setName(''); setSelectedServiceIds([]); setRating(5);
      onSuccess();
    } catch (err) { console.error('Failed to create barber:', err); }
  };

  const handleClose = () => { setName(''); setSelectedServiceIds([]); setRating(5); onClose(); };

  return (
    <Modal title="New Barber" open={open} onCancel={handleClose} onOk={handleSubmit}
      okText={loading ? 'Creating...' : 'Create'} okButtonProps={{ disabled: loading || !name.trim() || selectedServiceIds.length === 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <div>
          <label>Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Text strong>Services *</Text>
          <div style={{ marginTop: 8 }}>
            {servicesLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spin size="small" /><Text type="secondary">Loading services...</Text></div>
            ) : services.length === 0 ? (
              <Alert type="info" message="No services available. Please create services first." />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {services.map((service) => (
                  <Tag key={service.serviceId} color={selectedServiceIds.includes(service.serviceId) ? 'gold' : undefined}
                    onClick={() => handleToggleService(service.serviceId)} style={{ cursor: 'pointer', padding: '4px 12px' }}>
                    {service.title}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label>Rating</label>
          <InputNumber min={0} max={5} step={0.1} value={rating} onChange={(v) => setRating(v || 0)} style={{ width: '100%' }} />
        </div>
      </div>
    </Modal>
  );
};

export default CreateBarberDialog;
