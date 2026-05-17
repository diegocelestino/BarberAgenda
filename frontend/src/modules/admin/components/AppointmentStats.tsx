import React from 'react';
import { Space, Tag } from 'antd';
import { AppointmentItem } from '../types';

interface AppointmentStatsProps {
  appointments: AppointmentItem[];
}

const AppointmentStats: React.FC<AppointmentStatsProps> = ({ appointments }) => {
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const inProgress = appointments.filter((a) => a.status === 'in-progress').length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const cancelled = appointments.filter((a) => a.status === 'cancelled').length;

  return (
    <Space wrap>
      <Tag color="default">{appointments.length} agendamentos</Tag>
      <Tag color="blue">{confirmed} confirmados</Tag>
      <Tag color="green">{inProgress} concluídos</Tag>
      <Tag color="orange">{pending} pendentes</Tag>
      <Tag color="red">{cancelled} cancelados</Tag>
    </Space>
  );
};

export default AppointmentStats;
