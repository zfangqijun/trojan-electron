import { Layout, notification } from 'antd';
import Drawers from './drawers'
import SystemProxySection from './sections/system-proxy';
import ProxyCardsSection from './sections/proxy-cards';
import RouteModeSection from './sections/route-mode';
import StatisticSection from './sections/statistic';

const { Content, Header } = Layout

function App() {
  return (
    <Layout>
      <div className='darg-region' style={{ height: '2rem' }} />

      <Content style={{ minHeight: 'calc(100vh - 2rem)' }}>
        <div style={{ margin: '1rem', marginTop: 0 }}>
          <StatisticSection />
        </div>

        <div style={{ margin: '1rem' }}>
          <SystemProxySection />
        </div>

        <div style={{ margin: '1rem' }}>
          <RouteModeSection />
        </div>

        <div style={{ margin: '1rem' }}>
          <ProxyCardsSection />
        </div>
        <Drawers />
      </Content>
    </Layout >
  )
}

export default App
