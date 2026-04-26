import { Card, Col, Row, Typography, theme } from 'antd';
import { TeamOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const MenuPage: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Barbeiros', description: 'Gerenciar barbeiros e seus horários', icon: <TeamOutlined />, path: '/admin/barbers' },
    { title: 'Serviços', description: 'Gerenciar serviços e durações', icon: <ToolOutlined />, path: '/admin/services' },
  ];

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', padding: '48px 16px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>Bem-vindo</Title>
      <Row gutter={[24, 24]}>
        {menuItems.map((item) => (
          <Col xs={24} sm={12} key={item.path}>
            <Card
              hoverable
              onClick={() => navigate(item.path)}
              style={{ textAlign: 'center', padding: '32px 16px', borderColor: token.colorBorder }}
            >
              <div style={{ fontSize: 64, color: token.colorPrimary, marginBottom: 16 }}>{item.icon}</div>
              <Title level={3} style={{ marginBottom: 8 }}>{item.title}</Title>
              <Text type="secondary">{item.description}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MenuPage;
