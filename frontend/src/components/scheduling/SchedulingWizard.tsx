import { useState, useRef } from 'react';
import { Card, theme } from 'antd';
import PhoneNumberStep from './PhoneNumberStep';
import BarberSelectionStep from './BarberSelectionStep';
import ServiceSelectionStep from './ServiceSelectionStep';
import DateSelectionStep from './DateSelectionStep';
import TimeSelectionStep from './TimeSelectionStep';
import NameStep from './NameStep';
import ConfirmationStep from './ConfirmationStep';
import SuccessStep from './SuccessStep';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAppointment } from '../../store/appointments/appointmentsThunks';
import { useIsMobile } from '../../hooks/useIsMobile';

const steps = ['Telefone', 'Barbeiro', 'Serviço', 'Data', 'Horário', 'Nome', 'Confirmar'];

interface AppointmentData {
  phoneNumber: string; barberId: string; serviceId: string;
  date: Date | null; time: string; name: string; selectedService?: any;
}
const initialData: AppointmentData = { phoneNumber: '', barberId: '', serviceId: '', date: null, time: '', name: '' };

interface Props { onClose: () => void; }

const SchedulingWizard: React.FC<Props> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { token } = theme.useToken();
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<AppointmentData>(initialData);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const prevStep = useRef(0);

  const selectedService = useAppSelector((state) => data.serviceId ? state.services.services.find(s => s.serviceId === data.serviceId) : null);
  const selectedBarber = useAppSelector((state) => data.barberId ? state.barbers.barbers.find(b => b.barberId === data.barberId) : null);

  const goTo = (step: number) => {
    setDirection(step > prevStep.current ? 'forward' : 'back');
    prevStep.current = step;
    setActiveStep(step);
  };

  const handleBack = () => { if (activeStep === 0) onClose(); else goTo(activeStep - 1); };
  const update = (fields: Partial<AppointmentData>) => { setData(prev => ({ ...prev, ...fields })); goTo(activeStep + 1); };

  const handleConfirm = async () => {
    if (!data.date) return;
    const [hours, minutes] = data.time.split(':');
    const startTime = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate(), parseInt(hours), parseInt(minutes)).getTime();
    const endTime = startTime + (selectedService?.durationMinutes || 30) * 60 * 1000;
    await dispatch(createAppointment({ barberId: data.barberId, data: { customerName: data.name, customerPhone: data.phoneNumber, startTime, endTime, service: data.serviceId } })).unwrap();
    goTo(activeStep + 1);
  };

  const handleComplete = () => { setActiveStep(0); setData(initialData); onClose(); };

  const renderStep = () => {
    switch (activeStep) {
      case 0: return <PhoneNumberStep onNext={(phoneNumber) => update({ phoneNumber })} onBack={handleBack} initialValue={data.phoneNumber} />;
      case 1: return <BarberSelectionStep onNext={(barberId) => update({ barberId })} onBack={handleBack} selectedBarberId={data.barberId} />;
      case 2: return <ServiceSelectionStep onNext={(serviceId, service) => update({ serviceId, selectedService: service })} onBack={handleBack} selectedServiceId={data.serviceId} barberId={data.barberId} />;
      case 3: return <DateSelectionStep onNext={(date) => update({ date })} onBack={handleBack} selectedDate={data.date || undefined} barberId={data.barberId} />;
      case 4: return data.date ? <TimeSelectionStep onNext={(time) => update({ time })} onBack={handleBack} selectedDate={data.date} barberId={data.barberId} serviceId={data.serviceId} selectedTime={data.time} /> : null;
      case 5: return <NameStep onNext={(name) => update({ name })} onBack={handleBack} initialValue={data.name} />;
      case 6: return data.date ? <ConfirmationStep onConfirm={handleConfirm} onBack={handleBack} phoneNumber={data.phoneNumber} barberId={data.barberId} serviceId={data.serviceId} date={data.date} time={data.time} name={data.name} service={data.selectedService} /> : null;
      case 7: return data.date ? <SuccessStep onClose={handleComplete} date={data.date} time={data.time} name={data.name} barberName={selectedBarber?.name} serviceName={selectedService?.name} phoneNumber={data.phoneNumber} /> : null;
      default: return null;
    }
  };

  const animClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';

  const progressBar = activeStep < steps.length ? (
    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
      {steps.map((_, i) => (
        <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= activeStep ? token.colorPrimary : token.colorBorder, transition: 'background 0.3s' }} />
      ))}
    </div>
  ) : null;

  const animatedContent = (
    <div key={activeStep} className={animClass}>
      {renderStep()}
    </div>
  );

  const styles = (
    <style>{`
      .slide-in-right { animation: slideRight 0.25s ease-out; }
      .slide-in-left { animation: slideLeft 0.25s ease-out; }
      @keyframes slideRight {
        from { opacity: 0; transform: translateX(40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideLeft {
        from { opacity: 0; transform: translateX(-40px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `}</style>
  );

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
        {styles}
        {progressBar && <div style={{ padding: '10px 12px 0' }}>{progressBar}</div>}
        <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ margin: 'auto 0' }}>
            {animatedContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {styles}
      <div style={{ maxWidth: 720, width: '100%' }}>
        <Card style={{ borderRadius: 16, padding: '8px 0', overflow: 'hidden' }}>
          {activeStep < steps.length && (
            <div style={{ padding: '8px 16px 16px', display: 'flex', gap: 4 }}>
              {steps.map((_, i) => (
                <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= activeStep ? token.colorPrimary : token.colorBorder, transition: 'background 0.3s' }} />
              ))}
            </div>
          )}
          {animatedContent}
        </Card>
      </div>
    </div>
  );
};

export default SchedulingWizard;
