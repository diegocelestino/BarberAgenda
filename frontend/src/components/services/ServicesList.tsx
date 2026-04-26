import { useEffect, useState } from 'react';
import { Alert, Button, Spin, Table, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchServices, selectAllServices, selectServicesLoading, selectServicesError } from '../../store/services';
import { Service } from '../../services/servicesApi';
import CreateServiceDialog from './CreateServiceDialog';
import EditServiceDialog from './EditServiceDialog';
import DeleteServiceDialog from './DeleteServiceDialog';

const { Title, Text } = Typography;

const ServicesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const loading = useAppSelector(selectServicesLoading);
  const error = useAppSelector(selectServicesError);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => { dispatch(fetchServices()); }, [dispatch]);

  if (loading && services.length === 0) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><Spin size="large" /></div>;
  if (error) return <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />;

  const columns = [
    {
      title: 'Serviço', dataIndex: 'name', key: 'name',
      render: (_: string, record: Service) => (<><Text strong>{record.name}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{record.title}</Text></>),
    },
    { title: 'Preço', dataIndex: 'price', key: 'price', align: 'right' as const, render: (v: number) => <Text type="secondary">R$ {v}</Text> },
    { title: 'Duração', dataIndex: 'duration', key: 'duration', align: 'right' as const, render: (v: number) => <Text type="secondary">{v} min</Text> },
    {
      title: 'Ações', key: 'actions', align: 'right' as const,
      render: (_: any, record: Service) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setSelectedService(record); setEditDialogOpen(true); }} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => { setSelectedService(record); setDeleteDialogOpen(true); }} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Serviços</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDialogOpen(true)}>Novo Serviço</Button>
      </div>

      {services.length === 0 ? (
        <Alert type="info" message="Nenhum serviço encontrado. Crie um para começar!" showIcon />
      ) : (
        <Table columns={columns} dataSource={services} rowKey="serviceId" pagination={false} size="small" />
      )}

      <CreateServiceDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} onSuccess={() => setCreateDialogOpen(false)} />
      <EditServiceDialog open={editDialogOpen} service={selectedService} onClose={() => setEditDialogOpen(false)} onSuccess={() => { setEditDialogOpen(false); setSelectedService(null); }} />
      <DeleteServiceDialog open={deleteDialogOpen} serviceId={selectedService?.serviceId || null} serviceName={selectedService?.title || null}
        onConfirm={() => { setDeleteDialogOpen(false); setSelectedService(null); }} onCancel={() => setDeleteDialogOpen(false)} />
    </div>
  );
};

export default ServicesList;
