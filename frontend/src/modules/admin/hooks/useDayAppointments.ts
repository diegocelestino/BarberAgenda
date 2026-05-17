import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchBarbers } from '../../../store/barbers/barbersThunks';
import { fetchServices } from '../../../store/services/servicesThunks';
import { appointmentsApi, Appointment } from '../../../services/appointmentsApi';
import { AppointmentItem } from '../types';
import { TimelineAppointment } from '../components/TimelineView';

function mapStatus(status: string): AppointmentItem['status'] {
  if (status === 'scheduled') return 'confirmed';
  if (status === 'completed') return 'in-progress';
  return 'cancelled';
}

function mapAppointment(a: Appointment, barberName: string, serviceNameMap: Map<string, string>) {
  const service = serviceNameMap.get(a.service) || a.service;
  const duration = Math.round((a.endTime - a.startTime) / 60000);
  const status = mapStatus(a.status);

  return {
    item: {
      time: new Date(a.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      customer: a.customerName,
      phone: a.customerPhone || '',
      service,
      duration: `${duration} min`,
      barber: barberName,
      status,
    } as AppointmentItem,
    timeline: {
      id: a.appointmentId,
      startTime: a.startTime,
      endTime: a.endTime,
      customer: a.customerName,
      phone: a.customerPhone || '',
      service,
      barber: barberName,
      status,
    } as TimelineAppointment,
  };
}

interface UseDayAppointmentsResult {
  loading: boolean;
  barbers: any[];
  appointments: AppointmentItem[];
  timelineData: TimelineAppointment[];
  refetch: () => void;
}

export function useDayAppointments(date: Date): UseDayAppointmentsResult {
  const dispatch = useAppDispatch();
  const barbers = useAppSelector((state) => state.barbers.barbers);
  const services = useAppSelector((state) => state.services.services);
  const barbersLoading = useAppSelector((state) => state.barbers.loading);
  const servicesLoading = useAppSelector((state) => state.services.loading);

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineAppointment[]>([]);

  // Load barbers + services into store if not already loaded
  useEffect(() => {
    if (barbers.length === 0) dispatch(fetchBarbers());
    if (services.length === 0) dispatch(fetchServices());
  }, [dispatch, barbers.length, services.length]);

  const fetchAppointments = useCallback(async () => {
    if (barbers.length === 0 || services.length === 0) return;

    setLoading(true);
    const serviceNameMap = new Map(services.map((s: any) => [s.serviceId, s.name]));
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    try {
      const results = await Promise.all(
        barbers.map((barber) =>
          appointmentsApi.getByBarber(barber.barberId, { startDate: startOfDay, endDate: endOfDay })
            .then((appts) => appts.map((a) => mapAppointment(a, barber.name, serviceNameMap)))
        )
      );
      const flat = results.flat().sort((a, b) => a.item.time.localeCompare(b.item.time));
      setAppointments(flat.map((f) => f.item));
      setTimelineData(flat.map((f) => f.timeline));
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [barbers, services, date.toDateString()]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  return {
    loading: loading || barbersLoading || servicesLoading,
    barbers,
    appointments,
    timelineData,
    refetch: fetchAppointments,
  };
}
