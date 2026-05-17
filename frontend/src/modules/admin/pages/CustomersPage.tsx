import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Dropdown,
  Grid,
  List,
  Spin,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  MoreOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import AdminLayout from '../layout/AdminLayout';
import CreateCustomerModal from '../components/CreateCustomerModal';
import { Customer } from '../../../services/customersApi';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCustomers } from '../../../store/customers/customersThunks';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const CustomersPage: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { customers, loading } = useAppSelector((state) => state.customers);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (customers.length === 0) dispatch(fetchCustomers());
  }, [dispatch, customers.length]);

  const filtered = customers
    .filter((c) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return c.name.toLowerCase().includes(s) || c.phone.includes(s) || (c.email || '').toLowerCase().includes(s);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const actionsMenu = (customer: Customer) => ({
    items: [
      { key: 'view', label: 'Ver perfil' },
      { key: 'book', label: 'Agendar horário' },
      { key: 'edit', label: 'Editar cliente' },
      { type: 'divider' as const },
      { key: 'delete', label: 'Excluir', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'view') navigate(`/admin/clientes/${customer.customerId}`);
    },
  });

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'name',
      sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Space>
          <Avatar style={{ backgroundColor: '#c8a05c' }}>{getInitials(name)}</Avatar>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      width: 160,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 200,
      render: (email: string) => email || '—',
    },
    {
      title: 'Visitas',
      dataIndex: 'totalVisits',
      width: 90,
      sorter: (a: Customer, b: Customer) => a.totalVisits - b.totalVisits,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: 'Pontos',
      dataIndex: 'loyaltyPoints',
      width: 100,
      sorter: (a: Customer, b: Customer) => a.loyaltyPoints - b.loyaltyPoints,
      render: (pts: number) => <Tag>{pts} pts</Tag>,
    },
    {
      title: 'Total gasto',
      dataIndex: 'totalSpent',
      width: 120,
      sorter: (a: Customer, b: Customer) => a.totalSpent - b.totalSpent,
      render: (v: number) => `R$ ${v.toLocaleString('pt-BR')}`,
    },
    {
      title: 'Última visita',
      dataIndex: 'lastVisit',
      width: 130,
      sorter: (a: Customer, b: Customer) => (a.lastVisit || '').localeCompare(b.lastVisit || ''),
      render: (date: string) => date ? new Date(date).toLocaleDateString('pt-BR') : '—',
    },
    {
      title: '',
      width: 50,
      render: (_: any, record: Customer) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Dropdown menu={actionsMenu(record)} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout selectedKey="customers">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedKey="customers">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Clientes</Title>
            <Text type="secondary">Gerencie clientes, histórico de visitas e pontos de fidelidade.</Text>
          </Col>
          <Col>
            <Space>
              {!isMobile && <Button icon={<DownloadOutlined />}>Exportar</Button>}
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>{isMobile ? 'Novo' : 'Novo cliente'}</Button>
            </Space>
          </Col>
        </Row>

        <Card>
          <Input
            placeholder="Buscar por nome, telefone ou email"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ marginBottom: 16, maxWidth: isMobile ? '100%' : 400 }}
          />

          {isMobile ? (
            <List
              dataSource={filtered}
              locale={{ emptyText: 'Nenhum cliente encontrado.' }}
              renderItem={(item) => (
                <List.Item
                  onClick={() => navigate(`/admin/clientes/${item.customerId}`)}
                  style={{ cursor: 'pointer' }}
                  extra={
                    <span onClick={(e) => e.stopPropagation()}>
                      <Dropdown menu={actionsMenu(item)} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} size="small" />
                      </Dropdown>
                    </span>
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#c8a05c' }}>{getInitials(item.name)}</Avatar>}
                    title={item.name}
                    description={`${item.phone} · ${item.totalVisits} visitas · R$ ${item.totalSpent}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Table
              dataSource={filtered}
              columns={columns}
              rowKey="customerId"
              size="middle"
              onRow={(record) => ({ onClick: () => navigate(`/admin/clientes/${record.customerId}`), style: { cursor: 'pointer' } })}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} clientes` }}
              locale={{ emptyText: 'Nenhum cliente encontrado.' }}
            />
          )}
        </Card>
      </Space>

      <CreateCustomerModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => dispatch(fetchCustomers())}
      />
    </AdminLayout>
  );
};

export default CustomersPage;
