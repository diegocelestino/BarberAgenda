import { useState, useEffect, useCallback } from 'react';
import { barberApi, Barber } from '../../../services/api';
import { appointmentsApi, Appointment } from '../../../services/appointmentsApi';
import { servicesApi } from '../../../services/servicesApi';
import { AppointmentItem } from '../types';
import { TimelineAppointment } from '../components/TimelineView';

function mapStatus(status: string): AppointmentItem['status'] {
  if (status === 'scheduled') return 'confirmed';
  if (status === 'completed') return 'in-progress';
  return 'cancelled';
}

function mapAppointment(a: Appointment, barberName: string, serviceNameMap: Map<string, string>): {
  item: AppointmentItem;
  timeline: TimelineAppointment;
} {
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
    },
    timeline: {
      id: a.appointmentId,
      startTime: a.startTime,
      endTime: a.endTime,
      customer: a.customerName,
      phone: a.customerPhone || '',
      service,
      barber: barberName,
      status,
    },
  };
}

interface UseDayAppointmentsResult {
  loading: boolean;
  barbers: Barber[];
  appointments: AppointmentItem[];
  timelineData: TimelineAppointment[];
  refetch: () => void;
}

export function useDayAppointments(date: Date): UseDayAppointmentsResult {
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineAppointment[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedBarbers, servicesList] = await Promise.all([
        barberApi.getAll(),
        servicesApi.getAll(),
      ]);
      setBarbers(fetchedBarbers);
      const serviceNameMap = new Map(servicesList.map((s: any) => [s.serviceId, s.name]));

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

      const results = await Promise.all(
        fetchedBarbers.map((barber) =>
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
  }, [date.toDateString()]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  return { loading, barbers, appointments, timelineData, refetch: fetchData };
}
