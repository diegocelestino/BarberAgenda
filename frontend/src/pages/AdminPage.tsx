import { useEffect, useState } from 'react';
import { Alert, Select, Tabs } from 'antd';
import {
  CalendarOutlined, TeamOutlined, ToolOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBarbers, selectAllBarbers, selectBarbersLoading } from '../store/barbers';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import BarberList from '../components/barbers/BarberList';
import ServicesList from '../components/services/ServicesList';
import ExtractTab from '../components/extract/ExtractTab';

const AdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const barbers = useAppSelector(selectAllBarbers);
  const barbersLoading = useAppSelector(selectBarbersLoading);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('agenda');

  useEffect(() => {
    dispatch(fetchBarbers());
  }, [dispatch]);

  // Auto-select first barber when loaded
  useEffect(() => {
    if (barbers.length > 0 && !selectedBarberId) {
      setSelectedBarberId(barbers[0].barberId);
    }
  }, [barbers, selectedBarberId]);

  const barberSelector = (
    <Select
      value={selectedBarberId || undefined}
      onChange={setSelectedBarberId}
      placeholder="Selecione um barbeiro"
      loading={barbersLoading}
      style={{ minWidth: 200 }}
      options={barbers.map(b => ({ value: b.barberId, label: b.name }))}
    />
  );

  const needsBarber = activeTab === 'agenda' || activeTab === 'extrato';

  const items = [
    {
      key: 'agenda',
      label: <span><CalendarOutlined /> Agenda</span>,
      children: selectedBarberId
        ? <AppointmentCalendar barberId={selectedBarberId} />
        : <Alert type="info" message="Selecione um barbeiro para ver a agenda." showIcon />,
    },
    {
      key: 'barbeiros',
      label: <span><TeamOutlined /> Barbeiros</span>,
      children: <BarberList />,
    },
    {
      key: 'servicos',
      label: <span><ToolOutlined /> Serviços</span>,
      children: <ServicesList />,
    },
    {
      key: 'extrato',
      label: <span><FileTextOutlined /> Extrato</span>,
      children: selectedBarberId
        ? <ExtractTab barberId={selectedBarberId} />
        : <Alert type="info" message="Selecione um barbeiro para ver o extrato." showIcon />,
    },
  ];

  return (
    <div style={{ width: '100%', maxWidth: 1024, margin: '0 auto', padding: '16px 16px 24px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div />
        {needsBarber && barberSelector}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
      />
    </div>
  );
};

export default AdminPage;
