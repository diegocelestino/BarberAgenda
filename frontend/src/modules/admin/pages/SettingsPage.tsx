import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Form,
  Input,
  InputNumber,
  Switch,
  TimePicker,
  Space,
  Spin,
  message,
  Tabs,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminLayout from '../layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchConfig, updateConfig } from '../../../store/config/configSlice';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { config, loading } = useAppSelector((state) => state.config);
  const [saving, setSaving] = useState(false);
  const [shopForm] = Form.useForm();
  const [bookingForm] = Form.useForm();
  const [loyaltyForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  useEffect(() => {
    if (!config) dispatch(fetchConfig());
  }, [dispatch, config]);

  useEffect(() => {
    if (!config) return;
    const data = config;

    shopForm.setFieldsValue({
      name: data.shop?.name || 'Barbearia',
      address: data.shop?.address || '',
      phone: data.shop?.phone || '',
      whatsapp: data.shop?.whatsapp || '',
    });

    bookingForm.setFieldsValue({
      maxDaysInAdvance: data.booking?.maxBookingDaysAhead || 60,
      minAdvanceHours: (data.booking?.minAdvanceTimeMinutes || 60) / 60,
      slotInterval: data.booking?.defaultSlotIntervalMinutes || 30,
      allowSameDayBooking: data.booking?.allowSameDayBooking ?? true,
    });

    loyaltyForm.setFieldsValue({
      pointsPerReal: data.loyalty?.pointsPerReal || 1,
      pointsForReward: data.loyalty?.pointsForReward || 500,
      rewardDescription: data.loyalty?.rewardDescription || 'Serviço grátis',
    });

    const schedule = data.defaultSchedule || {};
    scheduleForm.setFieldsValue({
      openTime: schedule.openTime ? dayjs(schedule.openTime, 'HH:mm') : dayjs('09:00', 'HH:mm'),
      closeTime: schedule.closeTime ? dayjs(schedule.closeTime, 'HH:mm') : dayjs('18:00', 'HH:mm'),
      lunchStart: schedule.lunchStart ? dayjs(schedule.lunchStart, 'HH:mm') : dayjs('12:00', 'HH:mm'),
      lunchEnd: schedule.lunchEnd ? dayjs(schedule.lunchEnd, 'HH:mm') : dayjs('13:00', 'HH:mm'),
      workDays: schedule.workDays || [1, 2, 3, 4, 5, 6],
    });
  }, [config]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      let payload: any = {};
      if (section === 'Dados da barbearia') {
        payload = { shop: shopForm.getFieldsValue() };
      } else if (section === 'Horários') {
        const values = scheduleForm.getFieldsValue();
        payload = { defaultSchedule: {
          openTime: values.openTime?.format('HH:mm'),
          closeTime: values.closeTime?.format('HH:mm'),
          lunchStart: values.lunchStart?.format('HH:mm'),
          lunchEnd: values.lunchEnd?.format('HH:mm'),
          workDays: [1, 2, 3, 4, 5, 6],
          slotInterval: 30,
        }};
      } else if (section === 'Agendamento') {
        const values = bookingForm.getFieldsValue();
        payload = { booking: {
          ...values,
          minAdvanceTimeMinutes: (values.minAdvanceHours || 1) * 60,
        }};
      } else if (section === 'Fidelidade') {
        payload = { loyalty: loyaltyForm.getFieldsValue() };
      }
      await dispatch(updateConfig(payload)).unwrap();
      message.success(`${section} salvo com sucesso`);
    } catch (err) {
      message.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout selectedKey="settings">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedKey="settings">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={2} style={{ margin: 0 }}>Configurações</Title>
        <Text type="secondary">Configurações gerais da barbearia.</Text>

        <Tabs items={[
          {
            key: 'shop',
            label: 'Barbearia',
            children: (
              <Card>
                <Form form={shopForm} layout="vertical" style={{ maxWidth: 500 }}>
                  <Form.Item name="name" label="Nome da barbearia">
                    <Input />
                  </Form.Item>
                  <Form.Item name="address" label="Endereço">
                    <Input />
                  </Form.Item>
                  <Form.Item name="phone" label="Telefone">
                    <Input />
                  </Form.Item>
                  <Form.Item name="whatsapp" label="WhatsApp">
                    <Input />
                  </Form.Item>
                  <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('Dados da barbearia')}>
                    Salvar
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'schedule',
            label: 'Horários',
            children: (
              <Card>
                <Form form={scheduleForm} layout="vertical" style={{ maxWidth: 500 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="openTime" label="Abertura">
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="closeTime" label="Fechamento">
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="lunchStart" label="Início almoço">
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="lunchEnd" label="Fim almoço">
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Dias de funcionamento: Seg–Sáb (configurável por barbeiro)
                  </Text>
                  <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('Horários')}>
                    Salvar
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'booking',
            label: 'Agendamento',
            children: (
              <Card>
                <Form form={bookingForm} layout="vertical" style={{ maxWidth: 500 }}>
                  <Form.Item name="maxDaysInAdvance" label="Máximo de dias para agendar com antecedência">
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="minAdvanceHours" label="Antecedência mínima (horas)">
                    <InputNumber min={0} max={48} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="slotInterval" label="Intervalo entre horários (minutos)">
                    <InputNumber min={5} max={60} step={5} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="allowSameDayBooking" label="Permitir agendamento no mesmo dia" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('Agendamento')}>
                    Salvar
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'loyalty',
            label: 'Fidelidade',
            children: (
              <Card>
                <Form form={loyaltyForm} layout="vertical" style={{ maxWidth: 500 }}>
                  <Form.Item name="pointsPerReal" label="Pontos por R$ gasto">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="pointsForReward" label="Pontos para resgate">
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="rewardDescription" label="Descrição do prêmio">
                    <Input placeholder="Ex: 1 serviço grátis (Barba)" />
                  </Form.Item>
                  <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('Fidelidade')}>
                    Salvar
                  </Button>
                </Form>
              </Card>
            ),
          },
        ]} />
      </Space>
    </AdminLayout>
  );
};

export default SettingsPage;
