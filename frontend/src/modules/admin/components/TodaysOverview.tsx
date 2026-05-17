import React from 'react';
import { Card, Row, Col, Tag, Statistic, Typography } from 'antd';

const { Text } = Typography;

interface TodaysOverviewProps {
  appointmentsToday: number;
  remaining: number;
  revenueToday: number;
  barberCount: number;
}

const TodaysOverview: React.FC<TodaysOverviewProps> = ({ appointmentsToday, remaining, revenueToday, barberCount }) => (
  <Card title="Resumo do dia" extra={<Tag color="success">● Ao vivo</Tag>}>
    <Row gutter={[24, 16]}>
      <Col xs={12} sm={6}>
        <Statistic title="Agendamentos hoje" value={appointmentsToday} />
        <Text type="success" style={{ fontSize: 12 }}>{remaining} restantes hoje</Text>
      </Col>
      <Col xs={12} sm={6}>
        <Statistic title="Receita hoje" value={revenueToday} prefix="R$" />
      </Col>
      <Col xs={12} sm={6}>
        <Statistic title="Barbeiros ativos" value={barberCount} />
      </Col>
      <Col xs={12} sm={6}>
        <Statistic title="Concluídos" value={appointmentsToday - remaining} />
      </Col>
    </Row>
  </Card>
);

export default TodaysOverview;
