/**
 * Debug page that renders Shop with fixtures.
 * Dev mode only.
 * Usage: /debug/shop?tab=cosmetique
 */
import { useSearchParams } from 'react-router-dom';
import Shop from '../components/Shop.jsx';
import { shopFixtures, SHOP_FIXTURE_KEYS } from '../debug/shopFixtures.js';

export default function DebugShopPage() {
  const [params] = useSearchParams();
  const tab = params.get('tab') || SHOP_FIXTURE_KEYS[0];
  const factory = shopFixtures[tab];

  if (!factory) return <div style={{ padding: '2rem', color: '#fff' }}>Unknown tab: {tab}</div>;

  const { progress, initialTab } = factory();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg1)' }}>
      <Shop
        progress={progress}
        adminSettings={{ prodQuestionCount: 20 }}
        childName="Debug"
        onPurchase={() => {}}
        onEquip={() => {}}
        onClose={() => {}}
        initialTab={initialTab}
      />
    </div>
  );
}
