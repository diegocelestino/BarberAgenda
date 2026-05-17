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
  Tabs,
  Avatar,
  Descriptions,
  Progress,
  Collapse,
  Dropdown,
  Grid,
  List,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  MoreOutlined,
  PhoneOutlined,
  MailOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import { customersApi, Customer } from '../../../services/customersApi';

const { Title, Text, Link } = Typography;

// ─── Customer Summary ────────────────────────────────────────────────────────

function CustomerSummary({ customer }: { customer: Customer }) {
  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space size="middle" align="start">
          <Avatar size={56} style={{ backgroundColor: '#c8a05c', fontSize: 20 }}>
            {getInitials(customer.name)}
          </Avatar>
          <div>
            <Title level={3} style={{ margin: 0 }}>{customer.name}</Title>
            <Text type="secondary">Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Text>
          </div>
        </Space>

        <Descriptions column={{ xs: 1, sm: 2, md: 4 }} size="small">
          <Descriptions.Item label={<><PhoneOutlined /> Telefone</>}>
            <Link href={`tel:${customer.phone}`}>{customer.phone}</Link>
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>
            {customer.email ? <Link href={`mailto:${customer.email}`}>{customer.email}</Link> : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Total visitas">
            <Text strong>{customer.totalVisits}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Total gasto">
            <Text strong>R$ {customer.totalSpent.toLocaleString('pt-BR')}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Última visita">
            {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('pt-BR') : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Pontos fidelidade">
            <Tag color="gold">{customer.loyaltyPoints} pts</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Card>
  );
}

// ─── Appointment History Tab ─────────────────────────────────────────────────

function AppointmentHistoryTab() {
  // TODO: fetch real appointment history for this customer
  const appointments = [
    { date: '18/06/2025', time: '10:00', service: 'Corte + Barba', duration: '40 min', barber: 'Miguel Castilho', price: 75, status: 'completed' },
    { date: '22/05/2025', time: '14:30', service: 'Corte', duration: '30 min', barber: 'Miguel Castilho', price: 40, status: 'completed' },
    { date: '10/04/2025', time: '09:00', service: 'Barba', duration: '10 min', barber: 'Miguel Castilho', price: 35, status: 'completed' },
    { date: '14/03/2025', time: '11:00', service: 'Corte + Barba', duration: '40 min', barber: 'Miguel Castilho', price: 75, status: 'completed' },
    { date: '28/02/2025', time: '16:00', service: 'Corte', duration: '30 min', barber: 'Miguel Castilho', price: 40, status: 'cancelled' },
  ];

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const statusMap: Record<string, { color: string; label: string }> = {
    completed: { color: 'green', label: 'Concluído' },
    cancelled: { color: 'red', label: 'Cancelado' },
    scheduled: { color: 'blue', label: 'Agendado' },
  };

  if (isMobile) {
    return (
      <List
        dataSource={appointments}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<Space><Text strong>{item.date}</Text><Text>{item.service}</Text><Tag color={statusMap[item.status].color}>{statusMap[item.status].label}</Tag></Space>}
              description={`${item.time} · ${item.duration} · ${item.barber} · R$ ${item.price}`}
            />
          </List.Item>
        )}
      />
    );
  }

  return (
    <Table
      dataSource={appointments}
      rowKey={(r) => `${r.date}-${r.time}`}
      pagination={{ pageSize: 5 }}
      size="small"
      columns={[
        { title: 'Data', dataIndex: 'date', width: 110 },
        { title: 'Horário', dataIndex: 'time', width: 80 },
        { title: 'Serviço', dataIndex: 'service', width: 150, render: (t: string, r: any) => <><Text>{t}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{r.duration}</Text></> },
        { title: 'Barbeiro', dataIndex: 'barber', width: 140 },
        { title: 'Valor', dataIndex: 'price', width: 90, render: (v: number) => <Text strong>R$ {v}</Text> },
        { title: 'Status', dataIndex: 'status', width: 110, render: (s: string) => <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag> },
      ]}
    />
  );
}

// ─── Notes Tab ───────────────────────────────────────────────────────────────

