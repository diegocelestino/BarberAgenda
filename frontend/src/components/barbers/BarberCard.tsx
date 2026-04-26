import { Button, Card, Rate, Tag, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Barber } from '../../services/api';
import { useBarberServices } from '../../hooks/useBarberServices';

const { Title, Text } = Typography;

interface Props { barber: Barber; onDelete: (barberId: string) => void; }

const BarberCard: React.FC<Props> = ({ barber, onDelete }) => {
  const navigate = useNavigate();
  const { services } = useBarberServices(barber.barberId);

  return (
    <Card hoverable onClick={() => navigate(`/admin/barber/${barber.barberId}`)}
      style={{ height: '100%' }}
      extra={<Button type="text" danger size="small" icon={<DeleteOutlined />}
        onClick={(e) => { e.stopPropagation(); onDelete(barber.barberId); }} />}>
      <Title level={5} style={{ margin: 0, marginBottom: 8 }}>{barber.name}</Title>
      <div style={{ marginBottom: 12 }}>
        <Rate disabled allowHalf value={barber.rating} style={{ fontSize: 14 }} />
        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{barber.rating.toFixed(1)} / 5.0</Text>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {services.map((s, i) => <Tag key={i} color="gold">{s.title || s.name}</Tag>)}
      </div>
    </Card>
  );
};

export default BarberCard;
