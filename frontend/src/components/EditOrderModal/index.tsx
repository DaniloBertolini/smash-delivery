import { Form, Input, InputNumber, message, Modal, Switch } from 'antd';
import { useEffect, useState } from 'react';

import { getOrders, updateOrderData } from '../../services/orders';
import { useOrders } from '../../hooks/useOrders';
import type { Order } from '../../types/Order';

interface EditOrderModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

export function EditOrderModal({ open, order, onClose }: EditOrderModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { setOrders } = useOrders();

  useEffect(() => {
    if (order) {
      form.setFieldsValue({
        customerName: order.customerName,
        seller: order.seller,
        paid: order.paid,
        contact: order.contact || '',
        address: order.address || '',
        quantity: order.quantity,
        notes: order.notes || '',
        isPickup: order.isPickup,
      });
    }
  }, [order, form]);

  async function handleSubmit() {
    if (!order) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      await updateOrderData(order.id, {
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

      message.success('Pedido atualizado com sucesso');
      onClose();
    } catch {
      // Validation error or API error
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
      title="Editar Pedido"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Salvar"
      cancelText="Cancelar"
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
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
