import { useState, useEffect } from 'react';
import { barberApi } from '../services/api';

export function useBarberServices(barberId: string, enabled = true) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!barberId || !enabled) return;
    const load = async () => {
      try {
        setLoading(true); setError(null);
        setServices(await barberApi.getServices(barberId));
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Erro ao carregar serviços');
      } finally { setLoading(false); }
    };
    load();
  }, [barberId, enabled]);

  return { services, loading, error };
}
