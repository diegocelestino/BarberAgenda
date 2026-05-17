import React from 'react';
import { Table, Tag, Space, Button, Dropdown, List, Typography, Grid } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { AppointmentItem, statusConfig } from '../types';

const { Text } = Typography;

const ACTIONS_MENU = {
  items: [
    { key: 'view', label: 'Ver detalhes' },
    { key: 'edit', label: 'Editar agendamento' },
    { key: 'confirm', label: 'Marcar como confirmado' },
    { key: 'complete', label: 'Marcar como concluído' },
    { type: 'divider' as const },
    { key: 'cancel', label: 'Cancelar agendamento', danger: true },
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
    width: 180,
    render: (text: string, record: AppointmentItem) => (
      <Space direction="vertical" size={0}>
        <Text strong>{text}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>{record.phone}</Text>
      </Space>
    ),
  },
  {
    title: 'Serviço',
    dataIndex: 'service',
    width: 160,
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
    width: 130,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 130,
    render: (status: string) => {
      const config = statusConfig[status];
      return config ? <Tag color={config.color} icon={config.icon}>{config.label}</Tag> : null;
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

interface AppointmentsTableProps {
  appointments: AppointmentItem[];
  emptyText?: string;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments, emptyText = 'Nenhum agendamento encontrado.' }) => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  if (isMobile) {
    return (
      <List
        dataSource={appointments}
        locale={{ emptyText }}
        renderItem={(item) => {
          const config = statusConfig[item.status];
          return (
            <List.Item
              extra={
                <Dropdown menu={ACTIONS_MENU} trigger={['click']}>
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
                description={`${item.phone} · ${item.service} · ${item.duration} · ${item.barber}`}
              />
            </List.Item>
          );
        }}
      />
    );
  }

  return (
    <Table
      dataSource={appointments}
      columns={columns}
      rowKey={(r) => `${r.time}-${r.customer}`}
      pagination={false}
      size="middle"
      locale={{ emptyText }}
    />
  );
};

export default AppointmentsTable;
