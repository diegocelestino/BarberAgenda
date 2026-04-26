import { useState, useEffect } from 'react';
import { Input, InputNumber, Modal, Typography } from 'antd';
import { useAppDispatch } from '../../store/hooks';
import { updateService } from '../../store/services';
import { Service } from '../../services/servicesApi';

const { Text } = Typography;

interface EditServiceDialogProps { open: boolean; service: Service | null; onClose: () => void; onSuccess: () => void; }

const EditServiceDialog: React.FC<EditServiceDialogProps> = ({ open, service, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(30);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (service) { setTitle(service.title); setName(service.name); setDescription(service.description || ''); setPrice(service.price); setDuration(service.duration); }
  }, [service]);

  const handleSubmit = async () => {
    if (!service || !title || !name || price <= 0 || duration <= 0) return;
    setLoading(true);
    try {
      await dispatch(updateService({ serviceId: service.serviceId, data: { title, name, description: description || undefined, price, duration, durationMinutes: duration } })).unwrap();
      onSuccess();
    } catch (err) { console.error('Failed to update service:', err); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Edit Service" open={open} onCancel={onClose} onOk={handleSubmit}
      okText="Save Changes" confirmLoading={loading} okButtonProps={{ disabled: loading || !title || !name || price <= 0 || duration <= 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <div><label>Service Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} /><Text type="secondary" style={{ fontSize: 12 }}>Internal title for admin use</Text></div>
        <div><label>Display Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /><Text type="secondary" style={{ fontSize: 12 }}>Name shown to customers</Text></div>
        <div><label>Description</label><Input.TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /><Text type="secondary" style={{ fontSize: 12 }}>Optional description for customers</Text></div>
        <div><label>Price (R$)</label><InputNumber min={0} step={5} value={price} onChange={(v) => setPrice(v || 0)} style={{ width: '100%' }} /></div>
        <div><label>Duration (minutes)</label><InputNumber min={15} step={15} value={duration} onChange={(v) => setDuration(v || 15)} style={{ width: '100%' }} /></div>
      </div>
    </Modal>
  );
};

export default EditServiceDialog;
