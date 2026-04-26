import { useEffect } from 'react';
import { Alert, Spin, Tag, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchServices, selectAllServices, selectServicesLoading } from '../../store/services';

const { Text } = Typography;

interface ServiceTagSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const ServiceTagSelector: React.FC<ServiceTagSelectorProps> = ({ selectedIds, onChange }) => {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const loading = useAppSelector(selectServicesLoading);

  useEffect(() => { if (services.length === 0) dispatch(fetchServices()); }, [services.length, dispatch]);

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spin size="small" /><Text type="secondary">Carregando serviços...</Text></div>;
  if (services.length === 0) return <Alert type="info" message="Nenhum serviço disponível. Por favor, crie serviços primeiro." />;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {services.map((s) => (
        <Tag key={s.serviceId} color={selectedIds.includes(s.serviceId) ? 'gold' : undefined}
          onClick={() => toggle(s.serviceId)} style={{ cursor: 'pointer', padding: '4px 12px' }}>
          {s.title}
        </Tag>
      ))}
    </div>
  );
};

export default ServiceTagSelector;
