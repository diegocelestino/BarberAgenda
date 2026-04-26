import { useState, useEffect } from 'react';
import { Alert, Button, Card, Modal, Spin, Typography, message, theme } from 'antd';
import {
  ClockCircleOutlined, ScheduleOutlined, PhoneOutlined,
  LeftOutlined, RightOutlined, EditOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAppointment } from '../../store/appointments';
import { selectAllServices } from '../../store/services';
import { Appointment } from '../../services/appointmentsApi';
import EditAppointmentDialog from './EditAppointmentDialog';
import { formatLongDate, formatTime } from '../../utils/dateTime';

const { Text, Title } = Typography;

interface AppointmentNavigationCardProps {
  appointments: Appointment[];
  barberId: string;
  loading?: boolean;
  onAppointmentUpdate?: () => void;
}

const AppointmentNavigationCard: React.FC<AppointmentNavigationCardProps> = ({
  appointments, barberId, loading = false, onAppointmentUpdate,
}) => {
  const { token } = theme.useToken();
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getServiceName = (serviceId: string) => services.find(s => s.serviceId === serviceId)?.title || serviceId;

  useEffect(() => { setCurrentIndex(0); }, [appointments.length]);

  const current = appointments[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < appointments.length - 1;

  const handleComplete = () => {
    if (!current) return;
    Modal.confirm({
      title: 'Confirmar Conclusão',
      content: (
        <div>
          <p>Tem certeza que deseja marcar este agendamento como concluído?</p>
          <Text type="secondary"><strong>Cliente:</strong> {current.customerName}</Text><br />
          <Text type="secondary"><strong>Serviço:</strong> {getServiceName(current.service)}</Text>
        </div>
      ),
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      okButtonProps: { style: { background: token.colorSuccess } },
      onOk: async () => {
        await dispatch(updateAppointment({ barberId, appointmentId: current.appointmentId, data: { status: 'completed' } })).unwrap();
        message.success('Agendamento marcado como concluído!');
        onAppointmentUpdate?.();
      },
    });
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    message.success('Agendamento atualizado com sucesso!');
    onAppointmentUpdate?.();
  };

  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Spin size="small" /><Text type="secondary" style={{ marginLeft: 8 }}>Carregando próximo agendamento...</Text>
        </div>
      </Card>
    );
  }

  if (!current) {
    return <Card><Alert type="info" message="Nenhum agendamento próximo" showIcon style={{ border: 'none' }} /></Card>;
  }

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Text type="secondary" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Próximo Agendamento</Text>
            {appointments.length > 1 && <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>({currentIndex + 1} de {appointments.length})</Text>}
          </div>
          <div>
            <Button type="text" size="small" icon={<LeftOutlined />} disabled={!hasPrev} onClick={() => setCurrentIndex(i => i - 1)} />
            <Button type="text" size="small" icon={<RightOutlined />} disabled={!hasNext} onClick={() => setCurrentIndex(i => i + 1)} />
          </div>
        </div>

        <Title level={5} style={{ marginBottom: 12 }}>{current.customerName}</Title>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClockCircleOutlined style={{ color: token.colorTextTertiary }} />
            <Text>{formatLongDate(current.startTime)} às {formatTime(current.startTime)}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ScheduleOutlined style={{ color: token.colorTextTertiary }} />
            <Text>{getServiceName(current.service)}</Text>
          </div>
          {current.customerPhone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PhoneOutlined style={{ color: token.colorTextTertiary }} />
              <Text>{current.customerPhone}</Text>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Button block icon={<EditOutlined />} onClick={() => setEditDialogOpen(true)}>Editar</Button>
          <Button block type="primary" icon={<CheckCircleOutlined />} onClick={handleComplete} style={{ background: token.colorSuccess, borderColor: token.colorSuccess }}>Concluir</Button>
        </div>
      </Card>

      {current && (
        <EditAppointmentDialog open={editDialogOpen} appointment={current} barberId={barberId}
          onClose={() => setEditDialogOpen(false)} onSuccess={handleEditSuccess} />
      )}
    </>
  );
};

export default AppointmentNavigationCard;
