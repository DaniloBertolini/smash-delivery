import {
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Empty,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';

import {
  CheckCircleOutlined,
  PhoneOutlined,
  DollarOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { getOrders, updateOrder, markAsPaid } from '../../services/orders';
import { openGoogleMaps, openWaze, openGoogleMapsDirections } from '../../utils/mapHelper';
import type { Order } from '../../types/Order';

const { Title, Text } = Typography;

export function Motorboy() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const response = await getOrders();
      setOrders(response.filter(order => order.status === 'OUT_FOR_DELIVERY'));
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    const allIds = new Set(orders.map(order => order.id));
    setSelectedOrders(allIds);
  }

  function clearSelection() {
    setSelectedOrders(new Set());
  }

  function createOptimizedRoute() {
    const selectedAddresses = orders
      .filter(order => selectedOrders.has(order.id))
      .map(order => order.address)
      .filter(Boolean);

    if (selectedAddresses.length === 0) {
      message.warning('Selecione pelo menos 1 pedido para abrir no mapa');
      return;
    }

    if (selectedAddresses.length === 1) {
      openGoogleMaps(selectedAddresses[0]);
      return;
    }

    const startAddress = 'Assembleia de Deus - Do Ubatuba, São Francisco do Sul - SC, 89240-000';

    openGoogleMapsDirections(selectedAddresses, startAddress);
  }

  function confirmDelivery(id: string) {
    Modal.confirm({
      title: 'Confirmar entrega',
      content: 'Deseja marcar este pedido como entregue?',
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      onOk() {
        markAsDelivered(id);
      },
    });
  }

  async function markAsDelivered(id: string) {
    setDelivering(id);
    try {
      await updateOrder(id, 'DELIVERED');
      await loadOrders();
      message.success('Entrega confirmada!');
    } catch {
      message.error('Erro ao confirmar entrega');
    } finally {
      setDelivering(null);
    }
  }

  async function handleMarkAsPaid(id: string) {
    setDelivering(id);
    try {
      await markAsPaid(id);
      await loadOrders();
      message.success('Marcado como pago!');
    } catch {
      message.error('Erro ao marcar como pago');
    } finally {
      setDelivering(null);
    }
  }

  if (orders.length === 0 && !loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Empty
          description="Nenhuma entrega em andamento"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(255, 107, 53, 0) 100%)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          border: '1px solid rgba(255, 107, 53, 0.1)',
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              <ShoppingCartOutlined style={{ color: '#FF6B35', marginRight: 8 }} />
              Entregas em Andamento
            </Title>
          </Col>
          <Col xs={24} md={12}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button icon={<ReloadOutlined />} onClick={loadOrders} loading={loading}>
                Atualizar
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Route Selection Card */}
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.05) 0%, rgba(24, 144, 255, 0) 100%)',
          border: '1px solid rgba(24, 144, 255, 0.1)',
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Space>
              <Checkbox
                checked={selectedOrders.size === orders.length && orders.length > 0}
                indeterminate={selectedOrders.size > 0 && selectedOrders.size < orders.length}
                onChange={e => {
                  if (e.target.checked) {
                    selectAll();
                  } else {
                    clearSelection();
                  }
                }}
              >
                Selecionar todos ({orders.length})
              </Checkbox>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {selectedOrders.size > 0 && `(${selectedOrders.size} selecionados)`}
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ width: '100%', justifyContent: {xs: 'flex-start', md: 'flex-end' } }}>
              {selectedOrders.size > 0 && (
                <>
                  <Button
                    type="primary"
                    icon={<EnvironmentOutlined />}
                    onClick={createOptimizedRoute}
                  >
                    Criar Rota
                  </Button>
                  <Button onClick={clearSelection}>Limpar</Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Delivery Cards */}
      <Row gutter={[16, 16]}>
        {orders.map(order => (
          <Col xs={24} lg={12} xl={8} key={order.id}>
            <Card
              extra={
                <Space direction="vertical" size={8}>
                  {!order.paid && (
                    <Button
                      icon={<DollarOutlined />}
                      loading={delivering === order.id}
                      onClick={() => handleMarkAsPaid(order.id)}
                      block
                    >
                      Marcar Pago
                    </Button>
                  )}
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={delivering === order.id}
                    onClick={() => confirmDelivery(order.id)}
                    block
                  >
                    Entregue
                  </Button>
                </Space>
              }
              style={{
                borderLeft: '4px solid #1890FF',
                ...(selectedOrders.has(order.id) ? { borderRight: '4px solid #1890FF', background: 'rgba(24, 144, 255, 0.02)' } : {}),
                transition: 'all 0.3s ease',
                ...(selectedOrders.has(order.id) && {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(24, 144, 255, 0.15)',
                }),
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <Checkbox
                  checked={selectedOrders.has(order.id)}
                  onChange={() => toggleSelect(order.id)}
                  style={{ fontSize: 13 }}
                >
                  Adicionar à rota
                </Checkbox>
              </div>

              <Descriptions column={1} size="small">
                <Descriptions.Item label="Cliente">
                  <Space>
                    <UserOutlined style={{ color: '#999' }} />
                    <Text strong>{order.customerName}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Vendedor">{order.seller}</Descriptions.Item>
                <Descriptions.Item label="Quantidade">
                  <Tag color="blue" style={{ fontSize: 13, fontWeight: 600 }}>
                    {order.quantity}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Endereço">
                  {order.address ? (
                    <>
                      <Text style={{ display: 'block', marginBottom: 8 }}>{order.address}</Text>
                      <Space size={8}>
                        <Button
                          size="small"
                          icon={<EnvironmentOutlined />}
                          onClick={() => openGoogleMaps(order.address)}
                        >
                          Maps
                        </Button>
                        <Button
                          size="small"
                          icon={<CarOutlined />}
                          onClick={() => openWaze(order.address)}
                        >
                          Waze
                        </Button>
                      </Space>
                    </>
                  ) : (
                    <Text type="secondary">-</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Contato">
                  {order.contact ? (
                    <a href={`tel:${order.contact}`} style={{ color: '#1890FF', textDecoration: 'none' }}>
                      {order.contact} <PhoneOutlined style={{ marginLeft: 4 }} />
                    </a>
                  ) : (
                    <Text type="secondary">-</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Pagamento">
                  <Tag
                    color={order.paid ? '#52C41A' : '#FF4D4F'}
                    style={{ fontWeight: 500 }}
                  >
                    {order.paid ? 'Pago' : 'A pagar'}
                  </Tag>
                </Descriptions.Item>
                {order.notes && (
                  <Descriptions.Item label="Observação">
                    <Tag color="#FAAD14">{order.notes}</Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}