import { Form, Input, InputNumber, message, Modal, Switch } from 'antd';
import { useState } from 'react';

import { createOrder, getOrders } from '../../services/orders';
import { useOrders } from '../../hooks/useOrders';

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateOrderModal({ open, onClose }: CreateOrderModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { setOrders } = useOrders();

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await createOrder({
        customerName: values.customerName,
        seller: values.seller,
        paid: values.paid || false,
        contact: values.contact || undefined,
        address: values.address || undefined,
        quantity: values.quantity,
        notes: values.notes || undefined,
        isPickup: values.isPickup || false,
      });

      const orders = await getOrders();
      setOrders(orders);

      message.success('Pedido criado com sucesso');
      form.resetFields();
      onClose();
    } catch {
      // Validation error or API error - antd shows validation errors automatically
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    form.resetFields();
    onClose();
  }

  return (
    <Modal
      title="Novo Pedido"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Criar"
      cancelText="Cancelar"
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          paid: false,
          isPickup: false,
          quantity: 1,
        }}
      >
        <Form.Item
          label="Nome do cliente"
          name="customerName"
          rules={[{ required: true, message: 'Nome do cliente é obrigatório' }]}
        >
          <Input placeholder="Nome do cliente" />
        </Form.Item>

        <Form.Item
          label="Vendedor"
          name="seller"
          rules={[{ required: true, message: 'Vendedor é obrigatório' }]}
        >
          <Input placeholder="Vendedor" />
        </Form.Item>

        <Form.Item label="Pago" name="paid" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Contato" name="contact">
          <Input placeholder="Telefone ou WhatsApp" />
        </Form.Item>

        <Form.Item label="Endereço" name="address">
          <Input.TextArea placeholder="Endereço de entrega" rows={2} />
        </Form.Item>

        <Form.Item
          label="Quantidade"
          name="quantity"
          rules={[{ required: true, message: 'Quantidade é obrigatória' }]}
        >
          <InputNumber min={1} placeholder="Quantidade" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Observações" name="notes">
          <Input.TextArea placeholder="Observações adicionais" rows={2} />
        </Form.Item>

        <Form.Item label="Tipo" name="isPickup" valuePropName="checked">
          <Switch checkedChildren="Retirada" unCheckedChildren="Entrega" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