function NotesTab({ customer }: { customer: Customer }) {
  const notes = [
    { id: '1', title: 'Preferências', author: 'Miguel Castilho', date: '18/06/2025', content: 'Cliente prefere corte degradê com 2 nas laterais e mais comprido em cima. Barba aparada em 5mm. Sempre chega 5 min antes.' },
    { id: '2', title: 'Alerta de alergia', author: 'Admin', date: '14/03/2025', content: 'Cliente tem sensibilidade a produtos com PPD. Sempre verificar ingredientes antes de aplicar coloração.' },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle">
        <Col><Text type="secondary">Notas internas visíveis apenas para a equipe.</Text></Col>
        <Col><Button icon={<PlusOutlined />}>Nova nota</Button></Col>
      </Row>
      <Collapse
        defaultActiveKey={['1']}
        items={notes.map((note) => ({
          key: note.id,
          label: <Text strong>{note.title}</Text>,
          extra: <Text type="secondary" style={{ fontSize: 12 }}>{note.author} · {note.date}</Text>,
          children: <Text>{note.content}</Text>,
        }))}
      />
    </Space>
  );
}

// ─── Loyalty Tab ─────────────────────────────────────────────────────────────

function LoyaltyTab({ customer }: { customer: Customer }) {
  // TODO: Fetch reward threshold from Settings/config endpoint
  // Currently hardcoded: 500 pts = 1 free service
  // Settings page should configure: pointsPerReal, pointsForReward, rewardDescription
  const REWARD_THRESHOLD = 500;
  const transactions = [
    { date: '18/06/2025', description: 'Corte + Barba', type: 'earned', points: 75 },
    { date: '22/05/2025', description: 'Corte', type: 'earned', points: 40 },
    { date: '10/04/2025', description: 'Barba', type: 'earned', points: 35 },
    { date: '14/03/2025', description: 'Corte + Barba', type: 'earned', points: 75 },
    { date: '01/03/2025', description: 'Resgate: barba grátis', type: 'redeemed', points: -200 },
  ];

  const typeMap: Record<string, { color: string; label: string }> = {
    earned: { color: 'green', label: 'Ganho' },
    redeemed: { color: 'red', label: 'Resgatado' },
    bonus: { color: 'blue', label: 'Bônus' },
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small"><Text type="secondary">Saldo atual</Text><Title level={3} style={{ margin: 0 }}>{customer.loyaltyPoints} pts</Title></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small"><Text type="secondary">Total ganho</Text><Title level={3} style={{ margin: 0 }}>{customer.totalSpent} pts</Title></Card>
        </Col>
      </Row>

      <div>
        <Text strong>Progresso para próximo resgate</Text>
        <Progress percent={Math.min(100, (customer.loyaltyPoints % REWARD_THRESHOLD) / REWARD_THRESHOLD * 100)} status="active" />
        <Text type="secondary">{REWARD_THRESHOLD - (customer.loyaltyPoints % REWARD_THRESHOLD)} pts para o próximo resgate</Text>
      </div>

      <Table
        dataSource={transactions}
        rowKey={(r) => `${r.date}-${r.description}`}
        size="small"
        pagination={false}
        columns={[
          { title: 'Data', dataIndex: 'date', width: 110 },
          { title: 'Descrição', dataIndex: 'description' },
          { title: 'Tipo', dataIndex: 'type', width: 100, render: (t: string) => <Tag color={typeMap[t].color}>{typeMap[t].label}</Tag> },
          { title: 'Pontos', dataIndex: 'points', width: 90, render: (p: number) => <Text strong style={{ color: p > 0 ? '#50c878' : '#ff5252' }}>{p > 0 ? '+' : ''}{p}</Text> },
        ]}
      />
    </Space>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await customersApi.getById(id);
        setCustomer(data);
      } catch (err) {
        console.error('Failed to fetch customer:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !customer) {
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
            <Space>
              <Button icon={<LeftOutlined />} type="text" onClick={() => navigate('/admin/clientes')} />
              <div>
                <Title level={2} style={{ margin: 0 }}>{customer.name}</Title>
                <Text type="secondary">Perfil do cliente e histórico de agendamentos.</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<EditOutlined />}>Editar</Button>
              <Button type="primary" icon={<PlusOutlined />}>Novo agendamento</Button>
              <Dropdown menu={{ items: [
                { key: 'message', label: 'Enviar mensagem' },
                { key: 'export', label: 'Exportar histórico' },
                { type: 'divider' },
                { key: 'deactivate', label: 'Desativar cliente', danger: true },
              ]}} trigger={['click']}>
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          </Col>
        </Row>

        <CustomerSummary customer={customer} />

        <Card>
          <Tabs
            defaultActiveKey="appointments"
            items={[
              { key: 'appointments', label: 'Histórico', children: <AppointmentHistoryTab /> },
              { key: 'notes', label: 'Notas', children: <NotesTab customer={customer} /> },
              { key: 'loyalty', label: 'Fidelidade', children: <LoyaltyTab customer={customer} /> },
            ]}
          />
        </Card>
      </Space>
    </AdminLayout>
  );
};

export default CustomerDetailPage;
