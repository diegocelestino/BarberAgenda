import React from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

export interface AppointmentItem {
  time: string;
  customer: string;
  phone: string;
  service: string;
  duration: string;
  barber: string;
  status: 'confirmed' | 'in-progress' | 'pending' | 'cancelled';
}

export const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  confirmed: { color: 'blue', icon: <CheckCircleOutlined />, label: 'Confirmado' },
  'in-progress': { color: 'green', icon: <ClockCircleOutlined />, label: 'Na cadeira' },
  pending: { color: 'orange', icon: <ExclamationCircleOutlined />, label: 'Pendente' },
  cancelled: { color: 'red', icon: <CloseCircleOutlined />, label: 'Cancelado' },
};
