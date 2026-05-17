import React, { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Button, Grid } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  ScissorOutlined,
  AppstoreOutlined,
  DollarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { type: 'divider' as const },
  {
    key: 'operations',
    label: 'Operações',
    type: 'group' as const,
    children: [
      { key: 'agenda', icon: <CalendarOutlined />, label: 'Agenda' },
      { key: 'customers', icon: <TeamOutlined />, label: 'Clientes' },
      { key: 'barbers', icon: <ScissorOutlined />, label: 'Barbeiros' },
    ],
  },
  {
    key: 'catalog',
    label: 'Catálogo',
    type: 'group' as const,
    children: [
      { key: 'services', icon: <AppstoreOutlined />, label: 'Serviços' },
    ],
  },
  {
    key: 'finance',
    label: 'Financeiro',
    type: 'group' as const,
    children: [
      { key: 'financial', icon: <DollarOutlined />, label: 'Visão financeira' },
    ],
  },
  { type: 'divider' as const },
  { key: 'settings', icon: <SettingOutlined />, label: 'Configurações' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  selectedKey?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, selectedKey = 'dashboard' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();

  const routeMap: Record<string, string> = {
    dashboard: '/admin',
    agenda: '/admin/agenda',
    customers: '/admin/clientes',
    barbers: '/admin/barbeiros',
    services: '/admin/servicos',
    financial: '/admin/financeiro',
    settings: '/admin/configuracoes',
  };

  const handleMenuClick = (key: string) => {
    if (isMobile) setDrawerOpen(false);
    const route = routeMap[key];
    if (route) navigate(route);
  };

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const menuContent = (
    <>
      <div style={{ padding: '16px', textAlign: 'center', color: '#c8a05c', fontWeight: 'bold', fontSize: 18 }}>
        BarberAgenda
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop: fixed sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={240}
        >
          {menuContent}
        </Sider>
      )}

      {/* Mobile: drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          styles={{ body: { padding: 0 } }}
        >
          {menuContent}
        </Drawer>
      )}

      <Layout>
        {isMobile && (
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
            />
            <span style={{ color: '#c8a05c', fontWeight: 'bold' }}>BarberAgenda</span>
          </div>
        )}
        <Content style={{ padding: isMobile ? 12 : 24, overflow: 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
