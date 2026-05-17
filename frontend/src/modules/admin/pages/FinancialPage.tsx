import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  DatePicker,
  Grid,
  List,
  Spin,
} from 'antd';
import {
  DownloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import AdminLayout from '../layout/AdminLayout';
import { financialApi, Transaction, FinancialSummary } from '../../../services/financialApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Financial Summary ───────────────────────────────────────────────────────

function SummaryCards({ summary }: { summary: FinancialSummary }) {
  return (
    <Card title="Resumo financeiro" extra={<Tag color="blue">{summary.startDate} — {summary.endDate}</Tag>}>
      <Row gutter={[24, 16]}>
        <Col xs={12} sm={6}>
          <Statistic title="Receita total" value={summary.revenue} prefix="R$" valueStyle={{ color: '#50c878' }} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="Despesas" value={summary.expenses} prefix="R$" valueStyle={{ color: '#ff5252' }} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="Lucro líquido" value={summary.profit} prefix="R$" valueStyle={{ color: summary.profit >= 0 ? '#50c878' : '#ff5252' }} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="Transações" value={summary.transactionCount} />
        </Col>
      </Row>
    </Card>
  );
}

// ─── Daily Revenue Chart ─────────────────────────────────────────────────────

function DailyRevenueChart({ transactions }: { transactions: Transaction[] }) {
  const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const revenueByDay = transactions
    .filter((t) => t.type === 'revenue')
    .reduce((acc, t) => {
      const day = DAY_NAMES[new Date(t.date + 'T12:00:00').getDay()];
      const existing = acc.find((d) => d.day === t.date);
      if (existing) { existing.value += t.amount; }
      else { acc.push({ day: t.date, value: t.amount, label: day }); }
      return acc;
    }, [] as { day: string; value: number; label: string }[])
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((d) => ({ day: d.label, value: d.value }));

  return (
    <Card title="Receita diária">
      <Column
        data={revenueByDay}
        xField="day"
        yField="value"
        height={250}
        color="#c8a05c"
        theme="dark"
      />
    </Card>
  );
}

// ─── Revenue by Payment Method ───────────────────────────────────────────────

function RevenueByPaymentChart({ transactions }: { transactions: Transaction[] }) {
  const data = transactions
    .filter((t) => t.type === 'revenue')
    .reduce((acc, t) => {
      const method = t.paymentMethod || 'Outros';
      const label = { pix: 'PIX', dinheiro: 'Dinheiro', cartao_debito: 'Débito', cartao_credito: 'Crédito' }[method] || method;
      const existing = acc.find((d) => d.method === label);
      if (existing) { existing.value += t.amount; }
      else { acc.push({ method: label, value: t.amount }); }
      return acc;
    }, [] as { method: string; value: number }[]);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) return <Card title="Receita por método"><Text type="secondary">Sem dados</Text></Card>;

  return (
    <Card title="Receita por método">
      <Pie
        data={data}
        angleField="value"
        colorField="method"
        radius={0.8}
        innerRadius={0.6}
        height={250}
        theme="dark"
        statistic={{
          title: { content: 'Total' },
          content: { content: `R$ ${total}` },
        }}
        legend={{ position: 'right' }}
      />
    </Card>
  );
}

// ─── Recent Transactions Table ───────────────────────────────────────────────

function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const columns = [
    {
      title: 'Data',
      dataIndex: 'date',
      width: 100,
      render: (d: string) => <Text type="secondary">{new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')}</Text>,
    },
    {
      title: 'Cliente',
      dataIndex: 'description',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Serviço',
      dataIndex: 'serviceName',
      width: 140,
      render: (text: string) => text || '—',
    },
    {
      title: 'Barbeiro',
      dataIndex: 'barberName',
      width: 130,
      render: (text: string) => text || '—',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => type === 'revenue'
        ? <Tag color="green">Receita</Tag>
        : type === 'expense'
        ? <Tag color="red">Despesa</Tag>
        : <Tag color="orange">Comissão</Tag>,
    },
    {
      title: 'Pagamento',
      dataIndex: 'paymentMethod',
      width: 100,
      render: (m: string) => {
        const labels: Record<string, string> = { pix: 'PIX', dinheiro: 'Dinheiro', cartao_debito: 'Débito', cartao_credito: 'Crédito' };
        return labels[m] || m || '—';
      },
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      width: 110,
      render: (amount: number, record: Transaction) => (
        <Text strong style={{ color: record.type === 'revenue' ? '#50c878' : '#ff5252' }}>
          {record.type === 'expense' ? '- ' : ''}R$ {amount}
        </Text>
      ),
    },
  ];

  if (isMobile) {
    return (
      <Card title="Transações recentes" extra={<Button icon={<PlusOutlined />} size="small">Nova</Button>}>
        <List
          dataSource={transactions.slice(0, 10)}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.description}
                description={`${new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')} · ${item.serviceName || ''} · ${item.barberName || ''}`}
              />
              <Text strong style={{ color: item.type === 'revenue' ? '#50c878' : '#ff5252' }}>
                {item.type === 'expense' ? '-' : ''}R$ {item.amount}
              </Text>
            </List.Item>
          )}
        />
      </Card>
    );
  }

  return (
    <Card
      title="Transações recentes"
      extra={
        <Space>
          <Button icon={<DownloadOutlined />}>Exportar</Button>
          <Button type="primary" icon={<PlusOutlined />}>Nova transação</Button>
        </Space>
      }
    >
      <Table
        dataSource={transactions}
        columns={columns}
        rowKey="transactionId"
        size="small"
        pagination={{ pageSize: 10, showTotal: (total) => `${total} transações` }}
      />
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const FinancialPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<[string, string]>(() => {
    const end = dayjs().format('YYYY-MM-DD');
    const start = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    return [start, end];
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryData, txns] = await Promise.all([
        financialApi.getSummary(dateRange[0], dateRange[1]),
        financialApi.getTransactions({ startDate: dateRange[0], endDate: dateRange[1] }),
      ]);
      setSummary(summaryData);
      setTransactions(txns);
    } catch (err) {
      console.error('Failed to fetch financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    }
  };

  if (loading || !summary) {
    return (
      <AdminLayout selectedKey="financial">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedKey="financial">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row justify="space-between" align="middle" wrap>
          <Col>
            <Title level={2} style={{ margin: 0 }}>Visão financeira</Title>
            <Text type="secondary">Receitas, despesas e desempenho financeiro.</Text>
          </Col>
          <Col>
            <Space>
              <RangePicker
                value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
                onChange={handleDateChange}
                format="DD/MM/YYYY"
              />
              <Button icon={<DownloadOutlined />}>Exportar</Button>
            </Space>
          </Col>
        </Row>

        <SummaryCards summary={summary} />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <DailyRevenueChart transactions={transactions} />
          </Col>
          <Col xs={24} lg={8}>
            <RevenueByPaymentChart transactions={transactions} />
          </Col>
        </Row>

        <RecentTransactions transactions={transactions} />
      </Space>
    </AdminLayout>
  );
};

export default FinancialPage;
