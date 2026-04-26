import { useState } from 'react';
import { Alert, Input, InputNumber, Modal, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createService, selectServicesLoading, selectServicesError } from '../../store/services';

const { Text } = Typography;

interface CreateServiceDialogProps { open: boolean; onClose: () => void; onSuccess: () => void; }

const CreateServiceDialog: React.FC<CreateServiceDialogProps> = ({ open, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectServicesLoading);
  const error = useAppSelector(selectServicesError);

  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(30);
  const [duration, setDuration] = useState(30);

  const handleSubmit = async () => {
    if (!title || !name || price <= 0 || duration <= 0) return;
    try {
      await dispatch(createService({ title, name, description: description || undefined, price, duration, durationMinutes: duration })).unwrap();
      setTitle(''); setName(''); setDescription(''); setPrice(30); setDuration(30);
      onSuccess();
    } catch (err) { console.error('Failed to create service:', err); }
  };

  const handleClose = () => { setTitle(''); setName(''); setDescription(''); setPrice(30); setDuration(30); onClose(); };

  return (
    <Modal title="New Service" open={open} onCancel={handleClose} onOk={handleSubmit}
      okText={loading ? 'Creating...' : 'Create'} okButtonProps={{ disabled: loading || !title || !name || price <= 0 || duration <= 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        {error && <Alert type="error" message={error} showIcon />}
        <div><label>Service Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Haircut" /><Text type="secondary" style={{ fontSize: 12 }}>Internal title for admin use</Text></div>
        <div><label>Display Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Professional Haircut" /><Text type="secondary" style={{ fontSize: 12 }}>Name shown to customers</Text></div>
        <div><label>Description</label><Input.TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Professional haircut with styling" /><Text type="secondary" style={{ fontSize: 12 }}>Optional description for customers</Text></div>
        <div><label>Price (R$)</label><InputNumber min={0} step={5} value={price} onChange={(v) => setPrice(v || 0)} style={{ width: '100%' }} /></div>
        <div><label>Duration (minutes)</label><InputNumber min={15} step={15} value={duration} onChange={(v) => setDuration(v || 15)} style={{ width: '100%' }} /></div>
      </div>
    </Modal>
  );
};

export default CreateServiceDialog;
