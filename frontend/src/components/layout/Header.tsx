import { Button, Layout, Typography, theme } from 'antd';
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AntHeader style={{
      display: 'flex', alignItems: 'center', padding: '0 16px',
      position: 'sticky', top: 0, zIndex: 1000,
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorder}`,
    }}>
      <Button
        type="text"
        icon={<HomeOutlined />}
        onClick={() => navigate('/', { state: { reset: Date.now() } })}
        style={{ marginRight: 16 }}
      />
      <Title level={4} style={{ margin: 0, flex: 1 }}>
        Miguel Castilho Agenda
      </Title>
      {isAuthenticated && (
        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
          Sair
        </Button>
      )}
    </AntHeader>
  );
};

export default Header;
