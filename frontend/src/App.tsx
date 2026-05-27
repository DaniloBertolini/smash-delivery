import { ConfigProvider, Layout, Tabs, theme } from 'antd';
import { HomeOutlined, CarOutlined } from '@ant-design/icons';
import { Motorboy } from './pages/Motorboy';
import { Orders } from './pages/Orders';

const { Header, Content } = Layout;

const smashTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#FF6B35',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#1890FF',
    borderRadius: 12,
    fontSize: 14,
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Layout: {
      headerBg: '#FF6B35',
      headerHeight: 64,
      bodyBg: '#F8F9FA',
    },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(255, 107, 53, 0.08)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#FF6B35',
      headerColor: '#fff',
      borderColor: '#f0f0f0',
    },
    Tag: {
      borderRadius: 6,
    },
    Tabs: {
      inkBarColor: '#FF6B35',
      itemActiveColor: '#FF6B35',
      itemSelectedColor: '#FF6B35',
    },
  },
};

function App() {
  return (
    <ConfigProvider theme={smashTheme}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%)',
            color: '#fff',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: -0.5,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.2)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontSize: 28,
              background: '#fff',
              color: '#FF6B35',
              width: 40,
              height: 40,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}>
              S
            </span>
            Smash Delivery
          </span>
        </Header>

        <Content style={{ padding: { xs: 16, sm: 20, md: 24 } }}>
          <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            <Tabs
              style={{ marginTop: 16 }}
              items={[
                {
                  key: 'orders',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HomeOutlined />
                      Pedidos
                    </span>
                  ),
                  children: <Orders />,
                },
                {
                  key: 'delivery',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CarOutlined />
                      Entregas
                    </span>
                  ),
                  children: <Motorboy />,
                },
              ]}
            />
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;