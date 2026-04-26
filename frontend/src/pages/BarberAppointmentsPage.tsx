import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBarberById, selectSelectedBarber, selectBarbersLoading,
  selectBarbersError, clearSelectedBarber,
} from '../store/barbers';
import { clearAppointments } from '../store/appointments';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';

const { Title } = Typography;

const BarberAppointmentsPage: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);

  useEffect(() => {
    if (barberId) dispatch(fetchBarberById(barberId));
    return () => { dispatch(clearSelectedBarber()); dispatch(clearAppointments()); };
  }, [barberId, dispatch]);

  if (loading && !barber) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><Spin size="large" /></div>;
  if (error) return <Alert type="error" message={error} showIcon style={{ margin: 16 }} />;
  if (!barber) return <Alert type="warning" message="Barbeiro não encontrado" showIcon style={{ margin: 16 }} />;

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 16px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(`/admin/barber/${barberId}`)} style={{ marginRight: 8 }} />
          <Title level={4} style={{ margin: 0 }}>Agenda - {barber.name}</Title>
        </div>
        <AppointmentCalendar />
      </Card>
    </div>
  );
};

export default BarberAppointmentsPage;
