import { useEffect, useState } from 'react';
import { Button, Card, Rate, Tag, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Barber, barberApi } from '../../services/api';

const { Title, Text } = Typography;

interface BarberCardProps {
  barber: Barber;
  onDelete: (barberId: string) => void;
}

const BarberCard: React.FC<BarberCardProps> = ({ barber, onDelete }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const barberServices = await barberApi.getServices(barber.barberId);
        setServices(barberServices);
      } catch (err) {
        console.error('Error loading services:', err);
      }
    };
    loadServices();
  }, [barber.barberId]);

  return (
    <Card
      hoverable
      onClick={() => navigate(`/admin/barber/${barber.barberId}`)}
      style={{ height: '100%', position: 'relative' }}
      extra={
        <Button type="text" danger size="small" icon={<DeleteOutlined />}
          onClick={(e) => { e.stopPropagation(); onDelete(barber.barberId); }} />
      }
    >
      <Title level={5} style={{ margin: 0, marginBottom: 8 }}>{barber.name}</Title>

      <div style={{ marginBottom: 12 }}>
        <Rate disabled allowHalf value={barber.rating} style={{ fontSize: 14 }} />
        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{barber.rating.toFixed(1)} / 5.0</Text>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {services.map((s, i) => (
          <Tag key={i} color="gold">{s.title || s.name}</Tag>
        ))}
      </div>
    </Card>
  );
};

export default BarberCard;
