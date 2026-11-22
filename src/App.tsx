import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Storefront } from './components/Storefront';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ColorStudioModal } from './components/ColorStudioModal';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { trackAnalyticsEvent } from './lib/analytics';
import { Product, StorefrontPage } from './types/store';

const PAGE_LABELS: Record<StorefrontPage, string> = {
  home: 'الرئيسية والمنتجات',
  categories: 'الأقسام والبحث',
  brands: 'العلامات التجارية',
  about: 'عن المتجر',
  contact: 'تواصل معنا',
};

function readProductIdFromHash(): string | null {
  try {
    const hash = window.location.hash || '';
    if (hash.startsWith('#product=')) {
      const id = decodeURIComponent(hash.slice('#product='.length)).trim();
      return id || null;
    }
  } catch {
    // Ignore malformed hash
  }
  return null;
}

function AppShell() {
  const { products } = useStore();
  const [ownerUnlocked, setOwnerUnlocked] = useState(false);
  const [viewMode, setViewMode] = useState<'storefront' | 'dashboard'>('storefront');
  const [activePage, setActivePage] = useState<StorefrontPage>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [colorStudioOpen, setColorStudioOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() =>
    readProductIdFromHash()
  );
  const [categoryJump, setCategoryJump] = useState<{
    categoryId: string;
    subpageId?: string;
    nonce: number;
  } | null>(null);

  const selectedProduct = useMemo(
    () => (selectedProductId ? products.find((p) => p.id === selectedProductId) ?? null : null),
    [products, selectedProductId]
  );

  const handleTriggerOwnerAuth = () => {
    if (ownerUnlocked) {
      setViewMode('dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  const isDashboardView = ownerUnlocked && viewMode === 'dashboard';

  useEffect(() => {
    if (isDashboardView) return;
    trackAnalyticsEvent({
      eventType: 'store_visit',
      targetId: 'store',
      targetLabel: 'زيارة المتجر',
    });
  }, [isDashboardView]);

  useEffect(() => {
    if (isDashboardView || selectedProductId) return;
    trackAnalyticsEvent({
      eventType: 'page_view',
      targetId: activePage,
      targetLabel: PAGE_LABELS[activePage],
    });
  }, [activePage, isDashboardView, selectedProductId]);

  useEffect(() => {
    const onHashOrPop = () => {
      setSelectedProductId(readProductIdFromHash());
    };
    window.addEventListener('popstate', onHashOrPop);
    window.addEventListener('hashchange', onHashOrPop);
    return () => {
      window.removeEventListener('popstate', onHashOrPop);
      window.removeEventListener('hashchange', onHashOrPop);
    };
  }, []);

  const handleOpenColorStudio = () => {
    setColorStudioOpen(true);
    if (!isDashboardView) {
      trackAnalyticsEvent({
        eventType: 'page_view',
        targetId: 'color_studio',
        targetLabel: 'كمبيوتر الألوان',
      });
    }
  };

  const handleOpenProduct = useCallback(
    (product: Product) => {
      setSelectedProductId(product.id);
      try {
        const nextHash = `#product=${encodeURIComponent(product.id)}`;
        if (window.location.hash !== nextHash) {
          window.history.pushState({ productId: product.id }, '', nextHash);
        }
      } catch {
        // Ignore history restrictions in embedded frames
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (!isDashboardView) {
        trackAnalyticsEvent({
          eventType: 'product_view',
          targetId: product.id,
          targetLabel: product.name,
        });
      }
    },
    [isDashboardView]
  );

  const handleCloseProductPage = useCallback(() => {
    setSelectedProductId(null);
    try {
      if (window.location.hash.startsWith('#product=')) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    } catch {
      // Ignore history restrictions
    }
  }, []);

  const handleSelectPage = useCallback(
    (page: StorefrontPage) => {
      handleCloseProductPage();
      setActivePage(page);
    },
    [handleCloseProductPage]
  );

  const handleOpenCategoryFromProduct = useCallback(
    (categoryId: string, subpageId?: string) => {
      handleCloseProductPage();
      setCategoryJump({ categoryId, subpageId, nonce: Date.now() });
      setActivePage('categories');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [handleCloseProductPage]
  );

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
              onSelectPage={handleSelectPage}
              onOpenCart={() => setCartOpen(true)}
              onOpenColorStudio={handleOpenColorStudio}
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

            {selectedProduct ? (
              <ProductDetailPage
                product={selectedProduct}
                onBack={handleCloseProductPage}
                onOpenProduct={handleOpenProduct}
                onOpenCategory={handleOpenCategoryFromProduct}
              />
            ) : (
              <Storefront
                activePage={activePage}
                onSelectPage={handleSelectPage}
                onOpenProduct={handleOpenProduct}
                onOpenColorStudio={handleOpenColorStudio}
                onOpenCart={() => setCartOpen(true)}
                categoryJump={categoryJump}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

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
