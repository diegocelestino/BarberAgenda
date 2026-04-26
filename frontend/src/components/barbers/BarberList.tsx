import { useEffect, useState } from 'react';
import { Alert, Button, Col, Row, Spin, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBarbers, selectAllBarbers, selectBarbersLoading, selectBarbersError } from '../../store/barbers';
import BarberCard from './BarberCard';
import DeleteBarberDialog from './DeleteBarberDialog';
import CreateBarberDialog from './CreateBarberDialog';

const { Title } = Typography;

const BarberList: React.FC = () => {
  const dispatch = useAppDispatch();
  const barbers = useAppSelector(selectAllBarbers);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchBarbers()); }, [dispatch]);

  const handleDeleteClick = (barberId: string) => { setSelectedBarberId(barberId); setDeleteDialogOpen(true); };
  const handleDeleteConfirm = () => { setDeleteDialogOpen(false); setSelectedBarberId(null); };
  const handleDeleteCancel = () => { setDeleteDialogOpen(false); setSelectedBarberId(null); };
  const handleCreateSuccess = () => { setCreateDialogOpen(false); };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><Spin size="large" /></div>;
  if (error) return <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Barbeiros</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDialogOpen(true)}>Novo Barbeiro</Button>
      </div>

      {barbers.length === 0 ? (
        <Alert type="info" message="Nenhum barbeiro encontrado. Crie um para começar!" showIcon />
      ) : (
        <Row gutter={[16, 16]}>
          {barbers.map((barber) => (
            <Col xs={24} sm={12} md={8} key={barber.barberId}>
              <BarberCard barber={barber} onDelete={handleDeleteClick} />
            </Col>
          ))}
        </Row>
      )}

      <DeleteBarberDialog open={deleteDialogOpen} barberId={selectedBarberId} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} />
      <CreateBarberDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} onSuccess={handleCreateSuccess} />
    </div>
  );
};

export default BarberList;
