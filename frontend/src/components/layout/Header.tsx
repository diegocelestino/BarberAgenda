import { Button, Layout, Typography, theme } from 'antd';
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();

  return (
    <AntHeader style={{
      display: 'flex', alignItems: 'center', padding: '0 12px',
      position: 'sticky', top: 0, zIndex: 1000, height: 48,
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorder}`,
    }}>
      <Button type="text" icon={<HomeOutlined />} onClick={() => navigate('/', { state: { reset: Date.now() } })} style={{ marginRight: 8 }} />
      <Title level={5} style={{ margin: 0, flex: 1, fontSize: isMobile ? 14 : 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {isMobile ? 'MC Agenda' : 'Miguel Castilho Agenda'}
      </Title>
      {isAuthenticated && (
        <Button type="text" icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/'); }}>
          {!isMobile && 'Sair'}
        </Button>
      )}
    </AntHeader>
  );
};

export default Header;
