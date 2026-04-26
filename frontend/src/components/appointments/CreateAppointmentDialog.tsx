import { useState, useEffect } from 'react';
import { Alert, Input, Modal, Select, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAppointment, selectAppointmentsLoading } from '../../store/appointments';
import { useBarberServices } from '../../hooks/useBarberServices';
import { parseDateTime, addMinutes, isPast, getTodayDateString } from '../../utils/dateTime';

const { Text } = Typography;

interface Props { open: boolean; barberId: string; onClose: () => void; onSuccess: () => void; }

const CreateAppointmentDialog: React.FC<Props> = ({ open, barberId, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppointmentsLoading);
  const { services, loading: servicesLoading } = useBarberServices(barberId, open);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setCustomerName(''); setCustomerPhone(''); setDate(''); setStartTime(''); setSelectedServiceId(''); setNotes(''); setError(''); } }, [open]);

  const selectedService = services.find(s => s.serviceId === selectedServiceId);

  const handleSubmit = async () => {
    setError('');
    if (!customerName || !date || !startTime || !selectedServiceId) return;
    if (!selectedService) return;
    const serviceDuration = selectedService.durationMinutes || selectedService.duration;
    if (!serviceDuration) return;
    const startDateTime = parseDateTime(date, startTime);
    const endDateTime = addMinutes(startDateTime, serviceDuration);
    if (isPast(startDateTime)) { setError('Não é possível agendar no passado'); return; }
    try {
      await dispatch(createAppointment({ barberId, data: { customerName, customerPhone, startTime: startDateTime, endTime: endDateTime, service: selectedServiceId, notes } })).unwrap();
      onSuccess();
    } catch (err) { console.error('Erro ao criar agendamento:', err); }
  };

  return (
    <Modal title="Novo Agendamento" open={open} onCancel={onClose} onOk={handleSubmit}
      okText={loading ? 'Criando...' : 'Criar'} cancelText="Cancelar"
      okButtonProps={{ disabled: loading || !customerName || !date || !startTime || !selectedServiceId }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        {error && <Alert type="error" message={error} showIcon />}
        <div><label>Nome do Cliente</label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
        <div><label>Telefone</label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></div>
        <div>
          <label>Serviço</label>
          <Select style={{ width: '100%' }} value={selectedServiceId || undefined} onChange={setSelectedServiceId}
            placeholder="Selecione um serviço" loading={servicesLoading} disabled={servicesLoading}
            options={services.map(s => ({ value: s.serviceId, label: s.title || s.name }))} />
          {selectedService && <Text type="secondary" style={{ fontSize: 12 }}>Duração: {selectedService.durationMinutes || selectedService.duration} minutos</Text>}
        </div>
        <div><label>Data</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={getTodayDateString()} /></div>
        <div><label>Horário</label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
        <div><label>Notas</label><Input.TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      </div>
    </Modal>
  );
};

export default CreateAppointmentDialog;
