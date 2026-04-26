import { useState, useEffect } from 'react';
import { Button, Card, Steps, Typography, theme } from 'antd';
import { ScissorOutlined, CalendarOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import PhoneNumberStep from '../components/scheduling/PhoneNumberStep';
import BarberSelectionStep from '../components/scheduling/BarberSelectionStep';
import ServiceSelectionStep from '../components/scheduling/ServiceSelectionStep';
import DateSelectionStep from '../components/scheduling/DateSelectionStep';
import TimeSelectionStep from '../components/scheduling/TimeSelectionStep';
import NameStep from '../components/scheduling/NameStep';
import ConfirmationStep from '../components/scheduling/ConfirmationStep';
import SuccessStep from '../components/scheduling/SuccessStep';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createAppointment } from '../store/appointments/appointmentsThunks';

const { Title, Text } = Typography;

const steps = ['Telefone', 'Barbeiro', 'Serviço', 'Data', 'Horário', 'Nome', 'Confirmar'];

interface AppointmentData {
  phoneNumber: string;
  barberId: string;
  serviceId: string;
  date: Date | null;
  time: string;
  name: string;
  selectedService?: any;
}

const initialData: AppointmentData = { phoneNumber: '', barberId: '', serviceId: '', date: null, time: '', name: '' };

const PublicHomePage: React.FC = () => {
  const { token } = theme.useToken();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [schedulingStarted, setSchedulingStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>(initialData);

  useEffect(() => {
    if (location.state?.reset) {
      setSchedulingStarted(false);
      setActiveStep(0);
      setAppointmentData(initialData);
    }
  }, [location.state?.reset]);

  const selectedService = useAppSelector((state) =>
    appointmentData.serviceId ? state.services.services.find(s => s.serviceId === appointmentData.serviceId) : null
  );
  const selectedBarber = useAppSelector((state) =>
    appointmentData.barberId ? state.barbers.barbers.find(b => b.barberId === appointmentData.barberId) : null
  );

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => {
    if (activeStep === 0) setSchedulingStarted(false);
    else setActiveStep((prev) => prev - 1);
  };

  const update = (fields: Partial<AppointmentData>) => {
    setAppointmentData((prev) => ({ ...prev, ...fields }));
    handleNext();
  };

  const handleConfirm = async () => {
    if (!appointmentData.date) return;
    const { date, time, barberId, serviceId, name, phoneNumber } = appointmentData;
    const [hours, minutes] = time.split(':');
    const startTime = new Date(date!.getFullYear(), date!.getMonth(), date!.getDate(), parseInt(hours), parseInt(minutes)).getTime();
    const serviceDuration = selectedService?.durationMinutes || 30;
    const endTime = startTime + serviceDuration * 60 * 1000;

    await dispatch(createAppointment({
      barberId,
      data: { customerName: name, customerPhone: phoneNumber, startTime, endTime, service: serviceId },
    })).unwrap();
    handleNext();
  };

  const handleClose = () => {
    setSchedulingStarted(false);
    setActiveStep(0);
    setAppointmentData(initialData);
  };

  if (!schedulingStarted) {
    return (
      <div style={{ height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, width: '100%', padding: '0 16px' }}>
          <Card style={{ textAlign: 'center', padding: '32px 16px', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%', background: token.colorPrimary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                <ScissorOutlined style={{ fontSize: 60, color: '#fff' }} />
              </div>
            </div>
            <Title level={2} style={{ marginBottom: 8 }}>Miguel Castilho</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 16 }}>
              Agende seu corte com apenas alguns cliques
            </Text>
            <Button type="primary" size="large" icon={<CalendarOutlined />} onClick={() => setSchedulingStarted(true)}
              style={{ height: 48, paddingInline: 48, fontSize: 16, fontWeight: 'bold', borderRadius: 12 }}>
              Agendar horário
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ maxWidth: 720, width: '100%' }}>
        <Card style={{ borderRadius: 16, padding: '8px 0' }}>
          {activeStep < steps.length && (
            <Steps current={activeStep} size="small" style={{ marginBottom: 16, paddingInline: 8 }}
              items={steps.map((title) => ({ title }))}
              responsive={false}
            />
          )}

          {activeStep === 0 && <PhoneNumberStep onNext={(phoneNumber) => update({ phoneNumber })} onBack={handleBack} initialValue={appointmentData.phoneNumber} />}
          {activeStep === 1 && <BarberSelectionStep onNext={(barberId) => update({ barberId })} onBack={handleBack} selectedBarberId={appointmentData.barberId} />}
          {activeStep === 2 && <ServiceSelectionStep onNext={(serviceId, service) => update({ serviceId, selectedService: service })} onBack={handleBack} selectedServiceId={appointmentData.serviceId} barberId={appointmentData.barberId} />}
          {activeStep === 3 && <DateSelectionStep onNext={(date) => update({ date })} onBack={handleBack} selectedDate={appointmentData.date || undefined} barberId={appointmentData.barberId} />}
          {activeStep === 4 && appointmentData.date && <TimeSelectionStep onNext={(time) => update({ time })} onBack={handleBack} selectedDate={appointmentData.date} barberId={appointmentData.barberId} serviceId={appointmentData.serviceId} selectedTime={appointmentData.time} />}
          {activeStep === 5 && <NameStep onNext={(name) => update({ name })} onBack={handleBack} initialValue={appointmentData.name} />}
          {activeStep === 6 && appointmentData.date && <ConfirmationStep onConfirm={handleConfirm} onBack={handleBack} phoneNumber={appointmentData.phoneNumber} barberId={appointmentData.barberId} serviceId={appointmentData.serviceId} date={appointmentData.date} time={appointmentData.time} name={appointmentData.name} service={appointmentData.selectedService} />}
          {activeStep === 7 && appointmentData.date && <SuccessStep onClose={handleClose} date={appointmentData.date} time={appointmentData.time} name={appointmentData.name} barberName={selectedBarber?.name} serviceName={selectedService?.name} phoneNumber={appointmentData.phoneNumber} />}
        </Card>
      </div>
    </div>
  );
};

export default PublicHomePage;
