import { useEffect, useState } from 'react';
import { Alert, Button, Select, Tabs, theme } from 'antd';
import { CalendarOutlined, TeamOutlined, ToolOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBarbers, selectAllBarbers, selectBarbersLoading } from '../store/barbers';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import BarberList from '../components/barbers/BarberList';
import ServicesList from '../components/services/ServicesList';
import ExtractTab from '../components/extract/ExtractTab';
import { useIsMobile } from '../hooks/useIsMobile';

const navItems = [
  { key: 'agenda', label: 'Agenda', icon: <CalendarOutlined /> },
  { key: 'barbeiros', label: 'Barbeiros', icon: <TeamOutlined /> },
  { key: 'servicos', label: 'Serviços', icon: <ToolOutlined /> },
  { key: 'extrato', label: 'Extrato', icon: <FileTextOutlined /> },
];

const AdminPage: React.FC = () => {
  const { token } = theme.useToken();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const barbers = useAppSelector(selectAllBarbers);
  const barbersLoading = useAppSelector(selectBarbersLoading);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [activeTab, setActiveTab] = useState('agenda');

  const [fabTrigger, setFabTrigger] = useState(0);
  const handleFab = () => setFabTrigger(prev => prev + 1);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setFabTrigger(0);
  };

  useEffect(() => { dispatch(fetchBarbers()); }, [dispatch]);
  useEffect(() => { if (barbers.length > 0 && !selectedBarberId) setSelectedBarberId(barbers[0].barberId); }, [barbers, selectedBarberId]);

  const needsBarber = activeTab === 'agenda' || activeTab === 'extrato';
  const hasFab = activeTab !== 'extrato';

  const renderContent = () => {
    switch (activeTab) {
      case 'agenda': return selectedBarberId ? <AppointmentCalendar barberId={selectedBarberId} fabTrigger={fabTrigger} /> : <Alert type="info" message="Selecione um barbeiro." showIcon />;
      case 'barbeiros': return <BarberList fabTrigger={fabTrigger} />;
      case 'servicos': return <ServicesList fabTrigger={fabTrigger} />;
      case 'extrato': return selectedBarberId ? <ExtractTab barberId={selectedBarberId} /> : <Alert type="info" message="Selecione um barbeiro." showIcon />;
      default: return null;
    }
  };

  // Desktop: normal top tabs
  if (!isMobile) {
    const items = navItems.map(t => ({
      key: t.key,
      label: <span>{t.icon} {t.label}</span>,
      children: t.key === activeTab ? renderContent() : null,
    }));

    return (
      <div style={{ width: '100%', maxWidth: 1024, margin: '0 auto', padding: '16px 16px 24px', boxSizing: 'border-box' }}>
        {needsBarber && (
          <div style={{ marginBottom: 12 }}>
            <Select value={selectedBarberId || undefined} onChange={setSelectedBarberId}
              placeholder="Selecione um barbeiro" loading={barbersLoading} style={{ width: 200 }}
              options={barbers.map(b => ({ value: b.barberId, label: b.name }))} />
          </div>
        )}
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={items} size="large" />
      </div>
    );
  }

  // Mobile: bottom nav + FAB
  const NAV_HEIGHT = 64;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 8px 0', paddingBottom: hasFab ? 80 : 8 }}>
        {needsBarber && (
          <div style={{ marginBottom: 8 }}>
            <Select value={selectedBarberId || undefined} onChange={setSelectedBarberId}
              placeholder="Selecione um barbeiro" loading={barbersLoading} style={{ width: '100%' }}
              options={barbers.map(b => ({ value: b.barberId, label: b.name }))} />
          </div>
        )}
        {renderContent()}
      </div>

      {/* FAB */}
      {hasFab && (
        <Button type="primary" shape="circle" icon={<PlusOutlined />} size="large"
          onClick={handleFab}
          style={{
            position: 'fixed', right: 16, bottom: NAV_HEIGHT + 16 + 6, // above nav + safe area
            width: 56, height: 56, fontSize: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} />
      )}

      {/* Bottom nav */}
      <div style={{
        display: 'flex', borderTop: `1px solid ${token.colorBorder}`,
        background: token.colorBgContainer,
        padding: `10px 0 max(10px, env(safe-area-inset-bottom))`,
        height: NAV_HEIGHT, boxSizing: 'border-box',
      }}>
        {navItems.map(t => (
          <div key={t.key} onClick={() => handleTabChange(t.key)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
              color: activeTab === t.key ? token.colorPrimary : token.colorTextTertiary,
              transition: 'color 0.2s',
            }}>
            <span style={{ fontSize: 24 }}>{t.icon}</span>
            <span style={{ fontSize: 11, marginTop: 2, fontWeight: activeTab === t.key ? 600 : 400 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
