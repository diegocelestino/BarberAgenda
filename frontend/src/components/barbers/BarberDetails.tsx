import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Row, Spin, Typography, message } from 'antd';
import {
  ArrowLeftOutlined, UserOutlined, ScheduleOutlined,
  CalendarOutlined, PlusCircleOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchBarberById, selectSelectedBarber, selectBarbersLoading,
  selectBarbersError, clearSelectedBarber,
} from '../../store/barbers';
import {
  fetchAppointmentsByBarber, selectAllAppointments,
  selectAppointmentsLoading, clearAppointments,
} from '../../store/appointments';
import AppointmentNavigationCard from '../appointments/AppointmentNavigationCard';
import RegisterWalkInDialog from '../appointments/RegisterWalkInDialog';
import { now, addDays } from '../../utils/dateTime';

const { Title, Text } = Typography;

const BarberDetails: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);
  const appointments = useAppSelector(selectAllAppointments);
  const appointmentsLoading = useAppSelector(selectAppointmentsLoading);
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false);

  const fetchAppointments = useCallback(() => {
    if (barberId) {
      const startDate = now();
      const endDate = addDays(now(), 30);
      dispatch(fetchAppointmentsByBarber({ barberId, params: { startDate, endDate, status: 'scheduled', sortBy: 'startTime', sortOrder: 'asc' } }));
    }
  }, [barberId, dispatch]);

  useEffect(() => {
    if (barberId) { dispatch(fetchBarberById(barberId)); fetchAppointments(); }
    return () => { dispatch(clearSelectedBarber()); dispatch(clearAppointments()); };
  }, [barberId, dispatch, fetchAppointments]);

  const handleWalkInSuccess = () => { setWalkInDialogOpen(false); message.success('Atendimento registrado com sucesso!'); fetchAppointments(); };

  if (loading && !barber) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><Spin size="large" /></div>;
  if (error) return <Alert type="error" message={error} showIcon style={{ margin: 16 }} />;
  if (!barber) return <Alert type="warning" message="Barbeiro não encontrado" showIcon style={{ margin: 16 }} />;

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/barbers')} style={{ marginRight: 8 }} />
        <Title level={4} style={{ margin: 0 }}>{barber.name}</Title>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <AppointmentNavigationCard appointments={appointments} barberId={barberId || ''} loading={appointmentsLoading} onAppointmentUpdate={fetchAppointments} />
        </Col>

        <Col span={24}>
          <Card hoverable onClick={() => navigate(`/admin/barbers/${barberId}/appointments`)} style={{ textAlign: 'center', padding: 16 }}>
            <CalendarOutlined style={{ fontSize: 48, color: '#ed6c02', marginBottom: 8 }} />
            <Title level={5}>Agenda</Title>
            <Text type="secondary">Ver e gerenciar agendamentos</Text>
          </Card>
        </Col>

        <Col span={24}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Button block size="large" icon={<UserOutlined />} onClick={() => navigate(`/admin/barbers/${barberId}/edit`)} style={{ height: 48 }}>Detalhes</Button>
            <Button block size="large" icon={<ScheduleOutlined />} onClick={() => navigate(`/admin/barbers/${barberId}/schedule`)} style={{ height: 48 }}>Expediente</Button>
          </div>
        </Col>

        <Col span={24}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Button block size="large" icon={<FileTextOutlined />} onClick={() => navigate(`/admin/barbers/${barberId}/extract`)} style={{ height: 48 }}>Extrato</Button>
            <Button block size="large" type="primary" icon={<PlusCircleOutlined />} onClick={() => setWalkInDialogOpen(true)} style={{ height: 48 }}>Registrar Atendimento</Button>
          </div>
        </Col>
      </Row>

      <RegisterWalkInDialog open={walkInDialogOpen} barberId={barberId || ''} onClose={() => setWalkInDialogOpen(false)} onSuccess={handleWalkInSuccess} />
    </Card>
  );
};

export default BarberDetails;
