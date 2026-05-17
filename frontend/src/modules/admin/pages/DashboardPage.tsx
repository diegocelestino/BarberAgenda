import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Space, Spin } from 'antd';
import AdminLayout from '../layout/AdminLayout';
import TodaysOverview from '../components/TodaysOverview';
import WeeklyRevenueSection from '../components/WeeklyRevenueSection';
import TodaysAgenda from '../components/TodaysAgenda';
import { AppointmentItem } from '../types';
import { barberApi, Barber } from '../../../services/api';
import { appointmentsApi } from '../../../services/appointmentsApi';
import { financialApi } from '../../../services/financialApi';
import { servicesApi } from '../../../services/servicesApi';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentItem[]>([]);
  const [revenueToday, setRevenueToday] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedBarbers, servicesList] = await Promise.all([
          barberApi.getAll(),
          servicesApi.getAll(),
        ]);
        setBarbers(fetchedBarbers);

        const serviceNameMap = new Map(servicesList.map((s: any) => [s.serviceId, s.name]));

        // Fetch today's appointments for all barbers
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

        const appointmentPromises = fetchedBarbers.map((barber) =>
          appointmentsApi.getByBarber(barber.barberId, { startDate: startOfDay, endDate: endOfDay })
            .then((appts) => appts.map((a) => ({
              time: new Date(a.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              customer: a.customerName,
              phone: a.customerPhone || '',
              service: serviceNameMap.get(a.service) || a.service,
              duration: `${Math.round((a.endTime - a.startTime) / 60000)} min`,
              barber: barber.name,
              status: (a.status === 'scheduled' ? 'confirmed' : a.status === 'completed' ? 'in-progress' : 'cancelled') as AppointmentItem['status'],
            })))
        );

        const results = await Promise.all(appointmentPromises);
        const allAppointments = results.flat().sort((a, b) => a.time.localeCompare(b.time));
        setTodayAppointments(allAppointments);

        // Fetch today's revenue
        const todayStr = today.toISOString().split('T')[0];
        try {
          const summary = await financialApi.getSummary(todayStr, todayStr);
          setRevenueToday(summary.revenue);
        } catch {
          setRevenueToday(0);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const remaining = todayAppointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length;

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
          appointmentsToday={todayAppointments.length}
          remaining={remaining}
          revenueToday={revenueToday}
          barberCount={barbers.length}
        />
        <WeeklyRevenueSection />
        <TodaysAgenda appointments={todayAppointments} />
      </Space>
    </AdminLayout>
  );
};

export default DashboardPage;
