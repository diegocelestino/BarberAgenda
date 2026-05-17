import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Select, Grid, Spin, Segmented } from 'antd';
import { PlusOutlined, LeftOutlined, RightOutlined, UnorderedListOutlined, CalendarOutlined } from '@ant-design/icons';
import AdminLayout from '../layout/AdminLayout';
import AppointmentStats from '../components/AppointmentStats';
import AppointmentsTable from '../components/AppointmentsTable';
import TimelineView, { TimelineAppointment } from '../components/TimelineView';
import CreateAppointmentModal from '../components/CreateAppointmentModal';
import { AppointmentItem } from '../types';
import { barberApi, Barber } from '../../../services/api';
import { appointmentsApi } from '../../../services/appointmentsApi';
import { servicesApi } from '../../../services/servicesApi';

const { Title, Text } = Typography;

const AgendaPage: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineAppointment[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<string>('timeline');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedBarbers, servicesList] = await Promise.all([
        barberApi.getAll(),
        servicesApi.getAll(),
      ]);
      setBarbers(fetchedBarbers);
      const serviceNameMap = new Map(servicesList.map((s: any) => [s.serviceId, s.name]));

      const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

      const results = await Promise.all(
        fetchedBarbers.map((barber) =>
          appointmentsApi.getByBarber(barber.barberId, { startDate: startOfDay, endDate: endOfDay })
            .then((appts) => appts.map((a) => ({
              raw: a,
              barberName: barber.name,
              item: {
                time: new Date(a.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                customer: a.customerName,
                phone: a.customerPhone || '',
                service: serviceNameMap.get(a.service) || a.service,
                duration: `${Math.round((a.endTime - a.startTime) / 60000)} min`,
                barber: barber.name,
                status: (a.status === 'scheduled' ? 'confirmed' : a.status === 'completed' ? 'in-progress' : 'cancelled') as AppointmentItem['status'],
              },
              timeline: {
                id: a.appointmentId,
                startTime: a.startTime,
                endTime: a.endTime,
                customer: a.customerName,
                phone: a.customerPhone || '',
                service: serviceNameMap.get(a.service) || a.service,
                barber: barber.name,
                status: (a.status === 'scheduled' ? 'confirmed' : a.status === 'completed' ? 'in-progress' : 'cancelled') as TimelineAppointment['status'],
              },
            })))
        )
      );

      const flat = results.flat().sort((a, b) => a.item.time.localeCompare(b.item.time));
      setAppointments(flat.map((f) => f.item));
      setTimelineData(flat.map((f) => f.timeline));
    } catch (err) {
      console.error('Failed to fetch agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredAppointments = selectedBarber === 'all'
    ? appointments
    : appointments.filter((a) => a.barber === selectedBarber);

  const filteredTimeline = selectedBarber === 'all'
    ? timelineData
    : timelineData.filter((a) => a.barber === selectedBarber);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const navigateDay = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d);
  };

  const barberOptions = [
    { label: 'Todos os barbeiros', value: 'all' },
    ...barbers.map((b) => ({ label: b.name, value: b.name })),
  ];

  if (loading) {
    return (
      <AdminLayout selectedKey="agenda">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedKey="agenda">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Agenda</Title>
            <Text type="secondary">Visualize e gerencie todos os agendamentos.</Text>
          </Col>
          <Col>
            {!isMobile && <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>Novo agendamento</Button>}
          </Col>
        </Row>

        <Card>
          <Space direction={isMobile ? 'vertical' : 'horizontal'} size="middle" style={{ width: '100%', marginBottom: 16 }} wrap>
            <Select
              value={selectedBarber}
              options={barberOptions}
              onChange={setSelectedBarber}
              style={{ minWidth: 180 }}
            />
            <Space>
              <Button icon={<LeftOutlined />} onClick={() => navigateDay(-1)} />
              <Button onClick={() => setCurrentDate(new Date())}>Hoje</Button>
              <Button icon={<RightOutlined />} onClick={() => navigateDay(1)} />
            </Space>
            <Segmented
              value={viewMode}
              options={[
                { label: 'Timeline', value: 'timeline', icon: <CalendarOutlined /> },
                { label: 'Lista', value: 'list', icon: <UnorderedListOutlined /> },
              ]}
              onChange={(v) => setViewMode(v as string)}
            />
            {isMobile && <Button type="primary" icon={<PlusOutlined />} block onClick={() => setCreateModalOpen(true)}>Novo agendamento</Button>}
          </Space>

          <Space direction="vertical" size="small" style={{ marginBottom: 16 }}>
            <Text strong style={{ textTransform: 'capitalize' }}>{formatDate(currentDate)}</Text>
            <AppointmentStats appointments={filteredAppointments} />
          </Space>

          {viewMode === 'timeline' ? (
            <TimelineView appointments={filteredTimeline} />
          ) : (
            <AppointmentsTable
              appointments={filteredAppointments}
              emptyText="Nenhum agendamento para este dia."
            />
          )}
        </Card>
      </Space>

      <CreateAppointmentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchData}
        defaultDate={currentDate}
      />
    </AdminLayout>
  );
};

export default AgendaPage;
