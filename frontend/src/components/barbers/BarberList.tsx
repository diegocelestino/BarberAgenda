import { useEffect, useState } from 'react';
import { Alert, Button, Col, Row, Spin, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBarbers, selectAllBarbers, selectBarbersLoading, selectBarbersError } from '../../store/barbers';
import { useIsMobile } from '../../hooks/useIsMobile';
import BarberCard from './BarberCard';
import DeleteBarberDialog from './DeleteBarberDialog';
import CreateBarberDialog from './CreateBarberDialog';

const { Title } = Typography;

interface Props { fabTrigger?: number; }

const BarberList: React.FC<Props> = ({ fabTrigger }) => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const barbers = useAppSelector(selectAllBarbers);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchBarbers()); }, [dispatch]);
  useEffect(() => { if (fabTrigger && fabTrigger > 0) setCreateDialogOpen(true); }, [fabTrigger]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><Spin size="large" /></div>;
  if (error) return <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Barbeiros</Title>
        {!isMobile && <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDialogOpen(true)}>Novo Barbeiro</Button>}
      </div>

      {barbers.length === 0 ? (
        <Alert type="info" message="Nenhum barbeiro encontrado. Crie um para começar!" showIcon />
      ) : (
        <Row gutter={[16, 16]}>
          {barbers.map((barber) => (
            <Col xs={24} sm={12} md={8} key={barber.barberId}>
              <BarberCard barber={barber} onDelete={(id) => { setSelectedBarberId(id); setDeleteDialogOpen(true); }} />
            </Col>
          ))}
        </Row>
      )}

      <DeleteBarberDialog open={deleteDialogOpen} barberId={selectedBarberId}
        onConfirm={() => { setDeleteDialogOpen(false); setSelectedBarberId(null); }}
        onCancel={() => { setDeleteDialogOpen(false); setSelectedBarberId(null); }} />
      <CreateBarberDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} onSuccess={() => setCreateDialogOpen(false)} />
    </div>
  );
};

export default BarberList;
