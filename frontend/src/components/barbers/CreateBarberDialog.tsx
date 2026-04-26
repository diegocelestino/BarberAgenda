import { useState, useEffect } from 'react';
import { Input, InputNumber, Modal } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createBarber, selectBarbersLoading } from '../../store/barbers';
import ServiceTagSelector from '../common/ServiceTagSelector';

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

const CreateBarberDialog: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectBarbersLoading);
  const [name, setName] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [rating, setRating] = useState(5);

  useEffect(() => { if (open) { setName(''); setSelectedServiceIds([]); setRating(5); } }, [open]);

  const handleSubmit = async () => {
    if (!name.trim() || selectedServiceIds.length === 0) return;
    try {
      await dispatch(createBarber({ name: name.trim(), serviceIds: selectedServiceIds, rating })).unwrap();
      onSuccess();
    } catch (err) { console.error('Erro ao criar barbeiro:', err); }
  };

  return (
    <Modal title="Novo Barbeiro" open={open} onCancel={onClose} onOk={handleSubmit}
      okText={loading ? 'Criando...' : 'Criar'} cancelText="Cancelar"
      okButtonProps={{ disabled: loading || !name.trim() || selectedServiceIds.length === 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <div><label>Nome</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label>Serviços *</label><div style={{ marginTop: 8 }}><ServiceTagSelector selectedIds={selectedServiceIds} onChange={setSelectedServiceIds} /></div></div>
        <div><label>Avaliação</label><InputNumber min={0} max={5} step={0.1} value={rating} onChange={(v) => setRating(v || 0)} style={{ width: '100%' }} /></div>
      </div>
    </Modal>
  );
};

export default CreateBarberDialog;
