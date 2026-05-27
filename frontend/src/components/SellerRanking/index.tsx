import { Button, Card, Col, Modal, Row, Space, Statistic, Typography } from 'antd';

import { TrophyOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { getSellerRanking } from '../../services/orders';

const { Title } = Typography;

interface SellerRankingProps {
  open: boolean;
  onClose: () => void;
}

interface RankingItem {
  seller: string;
  totalSales: number;
}

export function SellerRanking({ open, onClose }: SellerRankingProps) {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadRanking();
    }
  }, [open]);

  async function loadRanking() {
    setLoading(true);
    try {
      const data = await getSellerRanking();
      setRanking(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined />
          Ranking de Vendedores
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Fechar
        </Button>,
      ]}
      width={500}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          Carregando...
        </div>
      ) : (
        <Space style={{ width: '100%' }} direction="vertical" size={16}>
          {ranking.map((seller, index) => (
            <Card
              key={seller.seller}
              style={{
                borderLeft:
                  index === 0 ? '4px solid #FFD700' : undefined,
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    {index === 0 && (
                      <TrophyOutlined style={{ color: '#FFD700', fontSize: 20 }} />
                    )}
                    {index === 1 && (
                      <TrophyOutlined style={{ color: '#C0C0C0', fontSize: 20 }} />
                    )}
                    {index === 2 && (
                      <TrophyOutlined style={{ color: '#CD7F32', fontSize: 20 }} />
                    )}
                    <Title level={5} style={{ margin: 0 }}>
                      {seller.seller}
                    </Title>
                  </Space>
                </Col>
                <Col>
                  <Statistic
                    title="Vendas Totais"
                    value={seller.totalSales}
                    suffix="pedidos"
                    valueStyle={{ fontSize: 20 }}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      )}
    </Modal>
  );
}