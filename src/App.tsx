import React, { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { Storefront } from './components/Storefront';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ColorStudioModal } from './components/ColorStudioModal';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Product, StorefrontPage } from './types/store';

function AppShell() {
  const [ownerUnlocked, setOwnerUnlocked] = useState(false);
  const [viewMode, setViewMode] = useState<'storefront' | 'dashboard'>('storefront');
  const [activePage, setActivePage] = useState<StorefrontPage>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [colorStudioOpen, setColorStudioOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleTriggerOwnerAuth = () => {
    if (ownerUnlocked) {
      setViewMode('dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  const isDashboardView = ownerUnlocked && viewMode === 'dashboard';

  return (
    <>
      <AnimatePresence mode="wait">
        {isDashboardView ? (
          <motion.div
            key="owner-dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24 }}
          >
            <OwnerDashboard
              onPreviewCustomer={() => setViewMode('storefront')}
              onLockAndExit={() => {
                setOwnerUnlocked(false);
                setViewMode('storefront');
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="customer-storefront"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <Header
              activePage={activePage}
              onSelectPage={setActivePage}
              onOpenCart={() => setCartOpen(true)}
              onOpenColorStudio={() => setColorStudioOpen(true)}
              onTriggerOwnerAuth={handleTriggerOwnerAuth}
            />

            {ownerUnlocked && viewMode === 'storefront' && (
              <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-3">
                <span>أنت تشاهد المتجر حالياً بوضع معاينة العميل</span>
                <button
                  type="button"
                  onClick={() => setViewMode('dashboard')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3 py-1 text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>العودة للوحة المالك</span>
                </button>
              </div>
            )}

            <Storefront
              activePage={activePage}
              onSelectPage={setActivePage}
              onOpenProduct={(product) => setSelectedProduct(product)}
              onOpenColorStudio={() => setColorStudioOpen(true)}
              onOpenCart={() => setCartOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <ColorStudioModal
        isOpen={colorStudioOpen}
        onClose={() => setColorStudioOpen(false)}
      />

      <OwnerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          setOwnerUnlocked(true);
          setViewMode('dashboard');
        }}
      />

      <OfflineIndicator />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </MotionConfig>
  );
}
