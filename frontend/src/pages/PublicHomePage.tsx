import { useState, useEffect } from 'react';
import { Button, Card, Typography, theme } from 'antd';
import { ScissorOutlined, CalendarOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import SchedulingWizard from '../components/scheduling/SchedulingWizard';
import { useIsMobile } from '../hooks/useIsMobile';

const { Title, Text } = Typography;

const PublicHomePage: React.FC = () => {
  const { token } = theme.useToken();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [schedulingStarted, setSchedulingStarted] = useState(false);

  useEffect(() => {
    if (location.state?.reset) setSchedulingStarted(false);
  }, [location.state?.reset]);

  if (schedulingStarted) {
    return <SchedulingWizard onClose={() => setSchedulingStarted(false)} />;
  }

  const logoSize = isMobile ? 90 : 120;

  return (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 480, width: '100%', padding: '0 16px' }}>
        <Card style={{ textAlign: 'center', padding: isMobile ? '24px 12px' : '32px 16px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? 16 : 24 }}>
            <div style={{
              width: logoSize, height: logoSize, borderRadius: '50%', background: token.colorPrimary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              <ScissorOutlined style={{ fontSize: logoSize * 0.5, color: '#fff' }} />
            </div>
          </div>
          <Title level={isMobile ? 3 : 2} style={{ marginBottom: 8 }}>Miguel Castilho</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: isMobile ? 24 : 32, fontSize: isMobile ? 14 : 16 }}>
            Agende seu corte com apenas alguns cliques
          </Text>
          <Button type="primary" size="large" icon={<CalendarOutlined />} onClick={() => setSchedulingStarted(true)}
            style={{ height: 48, paddingInline: isMobile ? 32 : 48, fontSize: 16, fontWeight: 'bold', borderRadius: 12 }}>
            Agendar horário
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PublicHomePage;
