import { useState, useEffect } from 'react';
import { Alert, Input, Modal, Select, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAppointment, selectAppointmentsLoading, selectAppointmentsError } from '../../store/appointments';
import { barberApi } from '../../services/api';
import { parseDateTime, addMinutes, isPast, getTodayDateString } from '../../utils/dateTime';

const { Text } = Typography;

interface CreateAppointmentDialogProps {
  open: boolean;
  barberId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAppointmentDialog: React.FC<CreateAppointmentDialogProps> = ({ open, barberId, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppointmentsLoading);
  const error = useAppSelector(selectAppointmentsError);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try { setServicesLoading(true); setServicesError(null); setAvailableServices(await barberApi.getServices(barberId)); }
      catch { setServicesError('Failed to load services'); }
      finally { setServicesLoading(false); }
    };
    load();
  }, [open, barberId]);

  const getSelectedService = () => availableServices.find(s => s.serviceId === selectedServiceId);

  const handleSubmit = async () => {
    if (!customerName || !date || !startTime || !selectedServiceId) return;
    const selectedService = getSelectedService();
    if (!selectedService) return;
    const serviceDuration = selectedService.durationMinutes || selectedService.duration;
    if (!serviceDuration) return;
    const startDateTime = parseDateTime(date, startTime);
    const endDateTime = addMinutes(startDateTime, serviceDuration);
    if (isPast(startDateTime)) { alert('Cannot schedule an appointment in the past'); return; }
    if (endDateTime <= startDateTime) { alert('Invalid duration'); return; }
    try {
      await dispatch(createAppointment({ barberId, data: { customerName, customerPhone, startTime: startDateTime, endTime: endDateTime, service: selectedServiceId, notes } })).unwrap();
      setCustomerName(''); setCustomerPhone(''); setDate(''); setStartTime(''); setSelectedServiceId(''); setNotes('');
      onSuccess();
    } catch (err) { console.error('Failed to create appointment:', err); }
  };

  const handleClose = () => { setCustomerName(''); setCustomerPhone(''); setDate(''); setStartTime(''); setSelectedServiceId(''); setNotes(''); onClose(); };

  const selectedService = getSelectedService();

  return (
    <Modal title="New Appointment" open={open} onCancel={handleClose} onOk={handleSubmit}
      okText={loading ? 'Creating...' : 'Create'} okButtonProps={{ disabled: loading || !customerName || !date || !startTime || !selectedServiceId }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        {error && <Alert type="error" message={error} showIcon />}
        {servicesError && <Alert type="error" message={servicesError} showIcon />}

        <div><label>Customer Name</label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
        <div><label>Phone Number</label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></div>

        <div>
          <label>Service</label>
          <Select style={{ width: '100%' }} value={selectedServiceId || undefined} onChange={setSelectedServiceId}
            placeholder="Select a service" loading={servicesLoading} disabled={servicesLoading}
            options={availableServices.map(s => ({ value: s.serviceId, label: s.title || s.name }))} />
          {selectedService && <Text type="secondary" style={{ fontSize: 12 }}>Duration: {selectedService.durationMinutes || selectedService.duration} minutes</Text>}
        </div>

        <div><label>Date</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={getTodayDateString()} /></div>
        <div><label>Start Time</label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
        <div><label>Notes</label><Input.TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      </div>
    </Modal>
  );
};

export default CreateAppointmentDialog;
