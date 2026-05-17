import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Space,
  Input,
  Dropdown,
  Grid,
  Avatar,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  SearchOutlined,
  CalendarOutlined,
  StarFilled,
} from '@ant-design/icons';
import AdminLayout from '../layout/AdminLayout';
import { barberApi, Barber } from '../../../services/api';
import { servicesApi } from '../../../services/servicesApi';

const { Title, Text } = Typography;

const BarbersPage: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Map<string, string>>(new Map());
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedBarbers, servicesList] = await Promise.all([
          barberApi.getAll(),
          servicesApi.getAll(),
        ]);
        setBarbers(fetchedBarbers);
        setServices(new Map(servicesList.map((s: any) => [s.serviceId, s.name])));
      } catch (err) {
        console.error('Failed to fetch barbers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = barbers.filter((b) => {
    if (!search) return true;
    return b.name.toLowerCase().includes(search.toLowerCase());
  });

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const actionsMenu = (barber: Barber) => ({
    items: [
      { key: 'edit', label: 'Editar perfil' },
      { key: 'services', label: 'Gerenciar serviços' },
      { key: 'commission', label: 'Ver comissões' },
      { type: 'divider' as const },
      { key: 'deactivate', label: 'Desativar', danger: true },
    ],
  });

  if (loading) {
    return (
      <AdminLayout selectedKey="barbers">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedKey="barbers">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Barbeiros</Title>
            <Text type="secondary">Gerencie a equipe, horários e serviços atribuídos.</Text>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />}>{isMobile ? 'Novo' : 'Novo barbeiro'}</Button>
          </Col>
        </Row>

        <Input
          placeholder="Buscar por nome"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ maxWidth: isMobile ? '100%' : 400 }}
        />

        <Row gutter={[16, 16]}>
          {filtered.map((barber) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={barber.barberId}>
              <Card
                hoverable
                actions={[
                  <Button type="text" icon={<CalendarOutlined />} key="schedule">Agenda</Button>,
                  <Dropdown menu={actionsMenu(barber)} trigger={['click']} key="more">
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>,
                ]}
              >
                <Card.Meta
                  avatar={<Avatar size={48} style={{ backgroundColor: '#c8a05c' }}>{getInitials(barber.name)}</Avatar>}
                  title={barber.name}
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space>
                        <StarFilled style={{ color: '#c8a05c', fontSize: 14 }} />
                        <Text strong>{barber.rating}</Text>
                      </Space>
                      <Space wrap size={[4, 4]}>
                        {(barber.serviceIds || []).slice(0, 3).map((sid) => (
                          <Tag key={sid} style={{ fontSize: 11 }}>{services.get(sid) || sid}</Tag>
                        ))}
                        {(barber.serviceIds || []).length > 3 && (
                          <Tag style={{ fontSize: 11 }}>+{barber.serviceIds.length - 3}</Tag>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
          {filtered.length === 0 && (
            <Col span={24}>
              <Card><Text type="secondary">Nenhum barbeiro encontrado.</Text></Card>
            </Col>
          )}
        </Row>
      </Space>
    </AdminLayout>
  );
};

export default BarbersPage;
