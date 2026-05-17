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
  Modal,
  Form,
  InputNumber,
  message,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import AdminLayout from '../layout/AdminLayout';
import { servicesApi, Service } from '../../../services/servicesApi';

const { Title, Text } = Typography;

const ServicesPage: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  const fetchServices = async () => {
    try {
      const data = await servicesApi.getAll();
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const filtered = services.filter((s) => {
    if (!search) return true;
    return s.name.toLowerCase().includes(search.toLowerCase());
  });

  // ─── Actions ─────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingService(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue({ name: service.name, price: service.price, duration: service.duration });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingService) {
        await servicesApi.update(editingService.serviceId, {
          title: values.name,
          name: values.name,
          price: values.price,
          duration: values.duration,
          durationMinutes: values.duration,
        });
        message.success('Serviço atualizado');
      } else {
        await servicesApi.create({
          title: values.name,
          name: values.name,
          price: values.price,
          duration: values.duration,
          durationMinutes: values.duration,
          description: '',
        });
        message.success('Serviço criado');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDelete = (service: Service) => {
    Modal.confirm({
      title: 'Excluir serviço',
      icon: <ExclamationCircleOutlined />,
      content: `Tem certeza que deseja excluir "${service.name}"? Esta ação não pode ser desfeita.`,
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await servicesApi.delete(service.serviceId);
        message.success('Serviço excluído');
        fetchServices();
      },
    });
  };

  const handleToggleActive = async (service: Service) => {
    const newActive = service.active === false ? true : false;
    await servicesApi.update(service.serviceId, { active: newActive } as any);
    message.success(newActive ? 'Serviço ativado' : 'Serviço desativado');
    fetchServices();
  };

  // ─── Menu ────────────────────────────────────────────────────────────────

  const actionsMenu = (service: Service) => ({
    items: [
      { key: 'edit', label: 'Editar serviço' },
      { key: 'toggle', label: service.active === false ? 'Ativar' : 'Desativar' },
      { type: 'divider' as const },
      { key: 'delete', label: 'Excluir', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'edit') openEdit(service);
      if (key === 'toggle') handleToggleActive(service);
      if (key === 'delete') handleDelete(service);
    },
  });

  // ─── Table ───────────────────────────────────────────────────────────────

  const columns = [
    {
      title: 'Serviço',
      dataIndex: 'name',
      sorter: (a: Service, b: Service) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Duração',
      dataIndex: 'duration',
      width: 100,
      sorter: (a: Service, b: Service) => a.duration - b.duration,
      render: (d: number) => `${d} min`,
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      width: 100,
      sorter: (a: Service, b: Service) => a.price - b.price,
      render: (p: number) => <Text strong>R$ {p}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      width: 100,
      render: (active: boolean) => active !== false
        ? <Tag color="green">Ativo</Tag>
        : <Tag color="red">Inativo</Tag>,
    },
    {
      title: '',
      width: 50,
      render: (_: any, record: Service) => (
        <Dropdown menu={actionsMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminLayout selectedKey="services">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedKey="services">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Serviços</Title>
            <Text type="secondary">Gerencie o catálogo de serviços, preços e duração.</Text>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {isMobile ? 'Novo' : 'Novo serviço'}
            </Button>
          </Col>
        </Row>

        <Card>
          <Input
            placeholder="Buscar por nome"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ marginBottom: 16, maxWidth: isMobile ? '100%' : 400 }}
          />

          {isMobile ? (
            <List
              dataSource={filtered}
              locale={{ emptyText: 'Nenhum serviço encontrado.' }}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Dropdown menu={actionsMenu(item)} trigger={['click']}>
                      <Button type="text" icon={<MoreOutlined />} size="small" />
                    </Dropdown>
                  }
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`${item.duration} min · R$ ${item.price}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Table
              dataSource={filtered}
              columns={columns}
              rowKey="serviceId"
              size="middle"
              pagination={{ pageSize: 10, showTotal: (total) => `${total} serviços` }}
              locale={{ emptyText: 'Nenhum serviço encontrado.' }}
            />
          )}
        </Card>
      </Space>

      {/* Create / Edit Modal */}
      <Modal
        title={editingService ? 'Editar serviço' : 'Novo serviço'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Nome é obrigatório' }]}>
            <Input placeholder="Ex: Corte + Barba" />
          </Form.Item>
          <Form.Item name="price" label="Preço (R$)" rules={[{ required: true, message: 'Preço é obrigatório' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="75" />
          </Form.Item>
          <Form.Item name="duration" label="Duração (minutos)" rules={[{ required: true, message: 'Duração é obrigatória' }]}>
            <InputNumber min={5} style={{ width: '100%' }} placeholder="40" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default ServicesPage;
