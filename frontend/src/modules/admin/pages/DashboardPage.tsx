import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Typography, Space, Spin } from 'antd';
import AdminLayout from '../layout/AdminLayout';
import TodaysOverview from '../components/TodaysOverview';
import WeeklyRevenueSection from '../components/WeeklyRevenueSection';
import TodaysAgenda from '../components/TodaysAgenda';
import { useDayAppointments } from '../hooks/useDayAppointments';
import { financialApi } from '../../../services/financialApi';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const { loading, barbers, appointments } = useDayAppointments(today);
  const [revenueToday, setRevenueToday] = useState(0);

  useEffect(() => {
    const todayStr = today.toISOString().split('T')[0];
    financialApi.getSummary(todayStr, todayStr)
      .then((s) => setRevenueToday(s.revenue))
      .catch(() => setRevenueToday(0));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remaining = appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length;

  if (loading) {
    return (
      <AdminLayout selectedKey="dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedKey="dashboard">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
            <Text type="secondary">Visão geral da atividade e desempenho de hoje.</Text>
          </Col>
        </Row>

        <TodaysOverview
          appointmentsToday={appointments.length}
          remaining={remaining}
          revenueToday={revenueToday}
          barberCount={barbers.length}
        />
        <WeeklyRevenueSection />
        <TodaysAgenda appointments={appointments} />
      </Space>
    </AdminLayout>
  );
};

export default DashboardPage;
