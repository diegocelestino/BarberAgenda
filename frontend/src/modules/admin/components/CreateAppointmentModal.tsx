import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Steps, Button, Space, Typography, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { barberApi, Barber } from '../../../services/api';
import { servicesApi, Service } from '../../../services/servicesApi';
import { appointmentsApi } from '../../../services/appointmentsApi';
import TimelineView, { TimelineAppointment } from './TimelineView';

const { Text } = Typography;

interface CreateAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultDate?: Date;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({ open, onClose, onCreated, defaultDate }) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs(defaultDate || new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<TimelineAppointment[]>([]);
  const [serviceNameMap, setServiceNameMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (open) {
      setStep(0);
      setSelectedTime(null);
      setSelectedDate(dayjs(defaultDate || new Date()));
      form.resetFields();
      Promise.all([barberApi.getAll(), servicesApi.getAll()]).then(([b, s]) => {
        setBarbers(b);
        setServices(s);
        setServiceNameMap(new Map(s.map((svc: any) => [svc.serviceId, svc.name])));
      });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDayData = async (date: dayjs.Dayjs) => {
    const barberId = form.getFieldValue('barberId');
    const serviceId = form.getFieldValue('serviceId');
    if (!barberId || !serviceId) return;

    const service = services.find((s) => s.serviceId === serviceId);
    if (!service) return;

    const startOfDay = date.startOf('day').valueOf();
    const endOfDay = date.endOf('day').valueOf();

    try {
      const appts = await appointmentsApi.getByBarber(barberId, { startDate: startOfDay, endDate: endOfDay });

      const barber = barbers.find((b) => b.barberId === barberId);
      setExistingAppointments(appts.map((a) => ({
        id: a.appointmentId,
        startTime: a.startTime,
        endTime: a.endTime,
        customer: a.customerName,
        phone: a.customerPhone || '',
        service: serviceNameMap.get(a.service) || a.service,
        barber: barber?.name || '',
        status: (a.status === 'scheduled' ? 'confirmed' : a.status === 'completed' ? 'in-progress' : 'cancelled') as TimelineAppointment['status'],
      })));
    } catch {
      setExistingAppointments([]);
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields(['customerName', 'barberId', 'serviceId']);
      setStep(1);
      fetchDayData(selectedDate);
    } catch { /* validation failed */ }
  };

  const navigateDay = (offset: number) => {
    const newDate = selectedDate.add(offset, 'day');
    setSelectedDate(newDate);
    setSelectedTime(null);
    fetchDayData(newDate);
  };

  const handleSlotClick = (slot: string) => {
    setSelectedTime(slot);
  };

  const handleSave = async () => {
    if (!selectedTime) {
      message.warning('Selecione um horário');
      return;
    }

    try {
      const values = form.getFieldsValue();
      setLoading(true);

      const service = services.find((s) => s.serviceId === values.serviceId);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const startTime = new Date(`${dateStr}T${selectedTime}:00-03:00`).getTime();
      const endTime = startTime + (service?.duration || 30) * 60 * 1000;

      await appointmentsApi.create(values.barberId, {
        customerName: values.customerName,
        customerPhone: values.customerPhone || '',
        service: values.serviceId,
        startTime,
        endTime,
      });

      message.success('Agendamento criado');
      onCreated();
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        message.error('Horário conflita com outro agendamento');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: dayjs.Dayjs) =>
    date.toDate().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Modal
      title="Novo agendamento"
      open={open}
      onCancel={onClose}
      width={step === 1 ? 600 : 480}
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflow: 'auto' } }}
      footer={
        <Space>
          {step === 1 && <Button onClick={() => setStep(0)}>Voltar</Button>}
          <Button onClick={onClose}>Cancelar</Button>
          {step === 0
            ? <Button type="primary" onClick={handleNext}>Próximo</Button>
            : <Button type="primary" onClick={handleSave} loading={loading} disabled={!selectedTime}>
                Agendar {selectedTime ? `às ${selectedTime}` : ''}
              </Button>
          }
        </Space>
      }
    >
      <Steps current={step} size="small" style={{ marginBottom: 24 }} items={[
        { title: 'Cliente e serviço' },
        { title: 'Data e horário' },
      ]} />

      <Form form={form} layout="vertical">
        {/* Step 1: Client + Service */}
        <div style={{ display: step === 0 ? 'block' : 'none' }}>
          <Form.Item name="customerName" label="Nome do cliente" rules={[{ required: true, message: 'Nome é obrigatório' }]}>
            <Input placeholder="Ex: João Silva" />
          </Form.Item>
          <Form.Item name="customerPhone" label="Telefone">
            <Input placeholder="+5511999887766" />
          </Form.Item>
          <Form.Item name="barberId" label="Barbeiro" rules={[{ required: true, message: 'Selecione um barbeiro' }]}>
            <Select placeholder="Selecione" options={barbers.map((b) => ({ label: b.name, value: b.barberId }))} />
          </Form.Item>
          <Form.Item name="serviceId" label="Serviço" rules={[{ required: true, message: 'Selecione um serviço' }]}>
            <Select
              placeholder="Selecione"
              options={services.map((s) => ({ label: `${s.name} (${s.duration} min — R$ ${s.price})`, value: s.serviceId }))}
            />
          </Form.Item>
        </div>

        {/* Step 2: Date + Timeline */}
        {step === 1 && (
          <div>
            {/* Day navigation */}
            <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'center' }}>
              <Button icon={<LeftOutlined />} onClick={() => navigateDay(-1)} />
              <Button onClick={() => { setSelectedDate(dayjs()); fetchDayData(dayjs()); }}>Hoje</Button>
              <Button icon={<RightOutlined />} onClick={() => navigateDay(1)} />
            </Space>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Text strong style={{ textTransform: 'capitalize' }}>{formatDate(selectedDate)}</Text>
            </div>

            {/* Available slots as clickable tags */}
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Clique na timeline para selecionar o horário.</Text>
            </div>

            {/* Timeline showing existing appointments — click to select slot */}
            <div style={{ height: 'calc(100vh - 420px)', minHeight: 300 }}>
              <TimelineView
                appointments={existingAppointments}
                startHour={8}
                endHour={21}
                onSlotClick={handleSlotClick}
                selectedSlot={selectedTime}
                selectedDuration={services.find((s) => s.serviceId === form.getFieldValue('serviceId'))?.duration || 30}
              />
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default CreateAppointmentModal;
