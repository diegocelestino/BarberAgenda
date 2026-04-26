import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Input, Space, Spin, Table, Tag, Typography, theme } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBarberById, selectSelectedBarber, selectBarbersLoading,
  selectBarbersError, clearSelectedBarber,
} from '../store/barbers';
import { parseDate, endOfDay, formatFullDate, formatTime, getTodayDateString } from '../utils/dateTime';
import { barberApi } from '../services/api';

const { Title, Text } = Typography;

interface ExtractData {
  barber: { barberId: string; name: string };
  period: { startDate: number; endDate: number };
  summary: {
    totalRevenue: number;
    totalAppointments: number;
    byService: Array<{ serviceId: string; serviceName: string; count: number; revenue: number }>;
  };
  appointments: Array<{
    appointmentId: string; customerName: string; customerPhone?: string;
    startTime: number; serviceName: string; servicePrice: number; notes?: string;
  }>;
}

const BarberExtractPage: React.FC = () => {
  const { token } = theme.useToken();
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);

  const [startDate, setStartDate] = useState(getTodayDateString);
  const [endDateStr, setEndDateStr] = useState(getTodayDateString);
  const [extractData, setExtractData] = useState<ExtractData | null>(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  useEffect(() => {
    if (barberId) dispatch(fetchBarberById(barberId));
    return () => { dispatch(clearSelectedBarber()); };
  }, [barberId, dispatch]);

  useEffect(() => {
    if (!barberId || !startDate || !endDateStr) return;
    const loadData = async () => {
      try {
        setExtractLoading(true); setExtractError(null);
        const start = parseDate(startDate);
        const end = endOfDay(parseDate(endDateStr));
        const data = await barberApi.getExtract(barberId, start, end);
        setExtractData(data);
      } catch (err) {
        console.error('Error loading extract:', err);
        setExtractError('Erro ao carregar extrato. Por favor, tente novamente.');
      } finally { setExtractLoading(false); }
    };
    loadData();
  }, [barberId, startDate, endDateStr]);

  const handleDownloadPDF = () => {
    if (!barberId || !extractData) return;
    const start = parseDate(startDate);
    const end = endOfDay(parseDate(endDateStr));
    const apiUrl = process.env.REACT_APP_API_URL;
    window.open(`${apiUrl}/barbers/${barberId}/extract?startDate=${start}&endDate=${end}&format=pdf`, '_blank');
  };

  if (loading && !barber) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><Spin size="large" /></div>;
  if (error) return <Alert type="error" message={error} showIcon style={{ margin: 16 }} />;
  if (!barber) return <Alert type="warning" message="Barbeiro não encontrado" showIcon style={{ margin: 16 }} />;

  const columns = [
    { title: 'Data', dataIndex: 'startTime', key: 'date', render: (t: number) => formatFullDate(t) },
    { title: 'Hora', dataIndex: 'startTime', key: 'time', render: (t: number) => formatTime(t) },
    { title: 'Cliente', dataIndex: 'customerName', key: 'customer' },
    { title: 'Serviço', dataIndex: 'serviceName', key: 'service', render: (v: string) => <Tag color="green">{v}</Tag> },
    { title: 'Valor', dataIndex: 'servicePrice', key: 'price', render: (v: number) => <Text strong>R$ {v.toFixed(2)}</Text> },
    { title: 'Telefone', dataIndex: 'customerPhone', key: 'phone', render: (v?: string) => <Text type="secondary">{v || '-'}</Text> },
    { title: 'Observações', dataIndex: 'notes', key: 'notes', render: (v?: string) => <Text type="secondary">{v || '-'}</Text> },
  ];

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 16px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(`/admin/barber/${barberId}`)} style={{ marginRight: 8 }} />
            <Title level={4} style={{ margin: 0 }}>Extrato - {barber.name}</Title>
          </div>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPDF}
            disabled={!extractData || extractData.summary.totalAppointments === 0}>
            Baixar PDF
          </Button>
        </div>

        <Space direction="horizontal" size="middle" style={{ marginBottom: 24, width: '100%', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Data Início</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Data Fim</label>
            <Input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} />
          </div>
        </Space>

        {extractError && <Alert type="error" message={extractError} showIcon style={{ marginBottom: 16 }} />}

        {extractLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spin size="large" /></div>
        ) : !extractData ? (
          <Alert type="info" message="Selecione um período para visualizar o extrato." />
        ) : extractData.summary.totalAppointments === 0 ? (
          <Alert type="info" message="Nenhum atendimento concluído encontrado no período selecionado." />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text type="secondary">Total de atendimentos: {extractData.summary.totalAppointments}</Text>
              <Title level={5} style={{ margin: 0, color: token.colorPrimary }}>Total: R$ {extractData.summary.totalRevenue.toFixed(2)}</Title>
            </div>

            {extractData.summary.byService.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Text strong>Por Serviço:</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {extractData.summary.byService.map((s) => (
                    <Tag key={s.serviceId} color="gold">{s.serviceName}: {s.count}x - R$ {s.revenue.toFixed(2)}</Tag>
                  ))}
                </div>
              </div>
            )}

            <Table columns={columns} dataSource={extractData.appointments} rowKey="appointmentId"
              scroll={{ x: 700 }} pagination={false} size="small" />
          </>
        )}
      </Card>
    </div>
  );
};

export default BarberExtractPage;
