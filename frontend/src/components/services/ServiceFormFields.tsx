import { Input, InputNumber, Typography } from 'antd';

const { Text } = Typography;

export interface ServiceFormData {
  title: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface ServiceFormFieldsProps {
  data: ServiceFormData;
  onChange: (field: keyof ServiceFormData, value: any) => void;
}

const ServiceFormFields: React.FC<ServiceFormFieldsProps> = ({ data, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
    <div><label>Título do Serviço</label><Input value={data.title} onChange={(e) => onChange('title', e.target.value)} placeholder="Ex: Corte" /><Text type="secondary" style={{ fontSize: 12 }}>Título interno para administração</Text></div>
    <div><label>Nome de Exibição</label><Input value={data.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Ex: Corte Profissional" /><Text type="secondary" style={{ fontSize: 12 }}>Nome exibido para clientes</Text></div>
    <div><label>Descrição</label><Input.TextArea rows={2} value={data.description} onChange={(e) => onChange('description', e.target.value)} placeholder="Ex: Corte profissional com finalização" /><Text type="secondary" style={{ fontSize: 12 }}>Descrição opcional para clientes</Text></div>
    <div><label>Preço (R$)</label><InputNumber min={0} step={5} value={data.price} onChange={(v) => onChange('price', v || 0)} style={{ width: '100%' }} /></div>
    <div><label>Duração (minutos)</label><InputNumber min={15} step={15} value={data.duration} onChange={(v) => onChange('duration', v || 15)} style={{ width: '100%' }} /></div>
  </div>
);

export default ServiceFormFields;
