import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Select, Grid, Spin, Segmented } from 'antd';
import { PlusOutlined, LeftOutlined, RightOutlined, UnorderedListOutlined, CalendarOutlined } from '@ant-design/icons';
import AdminLayout from '../layout/AdminLayout';
import AppointmentStats from '../components/AppointmentStats';
import AppointmentsTable from '../components/AppointmentsTable';
import TimelineView from '../components/TimelineView';
import CreateAppointmentModal from '../components/CreateAppointmentModal';
import { useDayAppointments } from '../hooks/useDayAppointments';

const { Title, Text } = Typography;

const AgendaPage: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<string>('timeline');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { loading, barbers, appointments, timelineData, refetch } = useDayAppointments(currentDate);

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
        onCreated={refetch}
        defaultDate={currentDate}
      />
    </AdminLayout>
  );
};

export default AgendaPage;
