import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import { customersApi } from '../../../services/customersApi';

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({ open, onClose, onCreated }) => {
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await customersApi.create(values);
      message.success('Cliente criado');
      form.resetFields();
      onCreated();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      message.error('Erro ao criar cliente');
    }
  };

  return (
    <Modal
      title="Novo cliente"
      open={open}
      onOk={handleSave}
      onCancel={() => { form.resetFields(); onClose(); }}
      okText="Salvar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Nome é obrigatório' }]}>
          <Input placeholder="Ex: João Silva" />
        </Form.Item>
        <Form.Item name="phone" label="Telefone" rules={[{ required: true, message: 'Telefone é obrigatório' }]}>
          <Input placeholder="+5511999887766" />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input placeholder="joao@email.com" />
        </Form.Item>
        <Form.Item name="notes" label="Notas">
          <Input.TextArea rows={3} placeholder="Preferências, observações..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCustomerModal;
