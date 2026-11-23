import { lazy, Suspense, useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import { CatalogProvider } from './context/CatalogContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { TopBar } from './components/layout/TopBar';
import { Header } from './components/layout/Header';
import { MobileMenu } from './components/layout/MobileMenu';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/layout/WhatsAppButton';
import { Hero } from './components/sections/Hero';
import { Categories } from './components/sections/Categories';
import { PromoBanner } from './components/sections/PromoBanner';
import { TopPicks } from './components/sections/TopPicks';
import { TrustBar } from './components/sections/TrustBar';
import { ShopPage } from './pages/ShopPage';
import { SearchOverlay } from './components/overlays/SearchOverlay';
import { CartDrawer } from './components/overlays/CartDrawer';
import { ProductModal } from './components/overlays/ProductModal';
import { VideoModal } from './components/overlays/VideoModal';
import { AccountModal } from './components/overlays/AccountModal';
import { Toast } from './components/overlays/Toast';

function Store() {
  const { view, overlay, productId } = useStore();
  return (
    <>
      <TopBar />
      <Header />
      <main>
        {view.name === 'home' ? (
          <>
            <Hero />
            <Categories />
            <PromoBanner />
            <TopPicks />
          </>
        ) : (
          <ShopPage key={`${view.category}-${view.deals}`} />
        )}
        <TrustBar />
      </main>
      <Footer />

      {overlay === 'menu' && <MobileMenu />}
      {overlay === 'search' && <SearchOverlay />}
      {overlay === 'cart' && <CartDrawer />}
      {overlay === 'video' && <VideoModal />}
      {overlay === 'account' && <AccountModal />}
      {productId && <ProductModal key={productId} id={productId} />}
      <WhatsAppButton />
      <Toast />
    </>
  );
}

// O painel só é baixado quando alguém acessa /#admin.
const AdminApp = lazy(() => import('./admin/AdminApp'));

const isAdminHash = () => window.location.hash.startsWith('#admin');

export default function App() {
  const [admin, setAdmin] = useState(isAdminHash);
  useEffect(() => {
    const onHash = () => setAdmin(isAdminHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (admin) {
    return (
      <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-ink/50">Carregando painel…</div>}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <CatalogProvider>
      <CartProvider>
        <StoreProvider>
          <Store />
        </StoreProvider>
      </CartProvider>
    </CatalogProvider>
  );
}
