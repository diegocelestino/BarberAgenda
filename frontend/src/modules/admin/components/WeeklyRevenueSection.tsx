import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Typography, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import { financialApi } from '../../../services/financialApi';

const { Title, Text } = Typography;

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const WeeklyRevenueSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [revenueByDay, setRevenueByDay] = useState<{ day: string; value: number }[]>([]);
  const [revenueByService, setRevenueByService] = useState<{ service: string; value: number }[]>([]);
  const [totalWeek, setTotalWeek] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - 6);
        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const transactions = await financialApi.getTransactions({ startDate, endDate, type: 'revenue' });

        // Group by day
        const dayMap = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = DAY_NAMES[d.getDay()];
          dayMap.set(`${key}-${i}`, 0);
        }

        const dayData: { day: string; value: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayRevenue = transactions
            .filter((t) => t.date === dateStr)
            .reduce((sum, t) => sum + t.amount, 0);
          dayData.push({ day: DAY_NAMES[d.getDay()], value: dayRevenue });
        }
        setRevenueByDay(dayData);

        // Group by service (using description as proxy)
        const serviceMap = new Map<string, number>();
        transactions.forEach((t) => {
          const name = t.description || 'Outros';
          serviceMap.set(name, (serviceMap.get(name) || 0) + t.amount);
        });
        const serviceData = Array.from(serviceMap.entries())
          .map(([service, value]) => ({ service, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setRevenueByService(serviceData);

        setTotalWeek(transactions.reduce((sum, t) => sum + t.amount, 0));
      } catch (err) {
        console.error('Failed to fetch weekly revenue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Card title="Receita semanal"><Spin /></Card>;
  }

  return (
    <Card title="Receita semanal" extra={<Button icon={<DownloadOutlined />}>Exportar</Button>}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Column
          data={revenueByDay}
          xField="day"
          yField="value"
          height={220}
          color="#c8a05c"
          theme="dark"
        />
        <div>
          <Title level={5}>Receita por cliente</Title>
          <Text type="secondary" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Top 5 clientes por receita esta semana.
          </Text>
          {revenueByService.length > 0 && (
            <Pie
              data={revenueByService}
              angleField="value"
              colorField="service"
              radius={0.8}
              innerRadius={0.6}
              height={200}
              theme="dark"
              statistic={{
                title: { content: 'Total' },
                content: { content: `R$ ${totalWeek.toLocaleString('pt-BR')}` },
              }}
              legend={{ position: 'right' }}
            />
          )}
        </div>
      </Space>
    </Card>
  );
};

export default WeeklyRevenueSection;
