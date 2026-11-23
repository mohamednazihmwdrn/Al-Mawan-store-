import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Storefront } from './components/Storefront';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ColorStudioBrand, GlcColorStudioPage } from './components/GlcColorStudioPage';
import { ColorStudioModal } from './components/ColorStudioModal';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { trackAnalyticsEvent } from './lib/analytics';
import { Product, StorefrontPage } from './types/store';

const PAGE_LABELS: Record<StorefrontPage, string> = {
  home: 'الرئيسية والمنتجات',
  categories: 'الأقسام والبحث',
  glc_colors:
    'كمبيوتر الألوان والديكور (GLC · جوتن · سايبس · سكيب · CMB · جرافيـاتو · فيوتك · PS)',
  brands: 'العلامات التجارية',
  about: 'عن المتجر',
  contact: 'تواصل معنا',
};

interface NavSnapshot {
  viewMode: 'storefront' | 'dashboard';
  activePage: StorefrontPage;
  selectedCategoryId: string;
  selectedSubpageId: string;
  offersOnly: boolean;
  selectedBrandCode: string;
  colorStudioBrand: ColorStudioBrand;
  selectedProductId: string | null;
  cartOpen: boolean;
  colorStudioOpen: boolean;
  authModalOpen: boolean;
}

const DEFAULT_NAV_SNAPSHOT: NavSnapshot = {
  viewMode: 'storefront',
  activePage: 'home',
  selectedCategoryId: 'all',
  selectedSubpageId: 'all',
  offersOnly: false,
  selectedBrandCode: '',
  colorStudioBrand: 'glc',
  selectedProductId: null,
  cartOpen: false,
  colorStudioOpen: false,
  authModalOpen: false,
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

function areSnapshotsEqual(a: NavSnapshot, b: NavSnapshot): boolean {
  return (
    a.viewMode === b.viewMode &&
    a.activePage === b.activePage &&
    a.selectedCategoryId === b.selectedCategoryId &&
    a.selectedSubpageId === b.selectedSubpageId &&
    a.offersOnly === b.offersOnly &&
    a.selectedBrandCode === b.selectedBrandCode &&
    a.colorStudioBrand === b.colorStudioBrand &&
    a.selectedProductId === b.selectedProductId &&
    a.cartOpen === b.cartOpen &&
    a.colorStudioOpen === b.colorStudioOpen &&
    a.authModalOpen === b.authModalOpen
  );
}

function isNavSnapshot(val: unknown): val is NavSnapshot {
  if (!val || typeof val !== 'object') return false;
  const candidate = val as Partial<NavSnapshot>;
  return (
    (candidate.viewMode === 'storefront' || candidate.viewMode === 'dashboard') &&
    typeof candidate.activePage === 'string' &&
    typeof candidate.selectedCategoryId === 'string'
  );
}

function buildUrlForSnapshot(snap: NavSnapshot): string {
  const baseUrl = window.location.pathname + window.location.search;
  if (snap.selectedProductId) {
    return `${baseUrl}#product=${encodeURIComponent(snap.selectedProductId)}`;
  }
  return baseUrl;
}

function AppShell() {
  const { products } = useStore();
  const [ownerUnlocked, setOwnerUnlocked] = useState(false);

  const initialSnap = useMemo<NavSnapshot>(() => {
    const hashProductId = readProductIdFromHash();
    return {
      ...DEFAULT_NAV_SNAPSHOT,
      selectedProductId: hashProductId,
    };
  }, []);

  const [nav, setNav] = useState<NavSnapshot>(initialSnap);
  const navRef = useRef<NavSnapshot>(initialSnap);
  const depthRef = useRef<number>(initialSnap.selectedProductId ? 1 : 0);

  const commitNavigation = useCallback(
    (
      updater: (prev: NavSnapshot) => NavSnapshot,
      options?: { replace?: boolean; scrollTop?: boolean }
    ) => {
      const current = navRef.current;
      const next = updater(current);
      if (areSnapshotsEqual(current, next)) return;

      navRef.current = next;
      setNav(next);

      try {
        const nextUrl = buildUrlForSnapshot(next);
        if (options?.replace) {
          window.history.replaceState(
            { mowanNav: next, depth: depthRef.current },
            '',
            nextUrl
          );
        } else {
          depthRef.current += 1;
          window.history.pushState(
            { mowanNav: next, depth: depthRef.current },
            '',
            nextUrl
          );
        }
      } catch {
        // Ignore history restrictions in embedded frames
      }

      if (options?.scrollTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  // Initialize deterministic history base so Phone Hardware Back stays inside the app
  useEffect(() => {
    try {
      const existingState = window.history.state as
        | { mowanNav?: unknown; depth?: number }
        | null;

      if (existingState && isNavSnapshot(existingState.mowanNav)) {
        navRef.current = existingState.mowanNav;
        setNav(existingState.mowanNav);
        depthRef.current =
          typeof existingState.depth === 'number' ? existingState.depth : 0;
        return;
      }

      const initialProductId = readProductIdFromHash();
      const baseUrl = window.location.pathname + window.location.search;
      if (initialProductId) {
        const homeBase: NavSnapshot = { ...DEFAULT_NAV_SNAPSHOT, selectedProductId: null };
        const prodSnap: NavSnapshot = {
          ...DEFAULT_NAV_SNAPSHOT,
          selectedProductId: initialProductId,
        };
        window.history.replaceState({ mowanNav: homeBase, depth: 0 }, '', baseUrl);
        window.history.pushState(
          { mowanNav: prodSnap, depth: 1 },
          '',
          `${baseUrl}#product=${encodeURIComponent(initialProductId)}`
        );
        depthRef.current = 1;
        navRef.current = prodSnap;
        setNav(prodSnap);
      } else {
        window.history.replaceState(
          { mowanNav: navRef.current, depth: 0 },
          '',
          window.location.href
        );
        depthRef.current = 0;
      }
    } catch {
      // Ignore history restrictions
    }
  }, []);

  // Listen to Mobile Hardware Back Button & Browser Forward/Back
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const state = event.state as { mowanNav?: unknown; depth?: number } | null;
      if (state && isNavSnapshot(state.mowanNav)) {
        navRef.current = state.mowanNav;
        setNav(state.mowanNav);
        depthRef.current = typeof state.depth === 'number' ? state.depth : 0;
        return;
      }

      const hashProductId = readProductIdFromHash();
      const fallbackSnap: NavSnapshot = {
        ...navRef.current,
        selectedProductId: hashProductId,
        cartOpen: false,
        colorStudioOpen: false,
        authModalOpen: false,
      };
      navRef.current = fallbackSnap;
      setNav(fallbackSnap);
      depthRef.current = 0;
    };

    const onHashChange = () => {
      const hashProductId = readProductIdFromHash();
      if (hashProductId !== navRef.current.selectedProductId) {
        const nextSnap: NavSnapshot = {
          ...navRef.current,
          selectedProductId: hashProductId,
        };
        navRef.current = nextSnap;
        setNav(nextSnap);
      }
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const selectedProduct = useMemo(
    () =>
      nav.selectedProductId
        ? products.find((p) => p.id === nav.selectedProductId) ?? null
        : null,
    [products, nav.selectedProductId]
  );

  const isDashboardView = ownerUnlocked && nav.viewMode === 'dashboard';

  useEffect(() => {
    if (isDashboardView) return;
    trackAnalyticsEvent({
      eventType: 'store_visit',
      targetId: 'store',
      targetLabel: 'زيارة المتجر',
    });
  }, [isDashboardView]);

  useEffect(() => {
    if (isDashboardView || nav.selectedProductId) return;
    trackAnalyticsEvent({
      eventType: 'page_view',
      targetId: nav.activePage,
      targetLabel: PAGE_LABELS[nav.activePage],
    });
  }, [nav.activePage, isDashboardView, nav.selectedProductId]);

  const handleBack = useCallback(() => {
    if (depthRef.current > 0) {
      try {
        window.history.back();
        return;
      } catch {
        // Fallback below if embedded environment blocks history.back
      }
    }

    commitNavigation(
      (prev) => {
        if (prev.cartOpen) return { ...prev, cartOpen: false };
        if (prev.colorStudioOpen) return { ...prev, colorStudioOpen: false };
        if (prev.authModalOpen) return { ...prev, authModalOpen: false };
        if (prev.selectedProductId) return { ...prev, selectedProductId: null };
        if (prev.activePage === 'categories' && prev.selectedSubpageId !== 'all') {
          return { ...prev, selectedSubpageId: 'all' };
        }
        if (
          prev.activePage === 'categories' &&
          (prev.selectedCategoryId !== 'all' || prev.offersOnly)
        ) {
          return { ...prev, selectedCategoryId: 'all', offersOnly: false };
        }
        if (prev.activePage === 'brands' && prev.selectedBrandCode) {
          return { ...prev, selectedBrandCode: '' };
        }
        if (prev.activePage !== 'home') {
          return { ...prev, activePage: 'home' };
        }
        return prev;
      },
      { replace: true }
    );
  }, [commitNavigation]);

  const handleTriggerOwnerAuth = useCallback(() => {
    if (ownerUnlocked) {
      commitNavigation((prev) => ({
        ...prev,
        viewMode: 'dashboard',
        cartOpen: false,
        colorStudioOpen: false,
      }));
    } else {
      commitNavigation((prev) => ({ ...prev, authModalOpen: true }));
    }
  }, [ownerUnlocked, commitNavigation]);

  const handleOpenColorStudio = useCallback(() => {
    commitNavigation((prev) => ({
      ...prev,
      colorStudioOpen: true,
      cartOpen: false,
    }));
    if (!isDashboardView) {
      trackAnalyticsEvent({
        eventType: 'page_view',
        targetId: 'color_studio',
        targetLabel: 'كمبيوتر الألوان',
      });
    }
  }, [commitNavigation, isDashboardView]);

  const handleOpenProduct = useCallback(
    (product: Product) => {
      commitNavigation(
        (prev) => ({
          ...prev,
          selectedProductId: product.id,
          cartOpen: false,
          colorStudioOpen: false,
        }),
        { scrollTop: true }
      );

      if (!isDashboardView) {
        trackAnalyticsEvent({
          eventType: 'product_view',
          targetId: product.id,
          targetLabel: product.name,
        });
      }
    },
    [commitNavigation, isDashboardView]
  );

  const handleSelectPage = useCallback(
    (page: StorefrontPage) => {
      commitNavigation(
        (prev) => ({
          ...prev,
          selectedProductId: null,
          activePage: page,
          cartOpen: false,
          colorStudioOpen: false,
        }),
        { scrollTop: true }
      );
    },
    [commitNavigation]
  );

  const handleGoHome = useCallback(() => {
    commitNavigation(
      (prev) => ({
        ...prev,
        selectedProductId: null,
        activePage: 'home',
        selectedCategoryId: 'all',
        selectedSubpageId: 'all',
        offersOnly: false,
        selectedBrandCode: '',
        cartOpen: false,
        colorStudioOpen: false,
      }),
      { scrollTop: true }
    );
  }, [commitNavigation]);

  const handleOpenGlcColors = useCallback(
    (brand: ColorStudioBrand = 'glc') => {
      const replaceModalLayer = navRef.current.colorStudioOpen;
      commitNavigation(
        (prev) => ({
          ...prev,
          selectedProductId: null,
          colorStudioOpen: false,
          cartOpen: false,
          colorStudioBrand: brand,
          activePage: 'glc_colors',
        }),
        { replace: replaceModalLayer, scrollTop: true }
      );
    },
    [commitNavigation]
  );

  const handleChangeColorStudioBrand = useCallback(
    (brand: ColorStudioBrand) => {
      commitNavigation((prev) => ({
        ...prev,
        colorStudioBrand: brand,
      }));
    },
    [commitNavigation]
  );

  const handleOpenCategoryFromProduct = useCallback(
    (categoryId: string, subpageId?: string) => {
      commitNavigation(
        (prev) => ({
          ...prev,
          selectedProductId: null,
          activePage: 'categories',
          selectedCategoryId: categoryId || 'all',
          selectedSubpageId: subpageId || 'all',
          offersOnly: false,
          cartOpen: false,
          colorStudioOpen: false,
        }),
        { scrollTop: true }
      );
    },
    [commitNavigation]
  );

  const handleSelectCategoryFilter = useCallback(
    (categoryId: string, subpageId = 'all', navigateToCategories = false) => {
      commitNavigation(
        (prev) => ({
          ...prev,
          selectedProductId: null,
          activePage: navigateToCategories ? 'categories' : prev.activePage,
          selectedCategoryId: categoryId || 'all',
          selectedSubpageId: subpageId || 'all',
          offersOnly: false,
        }),
        { scrollTop: navigateToCategories }
      );
    },
    [commitNavigation]
  );

  const handleToggleOffersOnly = useCallback(() => {
    commitNavigation((prev) => ({
      ...prev,
      offersOnly: !prev.offersOnly,
    }));
  }, [commitNavigation]);

  const handleResetFilters = useCallback(() => {
    commitNavigation((prev) => ({
      ...prev,
      selectedCategoryId: 'all',
      selectedSubpageId: 'all',
      offersOnly: false,
    }));
  }, [commitNavigation]);

  const handleSelectBrandCode = useCallback(
    (brandCode: string) => {
      commitNavigation((prev) => ({
        ...prev,
        selectedBrandCode: brandCode,
      }));
    },
    [commitNavigation]
  );

  const handleOpenCart = useCallback(() => {
    commitNavigation((prev) => ({ ...prev, cartOpen: true }));
  }, [commitNavigation]);

  const handleCloseCart = useCallback(() => {
    if (navRef.current.cartOpen) {
      handleBack();
    }
  }, [handleBack]);

  const handleCloseColorStudioModal = useCallback(() => {
    if (navRef.current.colorStudioOpen) {
      handleBack();
    }
  }, [handleBack]);

  const handleCloseAuthModal = useCallback(() => {
    if (navRef.current.authModalOpen) {
      handleBack();
    }
  }, [handleBack]);

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
            className="w-full max-w-full overflow-x-clip"
          >
            <OwnerDashboard
              onPreviewCustomer={() =>
                commitNavigation((prev) => ({ ...prev, viewMode: 'storefront' }))
              }
              onLockAndExit={() => {
                setOwnerUnlocked(false);
                commitNavigation(
                  (prev) => ({ ...prev, viewMode: 'storefront' }),
                  { replace: true }
                );
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
            className="w-full max-w-full overflow-x-clip"
          >
            <Header
              activePage={nav.activePage}
              onSelectPage={handleSelectPage}
              onOpenCart={handleOpenCart}
              onOpenColorStudio={handleOpenColorStudio}
              onTriggerOwnerAuth={handleTriggerOwnerAuth}
            />

            {ownerUnlocked && nav.viewMode === 'storefront' && (
              <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-3">
                <span>أنت تشاهد المتجر حالياً بوضع معاينة العميل</span>
                <button
                  type="button"
                  onClick={() =>
                    commitNavigation((prev) => ({ ...prev, viewMode: 'dashboard' }))
                  }
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
                onBack={handleBack}
                onGoHome={handleGoHome}
                onOpenProduct={handleOpenProduct}
                onOpenCategory={handleOpenCategoryFromProduct}
              />
            ) : nav.activePage === 'glc_colors' ? (
              <GlcColorStudioPage
                activeBrand={nav.colorStudioBrand}
                onChangeBrand={handleChangeColorStudioBrand}
                onBackHome={handleBack}
                onBrowseGlcProducts={() => handleOpenCategoryFromProduct('cat_glc')}
                onBrowseJotunProducts={() => handleOpenCategoryFromProduct('cat_jotun')}
                onBrowseSipesProducts={() => handleOpenCategoryFromProduct('cat_sipes')}
                onBrowseSavetoProducts={() => handleOpenCategoryFromProduct('cat_saveto')}
                onBrowseScibProducts={() => handleOpenCategoryFromProduct('cat_scib')}
                onBrowseCmbProducts={() => handleOpenCategoryFromProduct('cat_cmb')}
                onOpenProduct={handleOpenProduct}
              />
            ) : (
              <Storefront
                activePage={nav.activePage}
                selectedCategoryId={nav.selectedCategoryId}
                selectedSubpageId={nav.selectedSubpageId}
                offersOnly={nav.offersOnly}
                selectedBrandCode={nav.selectedBrandCode}
                onSelectPage={handleSelectPage}
                onBack={handleBack}
                onOpenProduct={handleOpenProduct}
                onOpenColorStudio={handleOpenColorStudio}
                onOpenGlcColors={handleOpenGlcColors}
                onOpenCart={handleOpenCart}
                onSelectCategoryFilter={handleSelectCategoryFilter}
                onToggleOffersOnly={handleToggleOffersOnly}
                onResetFilters={handleResetFilters}
                onSelectBrandCode={handleSelectBrandCode}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={nav.cartOpen} onClose={handleCloseCart} />

      <ColorStudioModal
        isOpen={nav.colorStudioOpen}
        onClose={handleCloseColorStudioModal}
        onOpenGlcColors={handleOpenGlcColors}
      />

      <OwnerAuthModal
        isOpen={nav.authModalOpen}
        onClose={handleCloseAuthModal}
        onSuccess={() => {
          setOwnerUnlocked(true);
          commitNavigation(
            (prev) => ({
              ...prev,
              authModalOpen: false,
              viewMode: 'dashboard',
            }),
            { replace: true }
          );
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
