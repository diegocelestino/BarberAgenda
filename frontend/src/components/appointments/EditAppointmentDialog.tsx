import { useState, useEffect } from 'react';
import { Alert, Input, Modal, Select, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAppointment } from '../../store/appointments';
import { Appointment } from '../../services/appointmentsApi';
import { useBarberServices } from '../../hooks/useBarberServices';
import { formatDateTimeLocal, parseDateTimeLocal, addMinutes, isPast, isFuture, getCurrentDateTimeLocal } from '../../utils/dateTime';

const { Text } = Typography;

interface Props { open: boolean; appointment: Appointment | null; barberId: string; onClose: () => void; onSuccess: () => void; }

const EditAppointmentDialog: React.FC<Props> = ({ open, appointment, barberId, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const allAppointments = useAppSelector((state) => state.appointments.appointments);
  const { services, loading: servicesLoading } = useBarberServices(barberId, open);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ customerName: '', customerPhone: '', serviceId: '', startTime: '', status: 'scheduled' as string, notes: '' });

  useEffect(() => {
    if (appointment) {
      setFormData({
        customerName: appointment.customerName, customerPhone: appointment.customerPhone || '',
        serviceId: appointment.service, startTime: formatDateTimeLocal(appointment.startTime),
        status: appointment.status, notes: appointment.notes || '',
      });
      setError('');
    }
  }, [appointment]);

  const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const selectedService = services.find(s => s.serviceId === formData.serviceId);

  const handleSubmit = async () => {
    setError('');
    if (!appointment || !formData.serviceId) return;
    if (!selectedService) { setError('Por favor, selecione um serviço válido'); return; }
    const serviceDuration = selectedService.durationMinutes || selectedService.duration;
    if (!serviceDuration) { setError('Serviço inválido - duração não encontrada'); return; }

    const startTime = parseDateTimeLocal(formData.startTime);
    const endTime = addMinutes(startTime, serviceDuration);

    if (isPast(startTime) && formData.status === 'scheduled') { setError('Não é possível agendar no passado'); return; }
    if (formData.status === 'completed' && isFuture(startTime)) { setError('Não é possível concluir um agendamento futuro'); return; }

    const hasConflict = allAppointments.some((apt) => {
      if (apt.appointmentId === appointment.appointmentId || apt.status === 'cancelled' || apt.barberId !== barberId) return false;
      return startTime < apt.endTime && endTime > apt.startTime;
    });
    if (hasConflict) { setError('Este horário conflita com outro agendamento.'); return; }

    setLoading(true);
    try {
      await dispatch(updateAppointment({ barberId, appointmentId: appointment.appointmentId,
        data: { customerName: formData.customerName, customerPhone: formData.customerPhone || undefined, service: formData.serviceId, startTime, endTime, status: formData.status as 'scheduled' | 'completed' | 'cancelled', notes: formData.notes || undefined },
      })).unwrap();
      onSuccess();
    } catch (err: any) { setError(err.message || 'Erro ao atualizar agendamento'); }
    finally { setLoading(false); }
  };

  const statusOptions = [
    { value: 'scheduled', label: 'Agendado', disabled: appointment ? isPast(appointment.startTime) : false },
    { value: 'completed', label: 'Concluído', disabled: appointment ? isFuture(appointment.startTime) : false },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  return (
    <Modal title="Editar Agendamento" open={open} onCancel={onClose} onOk={handleSubmit}
      okText="Salvar Alterações" cancelText="Cancelar" confirmLoading={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        {error && <Alert type="error" message={error} showIcon />}
        <div><label>Nome do Cliente</label><Input value={formData.customerName} onChange={(e) => handleChange('customerName', e.target.value)} /></div>
        <div><label>Telefone do Cliente</label><Input value={formData.customerPhone} onChange={(e) => handleChange('customerPhone', e.target.value)} /></div>
        <div>
          <label>Serviço</label>
          <Select style={{ width: '100%' }} value={formData.serviceId || undefined} onChange={(v) => handleChange('serviceId', v)}
            loading={servicesLoading} disabled={servicesLoading}
            options={services.map(s => ({ value: s.serviceId, label: s.title || s.name }))} />
          {selectedService && <Text type="secondary" style={{ fontSize: 12 }}>Duração: {selectedService.durationMinutes || selectedService.duration} minutos</Text>}
        </div>
        <div><label>Horário de Início</label><Input type="datetime-local" value={formData.startTime} onChange={(e) => handleChange('startTime', e.target.value)}
          min={formData.status === 'scheduled' ? getCurrentDateTimeLocal() : undefined} /></div>
        <div><label>Status</label><Select style={{ width: '100%' }} value={formData.status} onChange={(v) => handleChange('status', v)} options={statusOptions} /></div>
        <div><label>Notas</label><Input.TextArea rows={3} value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} /></div>
      </div>
    </Modal>
  );
};

export default EditAppointmentDialog;
