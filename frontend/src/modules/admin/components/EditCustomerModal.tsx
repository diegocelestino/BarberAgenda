import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useAppDispatch } from '../../../store/hooks';
import { updateCustomer } from '../../../store/customers/customersThunks';
import { Customer } from '../../../services/customersApi';

interface EditCustomerModalProps {
  open: boolean;
  customer: Customer;
  onClose: () => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ open, customer, onClose }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
      });
    }
  }, [open, customer, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(updateCustomer({ customerId: customer.customerId, data: values })).unwrap();
      message.success('Cliente atualizado');
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error('Erro ao atualizar');
    }
  };

  return (
    <Modal
      title="Editar cliente"
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      okText="Salvar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Nome é obrigatório' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Telefone" rules={[{ required: true, message: 'Telefone é obrigatório' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCustomerModal;
