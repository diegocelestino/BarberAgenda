import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tabs,
  Avatar,
  Tag,
  TimePicker,
  InputNumber,
  Form,
  Spin,
  message,
} from 'antd';
import {
  LeftOutlined,
  StarFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import TimelineView from '../components/TimelineView';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchBarberById, updateBarber } from '../../../store/barbers/barbersThunks';
import { fetchServices } from '../../../store/services/servicesThunks';
import { appointmentsApi } from '../../../services/appointmentsApi';
import { TimelineAppointment } from '../components/TimelineView';

const { Title, Text } = Typography;

// ─── Agenda Tab ──────────────────────────────────────────────────────────────

function AgendaTab({ barberId, serviceNameMap }: { barberId: string; serviceNameMap: Map<string, string> }) {
  const [appointments, setAppointments] = useState<TimelineAppointment[]>([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetch = async () => {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
      const appts = await appointmentsApi.getByBarber(barberId, { startDate: startOfDay, endDate: endOfDay });
      setAppointments(appts.map((a) => ({
        id: a.appointmentId,
        startTime: a.startTime,
        endTime: a.endTime,
        customer: a.customerName,
        phone: a.customerPhone || '',
        service: serviceNameMap.get(a.service) || a.service,
        barber: '',
        status: (a.status === 'scheduled' ? 'confirmed' : a.status === 'completed' ? 'in-progress' : 'cancelled') as TimelineAppointment['status'],
      })));
    };
    fetch();
  }, [barberId, date, serviceNameMap]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space>
        <Button onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d); }}>←</Button>
        <Button onClick={() => setDate(new Date())}>Hoje</Button>
        <Button onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d); }}>→</Button>
        <Text strong style={{ textTransform: 'capitalize' }}>
          {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </Space>
      <TimelineView appointments={appointments} />
    </Space>
  );
}

// ─── Serviços Tab ────────────────────────────────────────────────────────────

function ServicosTab({ barber, services, onUpdate }: { barber: any; services: any[]; onUpdate: (serviceIds: string[]) => void }) {
  const currentIds = barber.serviceIds || [];

  const toggle = (serviceId: string) => {
    const newIds = currentIds.includes(serviceId)
      ? currentIds.filter((id: string) => id !== serviceId)
      : [...currentIds, serviceId];
    onUpdate(newIds);
  };

  return (
    <Space direction="vertical" size="middle">
      <Text type="secondary">Selecione os serviços que este barbeiro oferece.</Text>
      <Space wrap>
        {services.map((s) => (
          <Tag
            key={s.serviceId}
            color={currentIds.includes(s.serviceId) ? 'gold' : undefined}
            style={{ cursor: 'pointer', padding: '4px 12px' }}
            onClick={() => toggle(s.serviceId)}
          >
            {s.name} ({s.duration} min — R$ {s.price})
          </Tag>
        ))}
      </Space>
    </Space>
  );
}

// ─── Horários Tab ────────────────────────────────────────────────────────────

function HorariosTab({ barber, onUpdate }: { barber: any; onUpdate: (schedule: any) => void }) {
  const schedule = barber.schedule || {};
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      openTime: schedule.openTime ? dayjs(schedule.openTime, 'HH:mm') : dayjs('09:00', 'HH:mm'),
      closeTime: schedule.closeTime ? dayjs(schedule.closeTime, 'HH:mm') : dayjs('20:00', 'HH:mm'),
      lunchStart: schedule.lunchStart ? dayjs(schedule.lunchStart, 'HH:mm') : dayjs('13:00', 'HH:mm'),
      lunchEnd: schedule.lunchEnd ? dayjs(schedule.lunchEnd, 'HH:mm') : dayjs('14:00', 'HH:mm'),
      slotInterval: schedule.slotInterval || 30,
    });
  }, [barber]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    const values = form.getFieldsValue();
    onUpdate({
      openTime: values.openTime?.format('HH:mm'),
      closeTime: values.closeTime?.format('HH:mm'),
      lunchStart: values.lunchStart?.format('HH:mm'),
      lunchEnd: values.lunchEnd?.format('HH:mm'),
      workDays: schedule.workDays || [1, 2, 3, 4, 5, 6],
      slotInterval: values.slotInterval,
    });
  };

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 400 }}>
      <Row gutter={16}>
        <Col span={12}><Form.Item name="openTime" label="Abertura"><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="closeTime" label="Fechamento"><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}><Form.Item name="lunchStart" label="Início almoço"><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col>
        <Col span={12}><Form.Item name="lunchEnd" label="Fim almoço"><TimePicker format="HH:mm" style={{ width: '100%' }} /></Form.Item></Col>
      </Row>
      <Form.Item name="slotInterval" label="Intervalo entre horários (min)" style={{ display: 'none' }}>
        <InputNumber min={5} max={60} step={5} style={{ width: '100%' }} />
      </Form.Item>
      <Button type="primary" onClick={handleSave}>Salvar horários</Button>
    </Form>
  );
}

