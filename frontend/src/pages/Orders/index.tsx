import {
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';

import {
  TrophyOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  CarOutlined,
  InboxOutlined,
  PlusOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { ImportOrders } from '../../components/ImportOrders';
import { SellerRanking } from '../../components/SellerRanking';
import { CreateOrderModal } from '../../components/CreateOrderModal';
import { EditOrderModal } from '../../components/EditOrderModal';
import { getOrders, updateOrder, markAsPaid } from '../../services/orders';
import { openGoogleMaps } from '../../utils/mapHelper';
import { useOrders } from '../../hooks/useOrders';
import type { Order } from '../../types/Order';

const { Text } = Typography;

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'gold',
    PENDING_PICKUP: 'orange',
    OUT_FOR_DELIVERY: 'blue',
    DELIVERED: 'green',
    PICKED_UP: 'green',
  };
  return colors[status] ?? 'default';
}

export function Orders() {
  const { orders: data, setOrders: setData } = useOrders();
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const response = await getOrders();
      setData(response);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPagination(prev => ({ ...prev, current: 1 }));
  }, [searchText, filterType, filterPaid, filterStatus]);

  async function changeStatus(id: string, reverse = false): Promise<void> {
    const targetOrder = data.find(o => o.id === id);
    if (!targetOrder) return;

    let newStatus: Order['status'];
    if (reverse) {
      if (targetOrder.status === 'DELIVERED') {
        newStatus = 'OUT_FOR_DELIVERY';
      } else if (targetOrder.status === 'OUT_FOR_DELIVERY') {
        newStatus = 'PENDING';
      } else if (targetOrder.status === 'PICKED_UP') {
        newStatus = 'PENDING_PICKUP';
      } else if (targetOrder.status === 'PENDING_PICKUP') {
        newStatus = 'PENDING';
      } else {
        return;
      }
    } else {
      if (targetOrder.status === 'PENDING') {
        newStatus = targetOrder.isPickup ? 'PENDING_PICKUP' : 'OUT_FOR_DELIVERY';
      } else if (targetOrder.status === 'PENDING_PICKUP') {
        newStatus = 'PICKED_UP';
      } else if (targetOrder.status === 'OUT_FOR_DELIVERY') {
        newStatus = 'DELIVERED';
      } else {
        return;
      }
    }

    try {
      setUpdating(id);
      await updateOrder(id, newStatus);
      await loadOrders();
      message.success('Status atualizado com sucesso');
    } catch {
      message.error('Erro ao atualizar status');
    } finally {
      setUpdating(null);
    }
  }

  function confirmDelivery(id: string) {
    Modal.confirm({
      title: 'Confirmar entrega',
      content: 'Deseja marcar este pedido como entregue?',
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      onOk() {
        changeStatus(id);
      },
    });
  }

  function confirmPickup(id: string) {
    Modal.confirm({
      title: 'Confirmar retirada',
      content: 'Deseja marcar este pedido como retirado?',
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      onOk() {
        changeStatus(id);
      },
    });
  }

  function confirmReverse(id: string) {
    Modal.confirm({
      title: 'Confirmar reversão',
      content: 'Deseja voltar este pedido para o status anterior?',
      okText: 'Confirmar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        changeStatus(id, true);
      },
    });
  }

  async function handleMarkAsPaid(id: string) {
    try {
      setUpdating(id);
      await markAsPaid(id);
      await loadOrders();
      message.success('Marcado como pago com sucesso');
    } catch {
      message.error('Erro ao marcar como pago');
    } finally {
      setUpdating(null);
    }
  }

  const visibleData = data
    .filter(order => {
      if (!showCompleted && (order.status === 'DELIVERED' || order.status === 'PICKED_UP')) {
        return false;
      }

      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesName = order.customerName.toLowerCase().includes(searchLower);
        const matchesSeller = order.seller.toLowerCase().includes(searchLower);
        const observation = order.notes?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesSeller && !observation) {
          return false;
        }
      }

      if (filterType === 'delivery' && order.isPickup) {
        return false;
      }
      if (filterType === 'pickup' && !order.isPickup) {
        return false;
      }

      if (filterPaid === 'paid' && !order.paid) {
        return false;
      }
      if (filterPaid === 'unpaid' && order.paid) {
        return false;
      }

      if (filterStatus !== 'all' && order.status !== filterStatus) {
        return false;
      }

      return true;
    });

  const pendingOrders = data.filter(
    order => order.status === 'PENDING' || order.status === 'PENDING_PICKUP',
  );

  const deliveryOrders = data.filter(order => order.status === 'OUT_FOR_DELIVERY');

  const completedOrders = data.filter(
    order => order.status === 'DELIVERED' || order.status === 'PICKED_UP',
  );

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -8, right: 0, zIndex: 10 }}>
        <ImportOrders />
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.08) 0%, rgba(250, 173, 20, 0) 100%)',
              borderLeft: '4px solid #FAAD14',
            }}
          >
            <Statistic
              title="Pendente"
              value={pendingOrders.length}
              prefix={<InboxOutlined style={{ color: '#FAAD14' }} />}
              valueStyle={{ color: '#FAAD14', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0) 100%)',
              borderLeft: '4px solid #1890FF',
            }}
          >
            <Statistic
              title="Em entrega"
              value={deliveryOrders.length}
              prefix={<CarOutlined style={{ color: '#1890FF' }} />}
              valueStyle={{ color: '#1890FF', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(82, 196, 26, 0) 100%)',
              borderLeft: '4px solid #52C41A',
            }}
          >
            <Statistic
              title="Concluídos"
              value={completedOrders.length}
              prefix={<ShoppingOutlined style={{ color: '#52C41A' }} />}
              valueStyle={{ color: '#52C41A', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title={<Space><SearchOutlined />Filtros</Space>} style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8} lg={10}>
            <Input
              placeholder="Buscar por nome, vendedor ou observação"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={12} sm={8} md={4} lg={4}>
            <Select
              style={{ width: '100%' }}
              size="large"
              value={filterType}
              onChange={setFilterType}
              options={[
                { label: 'Todos os tipos', value: 'all' },
                { label: 'Entrega', value: 'delivery' },
                { label: 'Retirada', value: 'pickup' },
              ]}
            />
          </Col>
          <Col xs={12} sm={8} md={4} lg={4}>
            <Select
              style={{ width: '100%' }}
              size="large"
              value={filterPaid}
              onChange={setFilterPaid}
              options={[
                { label: 'Todos', value: 'all' },
                { label: 'Pagos', value: 'paid' },
                { label: 'Não pagos', value: 'unpaid' },
              ]}
            />
          </Col>
          <Col xs={12} sm={8} md={4} lg={4}>
            <Select
              style={{ width: '100%' }}
              size="large"
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { label: 'Todos os status', value: 'all' },
                { label: 'Pendente', value: 'PENDING' },
                { label: 'Saiu para entrega', value: 'OUT_FOR_DELIVERY' },
                { label: 'Entregue', value: 'DELIVERED' },
                { label: 'Pendente retirada', value: 'PENDING_PICKUP' },
                { label: 'Retirado', value: 'PICKED_UP' },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={4} lg={2}>
            <Button
              icon={<TrophyOutlined />}
              onClick={() => setShowRanking(true)}
              style={{ width: '100%' }}
            >
              Ranking
            </Button>
          </Col>
          <Col xs={12} sm={12} md={4} lg={2}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
              style={{ width: '100%' }}
            >
              Novo
            </Button>
          </Col>
          <Col xs={12} sm={12} md={4} lg={2}>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadOrders}
              loading={loading}
              style={{ width: '100%' }}
            >
              Atualizar
            </Button>
          </Col>
          <Col xs={24} sm={24} md={4} lg={2}>
            <Checkbox
              checked={showCompleted}
              onChange={e => setShowCompleted(e.target.checked)}
            >
              Concluídos
            </Checkbox>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <Table
            rowClassName={record => (!record.paid ? 'unpaid-order' : '')}
            rowKey="id"
            loading={loading}
            dataSource={visibleData}
            pagination={pagination}
            onChange={newPagination =>
              setPagination({
                current: newPagination.current ?? 1,
                pageSize: newPagination.pageSize ?? 10,
              })
            }
            scroll={{ x: 1200 }}
            columns={[
              {
                title: 'Pago',
                dataIndex: 'paid',
                width: 120,
                render: (value, row) => (
                  <Space direction="vertical" size={4}>
                    {value ? (
                      <Tag color="#52C41A">Sim</Tag>
                    ) : (
                      <Tag color="#FF4D4F">Não</Tag>
                    )}
                    {!value && (
                      <Button
                        size="small"
                        type="primary"
                        icon={<DollarOutlined />}
                        loading={updating === row.id}
                        onClick={() => handleMarkAsPaid(row.id)}
                      >
                        Pagar
                      </Button>
                    )}
                  </Space>
                ),
              },
              {
                title: 'Nome',
                width: 250,
                render: (_, row) => (
                  <div>
                    <div style={{ fontWeight: 600 }} title={row.customerName}>
                      {row.customerName}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      <UserOutlined /> {row.seller}
                    </div>
                    {row.notes && (
                      <Tag
                        color="#FAAD14"
                        style={{
                          marginTop: 8,
                          fontWeight: 500,
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        ⚠ {row.notes}
                      </Tag>
                    )}
                  </div>
                ),
              },
              {
                title: 'Contato',
                width: 120,
                dataIndex: 'contact',
                render: value => value || '-',
              },
              {
                title: 'Endereço',
                width: 250,
                ellipsis: true,
                render: (_, row) => (
                  <Space direction="vertical" size={4}>
                    <Text
                      ellipsis
                      title={row.address || '-'}
                      style={{ display: 'block' }}
                    >
                      {row.address || '-'}
                    </Text>
                    {row.address && (
                      <Button
                        size="small"
                        type="text"
                        icon={<EnvironmentOutlined />}
                        onClick={() => openGoogleMaps(row.address)}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        Ver no mapa
                      </Button>
                    )}
                  </Space>
                ),
              },
              {
                title: 'Qtd',
                width: 70,
                dataIndex: 'quantity',
                align: 'center',
              },
              {
                title: 'Tipo',
                width: 100,
                render: (_, row) => (
                  <Tag
                    color={row.isPickup ? '#FF8F5E' : '#1890FF'}
                    style={{ fontWeight: 500 }}
                  >
                    {row.isPickup ? 'Retirada' : 'Entrega'}
                  </Tag>
                ),
              },
              {
                title: 'Status',
                width: 140,
                render: (_, row) => (
                  <Tag
                    color={getStatusColor(row.status)}
                    style={{ fontWeight: 500 }}
                  >
                    {getStatusLabel(row.status)}
                  </Tag>
                ),
              },
              {
                title: 'Ações',
                width: 180,
                fixed: 'right',
                render: (_, row) => {
                  const editButton = (
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingOrder(row);
                        setShowEditModal(true);
                      }}
                    >
                      Editar
                    </Button>
                  );

                  let actionButton = null;

                  if (row.isPickup) {
                    if (row.status === 'PENDING') {
                      actionButton = (
                        <Button
                          type="primary"
                          loading={updating === row.id}
                          onClick={() => changeStatus(row.id)}
                        >
                          Pronto
                        </Button>
                      );
                    } else if (row.status === 'PENDING_PICKUP') {
                      actionButton = (
                        <Button
                          type="primary"
                          loading={updating === row.id}
                          onClick={() => confirmPickup(row.id)}
                        >
                          Retirado
                        </Button>
                      );
                    } else if (row.status === 'PICKED_UP') {
                      actionButton = (
                        <Button
                          danger
                          loading={updating === row.id}
                          onClick={() => confirmReverse(row.id)}
                        >
                          Voltar
                        </Button>
                      );
                    }
                  } else {
                    if (row.status === 'PENDING') {
                      actionButton = (
                        <Button
                          type="primary"
                          loading={updating === row.id}
                          onClick={() => changeStatus(row.id)}
                        >
                          Enviar
                        </Button>
                      );
                    } else if (row.status === 'OUT_FOR_DELIVERY') {
                      actionButton = (
                        <Button
                          type="primary"
                          loading={updating === row.id}
                          onClick={() => confirmDelivery(row.id)}
                        >
                          Entregar
                        </Button>
                      );
                    } else if (row.status === 'DELIVERED') {
                      actionButton = (
                        <Button
                          danger
                          loading={updating === row.id}
                          onClick={() => confirmReverse(row.id)}
                        >
                          Voltar
                        </Button>
                      );
                    }
                  }

                  return (
                    <Space size="small">
                      {editButton}
                      {actionButton}
                    </Space>
                  );
                },
              },
            ]}
          />
        </div>
      </Card>
      <SellerRanking open={showRanking} onClose={() => setShowRanking(false)} />
      <CreateOrderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <EditOrderModal
        open={showEditModal}
        order={editingOrder}
        onClose={() => {
          setShowEditModal(false);
          setEditingOrder(null);
        }}
      />
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    OUT_FOR_DELIVERY: 'Saiu para entrega',
    DELIVERED: 'Entregue',
    PENDING_PICKUP: 'Pendente retirada',
    PICKED_UP: 'Retirado',
  };
  return labels[status] ?? status;
}