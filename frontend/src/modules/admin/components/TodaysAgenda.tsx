import React from 'react';
import { Card, Table, Tag, Space, Button, Dropdown, List, Typography, Grid } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { AppointmentItem, statusConfig } from '../types';

const { Text, Link } = Typography;

interface TodaysAgendaProps {
  appointments: AppointmentItem[];
}

const ACTIONS_MENU = {
  items: [
    { key: 'edit', label: 'Editar agendamento' },
    { key: 'complete', label: 'Marcar como concluído' },
    { key: 'noshow', label: 'Marcar como não compareceu' },
    { type: 'divider' as const },
    { key: 'cancel', label: 'Cancelar', danger: true },
  ],
};

const MOBILE_ACTIONS_MENU = {
  items: [
    { key: 'edit', label: 'Editar' },
    { key: 'complete', label: 'Concluir' },
    { key: 'cancel', label: 'Cancelar', danger: true },
  ],
};

const columns = [
  {
    title: 'Horário',
    dataIndex: 'time',
    width: 80,
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: 'Cliente',
    dataIndex: 'customer',
    width: 160,
    render: (text: string, record: AppointmentItem) => (
      <Space direction="vertical" size={0}>
        <Link>{text}</Link>
        <Text type="secondary" style={{ fontSize: 12 }}>{record.phone}</Text>
      </Space>
    ),
  },
  {
    title: 'Serviço',
    dataIndex: 'service',
    width: 150,
    render: (text: string, record: AppointmentItem) => (
      <Space direction="vertical" size={0}>
        <Text>{text}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>{record.duration}</Text>
      </Space>
    ),
  },
  {
    title: 'Barbeiro',
    dataIndex: 'barber',
    width: 100,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 130,
    render: (status: string) => {
      const config = statusConfig[status];
      return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
    },
  },
  {
    title: '',
    width: 50,
    render: () => (
      <Dropdown menu={ACTIONS_MENU} trigger={['click']}>
        <Button type="text" icon={<MoreOutlined />} size="small" />
      </Dropdown>
    ),
  },
];

const TodaysAgenda: React.FC<TodaysAgendaProps> = ({ appointments }) => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card
      title="Agenda de hoje"
      extra={
        isMobile
          ? <Button type="primary" icon={<PlusOutlined />} size="small">Novo</Button>
          : (
            <Space>
              <Button>Ver agenda completa</Button>
              <Button type="primary" icon={<PlusOutlined />}>Novo agendamento</Button>
            </Space>
          )
      }
    >
      {isMobile ? (
        <List
          dataSource={appointments}
          renderItem={(item) => {
            const config = statusConfig[item.status];
            return (
              <List.Item
                extra={
                  <Dropdown menu={MOBILE_ACTIONS_MENU} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} size="small" />
                  </Dropdown>
                }
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{item.time}</Text>
                      <Text>{item.customer}</Text>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Space>
                  }
                  description={`${item.phone} · ${item.service} · ${item.duration}`}
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Table
          dataSource={appointments}
          columns={columns}
          rowKey="time"
          pagination={false}
          size="small"
        />
      )}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <Link>Ver todos os agendamentos</Link>
      </div>
    </Card>
  );
};

export default TodaysAgenda;