// ─── Comissão Tab ────────────────────────────────────────────────────────────

function ComissaoTab({ barber, onUpdate }: { barber: any; onUpdate: (percentage: number) => void }) {
  const [value, setValue] = useState(barber.commissionPercentage || 40);

  return (
    <Space direction="vertical" size="middle">
      <Text type="secondary">Porcentagem de comissão sobre cada serviço realizado.</Text>
      <Space>
        <InputNumber min={0} max={100} value={value} onChange={(v) => setValue(v || 0)} addonAfter="%" />
        <Button type="primary" onClick={() => onUpdate(value)}>Salvar</Button>
      </Space>
    </Space>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const BarberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const barber = useAppSelector((state) => state.barbers.selectedBarber);
  const services = useAppSelector((state) => state.services.services);
  const loading = useAppSelector((state) => state.barbers.loading);
  const [activeTab, setActiveTab] = useState('agenda');

  useEffect(() => {
    if (id) dispatch(fetchBarberById(id));
    if (services.length === 0) dispatch(fetchServices());
  }, [id, dispatch, services.length]);

  const serviceNameMap = new Map(services.map((s: any) => [s.serviceId, s.name]));

  const handleUpdateServices = async (serviceIds: string[]) => {
    if (!id) return;
    await dispatch(updateBarber({ barberId: id, data: { serviceIds } }));
    message.success('Serviços atualizados');
  };

  const handleUpdateSchedule = async (schedule: any) => {
    if (!id) return;
    await dispatch(updateBarber({ barberId: id, data: { schedule } }));
    message.success('Horários salvos');
  };

  const handleUpdateCommission = async (commissionPercentage: number) => {
    if (!id) return;
    await dispatch(updateBarber({ barberId: id, data: { commissionPercentage } as any }));
    message.success('Comissão atualizada');
  };

  if (loading || !barber) {
    return (
      <AdminLayout selectedKey="barbers">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <AdminLayout selectedKey="barbers">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button icon={<LeftOutlined />} type="text" onClick={() => navigate('/admin/barbeiros')} />
              <Avatar size={48} style={{ backgroundColor: '#c8a05c' }}>{getInitials(barber.name)}</Avatar>
              <div>
                <Title level={3} style={{ margin: 0 }}>{barber.name}</Title>
                <Space>
                  <StarFilled style={{ color: '#c8a05c' }} />
                  <Text>{barber.rating}</Text>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
            { key: 'agenda', label: 'Agenda', children: <AgendaTab barberId={barber.barberId} serviceNameMap={serviceNameMap} /> },
            { key: 'servicos', label: 'Serviços', children: <ServicosTab barber={barber} services={services} onUpdate={handleUpdateServices} /> },
            { key: 'horarios', label: 'Horários', children: <HorariosTab barber={barber} onUpdate={handleUpdateSchedule} /> },
            { key: 'comissao', label: 'Comissão', children: <ComissaoTab barber={barber} onUpdate={handleUpdateCommission} /> },
          ]} />
        </Card>
      </Space>
    </AdminLayout>
  );
};

export default BarberDetailPage;
