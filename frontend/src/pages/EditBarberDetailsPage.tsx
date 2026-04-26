import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Input, InputNumber, Spin, Tag, Typography, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBarberById, updateBarber, selectSelectedBarber,
  selectBarbersLoading, selectBarbersError, clearSelectedBarber,
} from '../store/barbers';
import { fetchServices, selectAllServices, selectServicesLoading } from '../store/services';

const { Title, Text } = Typography;

const EditBarberDetailsPage: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);
  const services = useAppSelector(selectAllServices);
  const servicesLoading = useAppSelector(selectServicesLoading);

  const [name, setName] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(5);

  useEffect(() => { if (services.length === 0) dispatch(fetchServices()); }, [services.length, dispatch]);
  useEffect(() => {
    if (barberId) dispatch(fetchBarberById(barberId));
    return () => { dispatch(clearSelectedBarber()); };
  }, [barberId, dispatch]);
  useEffect(() => {
    if (barber) { setName(barber.name); setSelectedServiceIds(barber.serviceIds); setRating(barber.rating); }
  }, [barber]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !barberId || selectedServiceIds.length === 0) return;
    try {
      await dispatch(updateBarber({ barberId, data: { name: name.trim(), serviceIds: selectedServiceIds, rating } })).unwrap();
      message.success('Barbeiro atualizado com sucesso!');
      setTimeout(() => navigate(`/admin/barber/${barberId}`), 1500);
    } catch (err) {
      console.error('Failed to update barber:', err);
    }
  };

  if (loading && !barber) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><Spin size="large" /></div>;
  }
  if (error) return <Alert type="error" message={error} showIcon style={{ margin: 16 }} />;
  if (!barber) return <Alert type="warning" message="Barbeiro não encontrado" showIcon style={{ margin: 16 }} />;

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', padding: '24px 16px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(`/admin/barber/${barberId}`)} style={{ marginRight: 8 }} />
          <Title level={4} style={{ margin: 0 }}>Editar Detalhes - {barber.name}</Title>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label>Nome</label>
            <Input size="large" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div style={{ marginBottom: 20 }}>
            <Text strong>Serviços *</Text>
            <div style={{ marginTop: 8 }}>
              {servicesLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spin size="small" /><Text type="secondary">Carregando serviços...</Text></div>
              ) : services.length === 0 ? (
                <Alert type="info" message="Nenhum serviço disponível. Por favor, crie serviços primeiro." />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {services.map((service) => (
                    <Tag key={service.serviceId}
                      color={selectedServiceIds.includes(service.serviceId) ? 'gold' : undefined}
                      onClick={() => handleToggleService(service.serviceId)}
                      style={{ cursor: 'pointer', padding: '4px 12px' }}>
                      {service.title}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>Avaliação</label>
            <InputNumber size="large" min={0} max={5} step={0.1} value={rating} onChange={(v) => setRating(v || 0)} style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Button block onClick={() => navigate(`/admin/barber/${barberId}`)}>Cancelar</Button>
            <Button block type="primary" htmlType="submit" size="large" icon={<SaveOutlined />}
              disabled={loading || !name.trim() || selectedServiceIds.length === 0}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditBarberDetailsPage;
