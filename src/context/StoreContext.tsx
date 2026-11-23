import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import {
  ADMIN_EMAILS,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';
import {
  DbRow,
  mapAnalyticsFromDb,
  mapBannerFromDb,
  mapBannerToDb,
  mapCatalogFromDb,
  mapCatalogToDb,
  mapCategoryFromDb,
  mapCategoryToDb,
  mapConfigFromDb,
  mapConfigToDb,
  mapInquiryFromDb,
  mapOrderFromDb,
  mapProductFromDb,
  mapProductToDb,
  mapSubpageFromDb,
  mapSubpageToDb,
} from '../lib/supabaseMappers';
import {
  ANALYTICS_STORAGE_KEY,
  ANALYTICS_UPDATED_EVENT,
  clearLocalAnalyticsEvents,
  loadLocalAnalyticsEvents,
  trackAnalyticsEvent,
} from '../lib/analytics';
import {
  DEFAULT_BANNERS,
  DEFAULT_CATALOGS,
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_CONFIG,
  DEFAULT_SUBPAGES,
  DEMO_BANNER_IDS,
  DEMO_CATALOG_IDS,
  DEMO_PRODUCT_IDS,
} from '../data/defaults';
import {
  MULTI_BRAND_CATEGORIES,
  MULTI_BRAND_PRODUCTS,
  MULTI_BRAND_PRODUCT_IDS,
  MULTI_BRAND_SUBPAGES,
} from '../data/brandCatalogs';
import {
  GLC_32_PRODUCTS,
  GLC_32_PRODUCT_IDS,
  GLC_ALL_PRODUCTS,
  GLC_ALL_PRODUCT_IDS,
  GLC_BATCH2_PRODUCTS,
  GLC_BATCH2_PRODUCT_IDS,
  GLC_SUBPAGES,
} from '../data/glcCatalog';
import { sanitizeId } from '../lib/imageUtils';
import {
  AnalyticsEvent,
  Banner,
  CartItem,
  Category,
  ColorCatalog,
  Inquiry,
  InquiryStatus,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  StoreConfig,
  Subpage,
} from '../types/store';

interface StoreContextValue {
  config: StoreConfig;
  banners: Banner[];
  categories: Category[];
  subpages: Subpage[];
  products: Product[];
  catalogs: ColorCatalog[];
  orders: Order[];
  inquiries: Inquiry[];
  analyticsEvents: AnalyticsEvent[];
  cart: CartItem[];
  isLoading: boolean;
  isLiveSynced: boolean;
  isCloudConfigured: boolean;
  authReady: boolean;
  ownerUser: User | null;
  isVerifiedAdmin: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  signInOwnerGoogle: () => Promise<void>;
  signInOwnerPassword: (email: string, password: string) => Promise<void>;
  signInOwnerMagicLink: (email: string) => Promise<void>;
  signUpOwnerPassword: (email: string, password: string) => Promise<boolean>;
  sendOwnerPasswordReset: (email: string) => Promise<void>;
  signOutOwnerGoogle: () => Promise<void>;
  saveConfig: (nextConfig: StoreConfig) => Promise<void>;
  restoreDefaultConfigAndCatalog: () => Promise<void>;
  seedMissingCatalog: () => Promise<void>;
  importGlcCatalogProducts: () => Promise<number>;
  upsertBanner: (banner: Omit<Banner, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  deleteAllBanners: () => Promise<void>;
  upsertCategory: (cat: Omit<Category, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  upsertSubpage: (sub: Omit<Subpage, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteSubpage: (id: string) => Promise<void>;
  upsertProduct: (prod: Omit<Product, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteAllProducts: () => Promise<void>;
  cleanAllProductsAndBanners: () => Promise<void>;
  upsertCatalog: (cat: Omit<ColorCatalog, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteCatalog: (id: string) => Promise<void>;
  submitOrder: (payload: {
    customerName: string;
    phone: string;
    address: string;
    notes: string;
    paymentMethod: PaymentMethod;
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
  }) => Promise<string>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  submitInquiry: (payload: {
    customerName: string;
    phone: string;
    subject: string;
    message: string;
    colorCode?: string;
  }) => Promise<void>;
  updateInquiryStatus: (id: string, status: InquiryStatus) => Promise<void>;
  clearAnalytics: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = 'mowan_cart_v1';
const LOCAL_PREVIEW_STORAGE_KEY = 'mowan_local_store_v1';
const LOCAL_DEMO_PURGE_FLAG = 'mowan_demo_purged_v2';
const CLOUD_DEMO_PURGE_FLAG = 'mowan_cloud_demo_purged_v2';
const LOCAL_GLC32_SEED_FLAG = 'mowan_glc32_local_seeded_v1';
const CLOUD_GLC32_SEED_FLAG = 'mowan_glc32_cloud_seeded_v1';
const LOCAL_GLC_BATCH2_SEED_FLAG = 'mowan_glc_batch2_local_seeded_v1';
const CLOUD_GLC_BATCH2_SEED_FLAG = 'mowan_glc_batch2_cloud_seeded_v1';
const LOCAL_GLC_PLATINE_CATALOG_FLAG = 'mowan_glc_platine_catalog_v1';
const CLOUD_GLC_PLATINE_CATALOG_FLAG = 'mowan_glc_platine_catalog_v1';
const LOCAL_GLC32_DETAILS_V2_FLAG = 'mowan_glc32_details_v2';
const CLOUD_GLC32_DETAILS_V2_FLAG = 'mowan_glc32_details_v2';
const LOCAL_MULTI_BRAND_SEED_V1_FLAG = 'mowan_multi_brand_local_v1';
const CLOUD_MULTI_BRAND_SEED_V1_FLAG = 'mowan_multi_brand_cloud_v1';

const CLOUD_AUTH_REQUIRED_MSG =
  'لم يتم الحفظ في السحابة: يرجى تسجيل الدخول بحساب المالك عبر "تسجيل دخول السحابة" أعلى اللوحة لإتمام التعديل والحذف النهائي.';

function normalizeSupabaseError(errMsg: string): Error {
  const lower = errMsg.toLowerCase();
  if (
    lower.includes('row-level security') ||
    lower.includes('permission denied') ||
    lower.includes('42501') ||
    lower.includes('not allowed')
  ) {
    return new Error(CLOUD_AUTH_REQUIRED_MSG);
  }
  return new Error(errMsg);
}

interface LocalSnapshotState {
  initialized: boolean;
  config: StoreConfig;
  banners: Banner[];
  categories: Category[];
  subpages: Subpage[];
  products: Product[];
  catalogs: ColorCatalog[];
  orders: Order[];
  inquiries: Inquiry[];
}

function mergeGlcSubpagesList(existing: Subpage[]): Subpage[] {
  const existingIds = new Set(existing.map((s) => s.id));
  const missing = GLC_SUBPAGES.filter((s) => !existingIds.has(s.id));
  return missing.length > 0 ? [...existing, ...missing] : existing;
}

function mergeGlcProductsList(existing: Product[]): Product[] {
  const existingIds = new Set(existing.map((p) => p.id));
  const missing = GLC_32_PRODUCTS.filter((p) => !existingIds.has(p.id));
  return missing.length > 0 ? [...existing, ...missing] : existing;
}

function mergeGlcBatch2ProductsList(existing: Product[]): Product[] {
  const existingIds = new Set(existing.map((p) => p.id));
  const missing = GLC_BATCH2_PRODUCTS.filter((p) => !existingIds.has(p.id));
  return missing.length > 0 ? [...existing, ...missing] : existing;
}

const GLC_32_MAP = new Map(GLC_ALL_PRODUCTS.map((p) => [p.id, p]));

function upgradeGlcDetailsInList(existing: Product[]): { list: Product[]; changed: boolean } {
  let changed = false;
  const next = existing.map((p) => {
    const rich = GLC_32_MAP.get(p.id);
    if (!rich) return p;
    if (p.description && p.description.includes('المواصفات الفنية والتشغيل:')) {
      return p;
    }
    changed = true;
    return {
      ...p,
      description: rich.description,
      specs: rich.specs,
      sizes: rich.sizes,
      unit: rich.unit,
      badge: rich.badge,
      subpageId: rich.subpageId,
    };
  });
  return { list: changed ? next : existing, changed };
}

const BUILTIN_SORT_ORDER_MAP = new Map(
  DEFAULT_CATEGORIES.map((c) => [c.id, c.sortOrder])
);

function mergeMultiBrandCatalog(
  existingCategories: Category[],
  existingSubpages: Subpage[],
  existingProducts: Product[]
): {
  categories: Category[];
  subpages: Subpage[];
  products: Product[];
} {
  const catIds = new Set(existingCategories.map((c) => c.id));
  const missingCats = MULTI_BRAND_CATEGORIES.filter((c) => !catIds.has(c.id));
  const alignedCategories = [...existingCategories, ...missingCats]
    .map((cat) => {
      const targetOrder = BUILTIN_SORT_ORDER_MAP.get(cat.id);
      return targetOrder !== undefined ? { ...cat, sortOrder: targetOrder } : cat;
    })
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  const subIds = new Set(existingSubpages.map((s) => s.id));
  const missingSubs = MULTI_BRAND_SUBPAGES.filter((s) => !subIds.has(s.id));
  const mergedSubpages =
    missingSubs.length > 0 ? [...existingSubpages, ...missingSubs] : existingSubpages;

  const prodIds = new Set(existingProducts.map((p) => p.id));
  const missingProds = MULTI_BRAND_PRODUCTS.filter((p) => !prodIds.has(p.id));
  const mergedProducts =
    missingProds.length > 0 ? [...existingProducts, ...missingProds] : existingProducts;

  return {
    categories: alignedCategories,
    subpages: mergedSubpages,
    products: mergedProducts,
  };
}

function readLocalSnapshot(): LocalSnapshotState {
  const shouldPurgeDemo = (() => {
    try {
      return localStorage.getItem(LOCAL_DEMO_PURGE_FLAG) !== '1';
    } catch {
      return false;
    }
  })();

  const shouldSeedGlc32 = (() => {
    try {
      return localStorage.getItem(LOCAL_GLC32_SEED_FLAG) !== '1';
    } catch {
      return false;
    }
  })();

  const shouldSeedGlcBatch2 = (() => {
    try {
      return localStorage.getItem(LOCAL_GLC_BATCH2_SEED_FLAG) !== '1';
    } catch {
      return false;
    }
  })();

  const shouldSeedGlcPlatineCatalog = (() => {
    try {
      return localStorage.getItem(LOCAL_GLC_PLATINE_CATALOG_FLAG) !== '1';
    } catch {
      return false;
    }
  })();

  const shouldUpgradeGlcDetails = (() => {
    try {
      return localStorage.getItem(LOCAL_GLC32_DETAILS_V2_FLAG) !== '1';
    } catch {
      return false;
    }
  })();

  const shouldSeedMultiBrand = (() => {
    try {
      return localStorage.getItem(LOCAL_MULTI_BRAND_SEED_V1_FLAG) !== '1';
    } catch {
      return false;
    }
  })();

  try {
    const raw = localStorage.getItem(LOCAL_PREVIEW_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalSnapshotState>;
      const mergedConfig = parsed.config
        ? { ...DEFAULT_STORE_CONFIG, ...parsed.config }
        : DEFAULT_STORE_CONFIG;
      if (
        !mergedConfig.headerBrandName ||
        mergedConfig.headerBrandName === 'الموان للحداد والبويهات'
      ) {
        mergedConfig.headerBrandName = DEFAULT_STORE_CONFIG.headerBrandName;
      }

      const rawBanners = Array.isArray(parsed.banners) ? parsed.banners : DEFAULT_BANNERS;
      const rawProducts = Array.isArray(parsed.products) ? parsed.products : DEFAULT_PRODUCTS;
      const rawCatalogs = Array.isArray(parsed.catalogs) ? parsed.catalogs : DEFAULT_CATALOGS;
      let categories = Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES;
      let subpages = Array.isArray(parsed.subpages) ? parsed.subpages : DEFAULT_SUBPAGES;

      const cleanBanners = shouldPurgeDemo
        ? rawBanners.filter((b) => !DEMO_BANNER_IDS.includes(b.id))
        : rawBanners;
      let cleanProducts = shouldPurgeDemo
        ? rawProducts.filter((p) => !DEMO_PRODUCT_IDS.includes(p.id))
        : rawProducts;
      let cleanCatalogs = shouldPurgeDemo
        ? rawCatalogs.filter((k) => !DEMO_CATALOG_IDS.includes(k.id))
        : rawCatalogs;

      if (shouldSeedGlcPlatineCatalog) {
        const existingCatIds = new Set(cleanCatalogs.map((c) => c.id));
        const missingCats = DEFAULT_CATALOGS.filter((c) => !existingCatIds.has(c.id));
        if (missingCats.length > 0) {
          cleanCatalogs = [...missingCats, ...cleanCatalogs];
        }
      }

      if (shouldSeedGlc32 || shouldSeedGlcBatch2) {
        if (!categories.some((c) => c.id === 'cat_glc')) {
          const glcCat = DEFAULT_CATEGORIES.find((c) => c.id === 'cat_glc');
          if (glcCat) categories = [glcCat, ...categories];
        }
        subpages = mergeGlcSubpagesList(subpages);
        if (shouldSeedGlc32) {
          cleanProducts = mergeGlcProductsList(cleanProducts);
        }
        if (shouldSeedGlcBatch2) {
          cleanProducts = mergeGlcBatch2ProductsList(cleanProducts);
        }
      }

      if (shouldUpgradeGlcDetails) {
        const upgraded = upgradeGlcDetailsInList(cleanProducts);
        cleanProducts = upgraded.list;
      }

      if (shouldSeedMultiBrand) {
        const mergedMulti = mergeMultiBrandCatalog(categories, subpages, cleanProducts);
        categories = mergedMulti.categories;
        subpages = mergedMulti.subpages;
        cleanProducts = mergedMulti.products;
      }

      const nextState: LocalSnapshotState = {
        initialized: true,
        config: mergedConfig,
        banners: cleanBanners,
        categories,
        subpages,
        products: cleanProducts,
        catalogs: cleanCatalogs,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      };

      if (
        shouldPurgeDemo ||
        shouldSeedGlc32 ||
        shouldSeedGlcBatch2 ||
        shouldSeedGlcPlatineCatalog ||
        shouldUpgradeGlcDetails ||
        shouldSeedMultiBrand
      ) {
        try {
          localStorage.setItem(LOCAL_PREVIEW_STORAGE_KEY, JSON.stringify(nextState));
          if (shouldPurgeDemo) localStorage.setItem(LOCAL_DEMO_PURGE_FLAG, '1');
          if (shouldSeedGlc32) localStorage.setItem(LOCAL_GLC32_SEED_FLAG, '1');
          if (shouldSeedGlcBatch2) localStorage.setItem(LOCAL_GLC_BATCH2_SEED_FLAG, '1');
          if (shouldSeedGlcPlatineCatalog)
            localStorage.setItem(LOCAL_GLC_PLATINE_CATALOG_FLAG, '1');
          if (shouldUpgradeGlcDetails) localStorage.setItem(LOCAL_GLC32_DETAILS_V2_FLAG, '1');
          if (shouldSeedMultiBrand) localStorage.setItem(LOCAL_MULTI_BRAND_SEED_V1_FLAG, '1');
        } catch {
          // Ignore storage quota issues
        }
      }

      return nextState;
    }
  } catch {
    // Ignore corrupted cache
  }

  const baseGlcProducts = shouldSeedGlc32
    ? GLC_ALL_PRODUCTS
    : shouldSeedGlcBatch2
    ? [...DEFAULT_PRODUCTS, ...GLC_BATCH2_PRODUCTS]
    : DEFAULT_PRODUCTS;
  const initialProducts = [...baseGlcProducts, ...MULTI_BRAND_PRODUCTS];
  const freshState: LocalSnapshotState = {
    initialized: true,
    config: DEFAULT_STORE_CONFIG,
    banners: DEFAULT_BANNERS,
    categories: DEFAULT_CATEGORIES,
    subpages: DEFAULT_SUBPAGES,
    products: initialProducts,
    catalogs: DEFAULT_CATALOGS,
    orders: [],
    inquiries: [],
  };

  try {
    localStorage.setItem(LOCAL_DEMO_PURGE_FLAG, '1');
    localStorage.setItem(LOCAL_GLC32_SEED_FLAG, '1');
    localStorage.setItem(LOCAL_GLC_BATCH2_SEED_FLAG, '1');
    localStorage.setItem(LOCAL_MULTI_BRAND_SEED_V1_FLAG, '1');
    localStorage.setItem(LOCAL_PREVIEW_STORAGE_KEY, JSON.stringify(freshState));
  } catch {
    // Ignore storage quota issues
  }

  return freshState;
}

function upsertItemInList<T extends { id: string }>(list: T[], item: T, prepend = false): T[] {
  const exists = list.some((x) => x.id === item.id);
  if (exists) {
    return list.map((x) => (x.id === item.id ? item : x));
  }
  return prepend ? [item, ...list] : [...list, item];
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialLocal = useMemo(() => (isSupabaseConfigured ? null : readLocalSnapshot()), []);

  const [config, setConfig] = useState<StoreConfig>(
    initialLocal?.config || DEFAULT_STORE_CONFIG
  );
  const [hasCloudConfig, setHasCloudConfig] = useState(
    initialLocal ? initialLocal.initialized : false
  );
  const hasCloudConfigRef = useRef(initialLocal ? initialLocal.initialized : false);

  const [cloudBanners, setCloudBanners] = useState<Banner[]>(
    initialLocal?.banners || []
  );
  const [cloudCategories, setCloudCategories] = useState<Category[]>(
    initialLocal?.categories || []
  );
  const [cloudSubpages, setCloudSubpages] = useState<Subpage[]>(
    initialLocal?.subpages || []
  );
  const [cloudProducts, setCloudProducts] = useState<Product[]>(
    initialLocal?.products || []
  );
  const [cloudCatalogs, setCloudCatalogs] = useState<ColorCatalog[]>(
    initialLocal?.catalogs || []
  );

  const [orders, setOrders] = useState<Order[]>(initialLocal?.orders || []);
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialLocal?.inquiries || []);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() =>
    isSupabaseConfigured ? [] : loadLocalAnalyticsEvents()
  );

  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isLiveSynced, setIsLiveSynced] = useState(!isSupabaseConfigured);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [ownerUser, setOwnerUser] = useState<User | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota issues
    }
  }, [cart]);

  // Persist local preview snapshot & broadcast across browser tabs when Supabase env is not set
  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      const snapshot: LocalSnapshotState = {
        initialized: hasCloudConfig,
        config,
        banners: cloudBanners,
        categories: cloudCategories,
        subpages: cloudSubpages,
        products: cloudProducts,
        catalogs: cloudCatalogs,
        orders,
        inquiries,
      };
      localStorage.setItem(LOCAL_PREVIEW_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore localStorage quota issues
    }
  }, [
    hasCloudConfig,
    config,
    cloudBanners,
    cloudCategories,
    cloudSubpages,
    cloudProducts,
    cloudCatalogs,
    orders,
    inquiries,
  ]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === ANALYTICS_STORAGE_KEY) {
        setAnalyticsEvents(loadLocalAnalyticsEvents());
        return;
      }
      if (e.key !== LOCAL_PREVIEW_STORAGE_KEY || !e.newValue) return;
      const snap = readLocalSnapshot();
      setHasCloudConfig(snap.initialized);
      hasCloudConfigRef.current = snap.initialized;
      setConfig(snap.config);
      setCloudBanners(snap.banners);
      setCloudCategories(snap.categories);
      setCloudSubpages(snap.subpages);
      setCloudProducts(snap.products);
      setCloudCatalogs(snap.catalogs);
      setOrders(snap.orders);
      setInquiries(snap.inquiries);
    };
    const onLocalAnalytics = () => {
      setAnalyticsEvents(loadLocalAnalyticsEvents());
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(ANALYTICS_UPDATED_EVENT, onLocalAnalytics);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(ANALYTICS_UPDATED_EVENT, onLocalAnalytics);
    };
  }, []);

  // Supabase Auth Session Listener
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setOwnerUser(data.session?.user ?? null);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setOwnerUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const isVerifiedAdmin = useMemo(() => {
    if (!isSupabaseConfigured) return true; // Local preview mode allows instant testing
    if (!ownerUser) return false;
    const isConfirmed = Boolean(
      ownerUser.email_confirmed_at ||
        ownerUser.user_metadata?.email_verified === true
    );
    return (
      isConfirmed &&
      ADMIN_EMAILS.includes((ownerUser.email || '').trim().toLowerCase())
    );
  }, [ownerUser]);

  // Supabase Public Initial Fetch + Real-time Postgres WebSocket Sync
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    const loadPublicData = async () => {
      try {
        const [cfgRes, banRes, catRes, subRes, prodRes, catlgRes] = await Promise.all([
          client.from('store_config').select('*').eq('id', 'main').maybeSingle(),
          client.from('banners').select('*').order('sort_order', { ascending: true }).limit(100),
          client.from('categories').select('*').order('sort_order', { ascending: true }).limit(100),
          client.from('subpages').select('*').limit(200),
          client.from('products').select('*').order('created_at', { ascending: false }).limit(1000),
          client.from('catalogs').select('*').order('created_at', { ascending: false }).limit(100),
        ]);

        if (!mounted) return;

        if (cfgRes.data) {
          hasCloudConfigRef.current = true;
          setHasCloudConfig(true);
          setConfig(mapConfigFromDb(cfgRes.data as DbRow));
        } else {
          hasCloudConfigRef.current = false;
          setHasCloudConfig(false);
        }

        if (banRes.data) {
          setCloudBanners((banRes.data as DbRow[]).map(mapBannerFromDb));
        }
        if (catRes.data) {
          setCloudCategories((catRes.data as DbRow[]).map(mapCategoryFromDb));
        }
        if (subRes.data) {
          setCloudSubpages((subRes.data as DbRow[]).map(mapSubpageFromDb));
        }
        if (prodRes.data) {
          setCloudProducts((prodRes.data as DbRow[]).map(mapProductFromDb));
        }
        if (catlgRes.data) {
          setCloudCatalogs((catlgRes.data as DbRow[]).map(mapCatalogFromDb));
        }
        setIsLiveSynced(true);
      } catch (error) {
        console.error('Supabase initial fetch error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadPublicData();

    const channel = client
      .channel('mowan_public_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_config' },
        (payload) => {
          if (payload.eventType !== 'DELETE' && payload.new) {
            const row = payload.new as DbRow;
            if (row.id === 'main') {
              hasCloudConfigRef.current = true;
              setHasCloudConfig(true);
              setConfig(mapConfigFromDb(row));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banners' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const delId = String((payload.old as DbRow)?.id || '');
            setCloudBanners((prev) => prev.filter((b) => b.id !== delId));
          } else if (payload.new) {
            const mapped = mapBannerFromDb(payload.new as DbRow);
            setCloudBanners((prev) =>
              upsertItemInList(prev, mapped).sort((a, b) => a.sortOrder - b.sortOrder)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const delId = String((payload.old as DbRow)?.id || '');
            setCloudCategories((prev) => prev.filter((c) => c.id !== delId));
          } else if (payload.new) {
            const mapped = mapCategoryFromDb(payload.new as DbRow);
            setCloudCategories((prev) =>
              upsertItemInList(prev, mapped).sort((a, b) => a.sortOrder - b.sortOrder)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subpages' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const delId = String((payload.old as DbRow)?.id || '');
            setCloudSubpages((prev) => prev.filter((s) => s.id !== delId));
          } else if (payload.new) {
            const mapped = mapSubpageFromDb(payload.new as DbRow);
            setCloudSubpages((prev) => upsertItemInList(prev, mapped));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const delId = String((payload.old as DbRow)?.id || '');
            setCloudProducts((prev) => prev.filter((p) => p.id !== delId));
          } else if (payload.new) {
            const mapped = mapProductFromDb(payload.new as DbRow);
            setCloudProducts((prev) =>
              upsertItemInList(prev, mapped, payload.eventType === 'INSERT')
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'catalogs' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const delId = String((payload.old as DbRow)?.id || '');
            setCloudCatalogs((prev) => prev.filter((c) => c.id !== delId));
          } else if (payload.new) {
            const mapped = mapCatalogFromDb(payload.new as DbRow);
            setCloudCatalogs((prev) =>
              upsertItemInList(prev, mapped, payload.eventType === 'INSERT')
            );
          }
        }
      )
      .subscribe((status) => {
        if (mounted) {
          setIsLiveSynced(status === 'SUBSCRIBED');
        }
      });

    return () => {
      mounted = false;
      client.removeChannel(channel);
    };
  }, []);

  // Private Admin Realtime Listeners (Orders, Inquiries & Store Analytics)
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;
    if (!authReady || !isVerifiedAdmin) {
      setOrders([]);
      setInquiries([]);
      setAnalyticsEvents([]);
      return;
    }

    const client = supabase;
    let mounted = true;
    const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const loadAdminData = async () => {
      const [ordRes, inqRes, anaRes] = await Promise.all([
        client.from('orders').select('*').order('created_at', { ascending: false }).limit(200),
        client.from('inquiries').select('*').order('created_at', { ascending: false }).limit(200),
        client
          .from('store_analytics')
          .select('*')
          .gte('created_at', thirtyDaysAgoIso)
          .order('created_at', { ascending: false })
          .limit(2000),
      ]);
      if (!mounted) return;
      if (ordRes.data) setOrders((ordRes.data as DbRow[]).map(mapOrderFromDb));
      if (inqRes.data) setInquiries((inqRes.data as DbRow[]).map(mapInquiryFromDb));
      if (anaRes.data) setAnalyticsEvents((anaRes.data as DbRow[]).map(mapAnalyticsFromDb));

      // One-time auto-purge of legacy demo IDs if previously seeded into Supabase
      try {
        if (localStorage.getItem(CLOUD_DEMO_PURGE_FLAG) !== '1') {
          const [bDel, pDel, cDel] = await Promise.all([
            client.from('banners').delete().in('id', DEMO_BANNER_IDS),
            client.from('products').delete().in('id', DEMO_PRODUCT_IDS),
            client.from('catalogs').delete().in('id', DEMO_CATALOG_IDS),
          ]);
          if (!bDel.error && !pDel.error && !cDel.error && mounted) {
            setCloudBanners((prev) => prev.filter((b) => !DEMO_BANNER_IDS.includes(b.id)));
            setCloudProducts((prev) => prev.filter((p) => !DEMO_PRODUCT_IDS.includes(p.id)));
            setCloudCatalogs((prev) => prev.filter((c) => !DEMO_CATALOG_IDS.includes(c.id)));
            localStorage.setItem(CLOUD_DEMO_PURGE_FLAG, '1');
          }
        }
      } catch {
        // Ignore storage error
      }

      // One-time auto-seed of the 32 GLC catalog products into Supabase without overwriting existing rows
      try {
        if (localStorage.getItem(CLOUD_GLC32_SEED_FLAG) !== '1') {
          const glcCat = DEFAULT_CATEGORIES.find((c) => c.id === 'cat_glc');
          if (glcCat) {
            await client
              .from('categories')
              .upsert(mapCategoryToDb(glcCat), { onConflict: 'id', ignoreDuplicates: true });
          }
          await client
            .from('subpages')
            .upsert(GLC_SUBPAGES.map(mapSubpageToDb), { onConflict: 'id', ignoreDuplicates: true });

          const { data: existingRows, error: existingErr } = await client
            .from('products')
            .select('id')
            .in('id', GLC_32_PRODUCT_IDS);

          if (!existingErr && mounted) {
            const existingIds = new Set((existingRows || []).map((r) => String((r as DbRow).id)));
            const missing = GLC_32_PRODUCTS.filter((p) => !existingIds.has(p.id));
            if (missing.length > 0) {
              const { data: insertedRows, error: insErr } = await client
                .from('products')
                .upsert(missing.map(mapProductToDb), {
                  onConflict: 'id',
                  ignoreDuplicates: true,
                })
                .select('*');
              if (!insErr && mounted) {
                const inserted = insertedRows
                  ? (insertedRows as DbRow[]).map(mapProductFromDb)
                  : missing;
                setCloudProducts((prev) => {
                  const ids = new Set(prev.map((p) => p.id));
                  const fresh = inserted.filter((p) => !ids.has(p.id));
                  return fresh.length > 0 ? [...prev, ...fresh] : prev;
                });
                setCloudSubpages((prev) => mergeGlcSubpagesList(prev));
                localStorage.setItem(CLOUD_GLC32_SEED_FLAG, '1');
              }
            } else {
              localStorage.setItem(CLOUD_GLC32_SEED_FLAG, '1');
            }
          }
        }
      } catch {
        // Ignore non-fatal cloud auto-seed error; owner can still trigger manually
      }

      // One-time auto-seed of Batch 2 (9 new unique GLC products) without touching existing or deleted Batch 1 items
      try {
        if (localStorage.getItem(CLOUD_GLC_BATCH2_SEED_FLAG) !== '1') {
          const glcCat = DEFAULT_CATEGORIES.find((c) => c.id === 'cat_glc');
          if (glcCat) {
            await client
              .from('categories')
              .upsert(mapCategoryToDb(glcCat), { onConflict: 'id', ignoreDuplicates: true });
          }
          await client
            .from('subpages')
            .upsert(GLC_SUBPAGES.map(mapSubpageToDb), { onConflict: 'id', ignoreDuplicates: true });

          const { data: existingBatch2, error: batch2Err } = await client
            .from('products')
            .select('id')
            .in('id', GLC_BATCH2_PRODUCT_IDS);

          if (!batch2Err && mounted) {
            const existingIds = new Set((existingBatch2 || []).map((r) => String((r as DbRow).id)));
            const missingBatch2 = GLC_BATCH2_PRODUCTS.filter((p) => !existingIds.has(p.id));
            if (missingBatch2.length > 0) {
              const { data: insertedRows, error: insErr } = await client
                .from('products')
                .upsert(missingBatch2.map(mapProductToDb), {
                  onConflict: 'id',
                  ignoreDuplicates: true,
                })
                .select('*');
              if (!insErr && mounted) {
                const inserted = insertedRows
                  ? (insertedRows as DbRow[]).map(mapProductFromDb)
                  : missingBatch2;
                setCloudProducts((prev) => {
                  const ids = new Set(prev.map((p) => p.id));
                  const fresh = inserted.filter((p) => !ids.has(p.id));
                  return fresh.length > 0 ? [...prev, ...fresh] : prev;
                });
                setCloudSubpages((prev) => mergeGlcSubpagesList(prev));
                localStorage.setItem(CLOUD_GLC_BATCH2_SEED_FLAG, '1');
              }
            } else {
              localStorage.setItem(CLOUD_GLC_BATCH2_SEED_FLAG, '1');
            }
          }
        }
      } catch {
        // Ignore non-fatal cloud auto-seed error
      }

      // One-time non-destructive cloud seed of the GLC Platine 132-Color PDF Catalog
      try {
        if (localStorage.getItem(CLOUD_GLC_PLATINE_CATALOG_FLAG) !== '1' && DEFAULT_CATALOGS.length > 0) {
          const platineCatalog = DEFAULT_CATALOGS[0];
          const { data: existingCatlg, error: checkCatlgErr } = await client
            .from('catalogs')
            .select('id')
            .eq('id', platineCatalog.id);
          if (!checkCatlgErr && mounted) {
            if (!existingCatlg || existingCatlg.length === 0) {
              const { data: insCatlg, error: insCatlgErr } = await client
                .from('catalogs')
                .upsert(mapCatalogToDb(platineCatalog), {
                  onConflict: 'id',
                  ignoreDuplicates: true,
                })
                .select('*');
              if (!insCatlgErr && mounted) {
                const mapped = insCatlg?.[0]
                  ? mapCatalogFromDb(insCatlg[0] as DbRow)
                  : platineCatalog;
                setCloudCatalogs((prev) =>
                  prev.some((c) => c.id === mapped.id) ? prev : [mapped, ...prev]
                );
                localStorage.setItem(CLOUD_GLC_PLATINE_CATALOG_FLAG, '1');
              }
            } else {
              localStorage.setItem(CLOUD_GLC_PLATINE_CATALOG_FLAG, '1');
            }
          }
        }
      } catch {
        // Ignore non-fatal catalog auto-seed error
      }

      // One-time auto-upgrade of existing short GLC descriptions in Supabase (preserves prices & deleted rows)
      try {
        if (localStorage.getItem(CLOUD_GLC32_DETAILS_V2_FLAG) !== '1') {
          const { data: existingRows, error: checkErr } = await client
            .from('products')
            .select('id, description')
            .in('id', GLC_32_PRODUCT_IDS);

          if (!checkErr && existingRows && mounted) {
            const toUpgrade = existingRows.filter((row) => {
              const id = String((row as DbRow).id || '');
              const desc = String((row as DbRow).description || '');
              return GLC_32_MAP.has(id) && !desc.includes('المواصفات الفنية والتشغيل:');
            });

            if (toUpgrade.length > 0) {
              await Promise.all(
                toUpgrade.map((row) => {
                  const id = String((row as DbRow).id);
                  const rich = GLC_32_MAP.get(id)!;
                  return client
                    .from('products')
                    .update({
                      description: rich.description,
                      specs: rich.specs,
                      sizes: rich.sizes,
                      unit: rich.unit,
                      badge: rich.badge,
                      subpage_id: rich.subpageId,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', id);
                })
              );

              if (mounted) {
                setCloudProducts((prev) => upgradeGlcDetailsInList(prev).list);
              }
            }
            localStorage.setItem(CLOUD_GLC32_DETAILS_V2_FLAG, '1');
          }
        }
      } catch {
        // Ignore non-fatal upgrade error
      }

      // One-time non-destructive cloud seed of JOTUN, SIPES, CMB, SCIB & SAVETO categories right under GLC
      try {
        if (localStorage.getItem(CLOUD_MULTI_BRAND_SEED_V1_FLAG) !== '1') {
          await client
            .from('categories')
            .upsert(MULTI_BRAND_CATEGORIES.map(mapCategoryToDb), {
              onConflict: 'id',
              ignoreDuplicates: true,
            });

          // Align sort_order on existing built-in categories so the 5 brands appear immediately under GLC
          await Promise.all(
            DEFAULT_CATEGORIES.map((cat) =>
              client
                .from('categories')
                .update({ sort_order: cat.sortOrder, updated_at: new Date().toISOString() })
                .eq('id', cat.id)
            )
          );

          await client
            .from('subpages')
            .upsert(MULTI_BRAND_SUBPAGES.map(mapSubpageToDb), {
              onConflict: 'id',
              ignoreDuplicates: true,
            });

          const { data: existingMultiRows, error: multiCheckErr } = await client
            .from('products')
            .select('id')
            .in('id', MULTI_BRAND_PRODUCT_IDS);

          if (!multiCheckErr && mounted) {
            const existingIds = new Set(
              (existingMultiRows || []).map((r) => String((r as DbRow).id))
            );
            const missingMulti = MULTI_BRAND_PRODUCTS.filter((p) => !existingIds.has(p.id));
            let insertedProducts: Product[] = [];
            if (missingMulti.length > 0) {
              const { data: insRows, error: insMultiErr } = await client
                .from('products')
                .upsert(missingMulti.map(mapProductToDb), {
                  onConflict: 'id',
                  ignoreDuplicates: true,
                })
                .select('*');
              if (!insMultiErr) {
                insertedProducts = insRows
                  ? (insRows as DbRow[]).map(mapProductFromDb)
                  : missingMulti;
              }
            }
            if (mounted) {
              setCloudCategories((prev) => {
                const existingCatIds = new Set(prev.map((c) => c.id));
                const missingCats = MULTI_BRAND_CATEGORIES.filter((c) => !existingCatIds.has(c.id));
                return [...prev, ...missingCats]
                  .map((c) => {
                    const ord = BUILTIN_SORT_ORDER_MAP.get(c.id);
                    return ord !== undefined ? { ...c, sortOrder: ord } : c;
                  })
                  .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
              });
              setCloudSubpages((prev) => {
                const subIds = new Set(prev.map((s) => s.id));
                const missingSubs = MULTI_BRAND_SUBPAGES.filter((s) => !subIds.has(s.id));
                return missingSubs.length > 0 ? [...prev, ...missingSubs] : prev;
              });
              if (insertedProducts.length > 0) {
                setCloudProducts((prev) => {
                  const ids = new Set(prev.map((p) => p.id));
                  const fresh = insertedProducts.filter((p) => !ids.has(p.id));
                  return fresh.length > 0 ? [...prev, ...fresh] : prev;
                });
              }
              localStorage.setItem(CLOUD_MULTI_BRAND_SEED_V1_FLAG, '1');
            }
          }
        }
      } catch {
        // Ignore non-fatal cloud auto-seed error
      }
    };

    loadAdminData();

    const adminChannel = client
      .channel('mowan_admin_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const delId = String((payload.old as DbRow)?.id || '');
            setOrders((prev) => prev.filter((o) => o.id !== delId));
          } else if (payload.new) {
            const mapped = mapOrderFromDb(payload.new as DbRow);
            setOrders((prev) =>
              upsertItemInList(prev, mapped, payload.eventType === 'INSERT')
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const delId = String((payload.old as DbRow)?.id || '');
            setInquiries((prev) => prev.filter((q) => q.id !== delId));
          } else if (payload.new) {
            const mapped = mapInquiryFromDb(payload.new as DbRow);
            setInquiries((prev) =>
              upsertItemInList(prev, mapped, payload.eventType === 'INSERT')
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_analytics' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const delId = String((payload.old as DbRow)?.id || '');
            setAnalyticsEvents((prev) => (delId ? prev.filter((e) => e.id !== delId) : []));
          } else if (payload.new) {
            const mapped = mapAnalyticsFromDb(payload.new as DbRow);
            setAnalyticsEvents((prev) => upsertItemInList(prev, mapped, true).slice(0, 2000));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      client.removeChannel(adminChannel);
    };
  }, [authReady, isVerifiedAdmin]);

  // Real items only (never fall back to fake demo banners/products/catalogs)
  const banners = cloudBanners;
  const products = cloudProducts;
  const catalogs = cloudCatalogs;

  const categories = useMemo(() => {
    const base =
      hasCloudConfig || cloudCategories.length > 0 ? cloudCategories : DEFAULT_CATEGORIES;
    return [...base].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  }, [hasCloudConfig, cloudCategories]);
  const subpages = useMemo(
    () => (hasCloudConfig || cloudSubpages.length > 0 ? cloudSubpages : DEFAULT_SUBPAGES),
    [hasCloudConfig, cloudSubpages]
  );

  const signInOwnerGoogle = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('أضف مفاتيح Supabase في إعدادات البيئة لتفعيل الدخول عبر Google.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signInOwnerPassword = useCallback(async (email: string, password: string) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('أضف مفاتيح Supabase أولاً لتسجيل الدخول.');
    }
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error(
          'البريد أو كلمة المرور غير صحيحة. يمكنك الدخول فوراً عبر "رابط دخول على الإيميل" بدون كلمة سر أو إنشاء كلمة سر جديدة.'
        );
      }
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error(
          'يرجى تأكيد البريد الإلكتروني أولاً من الرسالة المرسلة إلى إيميلك أو عبر رابط الدخول السريع.'
        );
      }
      throw new Error(error.message);
    }
  }, []);

  const signInOwnerMagicLink = useCallback(async (email: string) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('أضف مفاتيح Supabase أولاً لتسجيل الدخول.');
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(cleanEmail)) {
      throw new Error('هذا البريد غير مسجل ضمن حسابات مالك المتجر المصرح لها.');
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signUpOwnerPassword = useCallback(async (email: string, password: string) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('أضف مفاتيح Supabase أولاً لتسجيل الدخول.');
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(cleanEmail)) {
      throw new Error('هذا البريد غير مسجل ضمن حسابات مالك المتجر المصرح لها.');
    }
    if (password.length < 6) {
      throw new Error('يرجى كتابة كلمة مرور من 6 أحرف أو أرقام على الأقل.');
    }
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(error.message);
    return Boolean(data.session);
  }, []);

  const sendOwnerPasswordReset = useCallback(async (email: string) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('أضف مفاتيح Supabase أولاً لتسجيل الدخول.');
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(cleanEmail)) {
      throw new Error('هذا البريد غير مسجل ضمن حسابات مالك المتجر المصرح لها.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOutOwnerGoogle = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    trackAnalyticsEvent({
      eventType: 'cart_add',
      targetId: product.id,
      targetLabel: product.name,
    });
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateCartQty = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.product.id !== productId)
        : prev.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Materializes store_config & base categories/subpages on first mutation (never seeds demo products/banners)
  const materializeDefaultsIfUnseeded = useCallback(
    async (opts?: {
      skipCategoryId?: string;
      skipSubpageId?: string;
    }) => {
      if (hasCloudConfigRef.current) return;

      const cats = DEFAULT_CATEGORIES.filter((c) => c.id !== opts?.skipCategoryId);
      const subs = DEFAULT_SUBPAGES.filter(
        (s) => s.id !== opts?.skipSubpageId && s.categoryId !== opts?.skipCategoryId
      );

      if (!supabase || !isSupabaseConfigured) {
        hasCloudConfigRef.current = true;
        setHasCloudConfig(true);
        setCloudCategories(cats);
        setCloudSubpages(subs);
        return;
      }

      const client = supabase;
      const { error: cfgErr } = await client
        .from('store_config')
        .upsert(mapConfigToDb(config), { onConflict: 'id' });
      if (cfgErr) throw normalizeSupabaseError(cfgErr.message);

      if (cats.length > 0) {
        const { error } = await client
          .from('categories')
          .upsert(cats.map(mapCategoryToDb), { onConflict: 'id' });
        if (error) throw normalizeSupabaseError(error.message);
      }

      if (subs.length > 0) {
        const { error } = await client
          .from('subpages')
          .upsert(subs.map(mapSubpageToDb), { onConflict: 'id' });
        if (error) throw normalizeSupabaseError(error.message);
      }

      hasCloudConfigRef.current = true;
      setHasCloudConfig(true);
    },
    [config]
  );

  const saveConfig = useCallback(async (nextConfig: StoreConfig) => {
    if (!supabase || !isSupabaseConfigured) {
      hasCloudConfigRef.current = true;
      setHasCloudConfig(true);
      setConfig(nextConfig);
      return;
    }
    const { error } = await supabase
      .from('store_config')
      .upsert(mapConfigToDb(nextConfig), { onConflict: 'id' });
    if (error) throw normalizeSupabaseError(error.message);
    hasCloudConfigRef.current = true;
    setHasCloudConfig(true);
    setConfig(nextConfig);
  }, []);

  // Initializes store settings and base categories ONLY (never inserts demo banners or products)
  const seedMissingCatalog = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      hasCloudConfigRef.current = true;
      setHasCloudConfig(true);
      setConfig((prev) => ({ ...DEFAULT_STORE_CONFIG, ...prev }));
      if (cloudCategories.length === 0) setCloudCategories(DEFAULT_CATEGORIES);
      if (cloudSubpages.length === 0) setCloudSubpages(DEFAULT_SUBPAGES);
      return;
    }

    const client = supabase;
    const { error: e1 } = await client
      .from('store_config')
      .upsert(mapConfigToDb(config), { onConflict: 'id' });
    if (e1) throw normalizeSupabaseError(e1.message);

    const { error: e2 } = await client
      .from('categories')
      .upsert(DEFAULT_CATEGORIES.map(mapCategoryToDb), { onConflict: 'id' });
    if (e2) throw normalizeSupabaseError(e2.message);

    const { error: e3 } = await client
      .from('subpages')
      .upsert(DEFAULT_SUBPAGES.map(mapSubpageToDb), { onConflict: 'id' });
    if (e3) throw normalizeSupabaseError(e3.message);

    hasCloudConfigRef.current = true;
    setHasCloudConfig(true);
    setCloudCategories((prev) => (prev.length > 0 ? prev : DEFAULT_CATEGORIES));
    setCloudSubpages((prev) => (prev.length > 0 ? prev : DEFAULT_SUBPAGES));
  }, [cloudCategories.length, cloudSubpages.length, config]);

  // Restores default store config text/contact & base categories if empty (never restores demo posts)
  const restoreDefaultConfigAndCatalog = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      hasCloudConfigRef.current = true;
      setHasCloudConfig(true);
      setConfig(DEFAULT_STORE_CONFIG);
      if (cloudCategories.length === 0) setCloudCategories(DEFAULT_CATEGORIES);
      return;
    }

    const client = supabase;
    const { error: e1 } = await client
      .from('store_config')
      .upsert(mapConfigToDb(DEFAULT_STORE_CONFIG), { onConflict: 'id' });
    if (e1) throw normalizeSupabaseError(e1.message);

    if (cloudCategories.length === 0) {
      const { error: e2 } = await client
        .from('categories')
        .upsert(DEFAULT_CATEGORIES.map(mapCategoryToDb), { onConflict: 'id' });
      if (e2) throw normalizeSupabaseError(e2.message);
      setCloudCategories(DEFAULT_CATEGORIES);
    }

    hasCloudConfigRef.current = true;
    setHasCloudConfig(true);
    setConfig(DEFAULT_STORE_CONFIG);
  }, [cloudCategories.length]);

  // Imports missing GLC catalog products (leaves already-added or user-priced products completely untouched)
  const importGlcCatalogProducts = useCallback(async () => {
    await materializeDefaultsIfUnseeded();

    if (!supabase || !isSupabaseConfigured) {
      const existingIds = new Set(cloudProducts.map((p) => p.id));
      const missing = GLC_ALL_PRODUCTS.filter((p) => !existingIds.has(p.id));
      setCloudCategories((prev) => {
        if (prev.some((c) => c.id === 'cat_glc')) return prev;
        const glcCat = DEFAULT_CATEGORIES.find((c) => c.id === 'cat_glc');
        return glcCat ? [glcCat, ...prev] : prev;
      });
      setCloudSubpages((prev) => mergeGlcSubpagesList(prev));
      if (missing.length > 0) {
        setCloudProducts((prev) => [...prev, ...missing]);
      }
      try {
        localStorage.setItem(LOCAL_GLC32_SEED_FLAG, '1');
        localStorage.setItem(LOCAL_GLC_BATCH2_SEED_FLAG, '1');
      } catch {
        // Ignore storage error
      }
      return missing.length;
    }

    const client = supabase;
    const glcCat = DEFAULT_CATEGORIES.find((c) => c.id === 'cat_glc');
    if (glcCat) {
      const { error: catErr } = await client
        .from('categories')
        .upsert(mapCategoryToDb(glcCat), { onConflict: 'id', ignoreDuplicates: true });
      if (catErr) throw normalizeSupabaseError(catErr.message);
    }

    const { error: subErr } = await client
      .from('subpages')
      .upsert(GLC_SUBPAGES.map(mapSubpageToDb), { onConflict: 'id', ignoreDuplicates: true });
    if (subErr) throw normalizeSupabaseError(subErr.message);

    const { data: existingRows, error: checkErr } = await client
      .from('products')
      .select('id')
      .in('id', GLC_ALL_PRODUCT_IDS);
    if (checkErr) throw normalizeSupabaseError(checkErr.message);

    const existingIds = new Set((existingRows || []).map((r) => String((r as DbRow).id)));
    const missing = GLC_ALL_PRODUCTS.filter((p) => !existingIds.has(p.id));

    if (missing.length > 0) {
      const { data: insertedRows, error: insErr } = await client
        .from('products')
        .upsert(missing.map(mapProductToDb), {
          onConflict: 'id',
          ignoreDuplicates: true,
        })
        .select('*');
      if (insErr) throw normalizeSupabaseError(insErr.message);

      const inserted = insertedRows ? (insertedRows as DbRow[]).map(mapProductFromDb) : missing;
      setCloudProducts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const fresh = inserted.filter((p) => !ids.has(p.id));
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
      });
    }

    setCloudCategories((prev) => {
      if (prev.some((c) => c.id === 'cat_glc')) return prev;
      return glcCat ? [glcCat, ...prev] : prev;
    });
    setCloudSubpages((prev) => mergeGlcSubpagesList(prev));
    try {
      localStorage.setItem(CLOUD_GLC32_SEED_FLAG, '1');
      localStorage.setItem(CLOUD_GLC_BATCH2_SEED_FLAG, '1');
    } catch {
      // Ignore storage error
    }
    return missing.length;
  }, [cloudProducts, materializeDefaultsIfUnseeded]);

  const upsertBanner = useCallback(
    async (banner: Omit<Banner, 'createdAt' | 'updatedAt'>, _isNew: boolean) => {
      const id = sanitizeId(banner.id);
      const next: Banner = { ...banner, id };
      await materializeDefaultsIfUnseeded();

      if (!supabase || !isSupabaseConfigured) {
        setCloudBanners((prev) =>
          upsertItemInList(prev, next).sort((a, b) => a.sortOrder - b.sortOrder)
        );
        return;
      }

      const { error } = await supabase
        .from('banners')
        .upsert(mapBannerToDb(next), { onConflict: 'id' });
      if (error) throw normalizeSupabaseError(error.message);
      setCloudBanners((prev) =>
        upsertItemInList(prev, next).sort((a, b) => a.sortOrder - b.sortOrder)
      );
    },
    [materializeDefaultsIfUnseeded]
  );

  const deleteBanner = useCallback(
    async (id: string) => {
      const safeId = sanitizeId(id);
      await materializeDefaultsIfUnseeded();
      if (!supabase || !isSupabaseConfigured) {
        setCloudBanners((prev) => prev.filter((b) => b.id !== safeId));
        return;
      }
      const { data, error } = await supabase
        .from('banners')
        .delete()
        .eq('id', safeId)
        .select('id');
      if (error) throw normalizeSupabaseError(error.message);
      if ((!data || data.length === 0) && !isVerifiedAdmin) {
        throw new Error(CLOUD_AUTH_REQUIRED_MSG);
      }
      setCloudBanners((prev) => prev.filter((b) => b.id !== safeId));
    },
    [isVerifiedAdmin, materializeDefaultsIfUnseeded]
  );

  const deleteAllBanners = useCallback(async () => {
    await materializeDefaultsIfUnseeded();
    if (!supabase || !isSupabaseConfigured) {
      setCloudBanners([]);
      return;
    }
    const hadBanners = cloudBanners.length > 0;
    const { data, error } = await supabase.from('banners').delete().neq('id', '').select('id');
    if (error) throw normalizeSupabaseError(error.message);
    if (hadBanners && (!data || data.length === 0) && !isVerifiedAdmin) {
      throw new Error(CLOUD_AUTH_REQUIRED_MSG);
    }
    setCloudBanners([]);
  }, [cloudBanners.length, isVerifiedAdmin, materializeDefaultsIfUnseeded]);

  const upsertCategory = useCallback(
    async (cat: Omit<Category, 'createdAt' | 'updatedAt'>, _isNew: boolean) => {
      const id = sanitizeId(cat.id);
      const next: Category = { ...cat, id };
      await materializeDefaultsIfUnseeded();

      if (!supabase || !isSupabaseConfigured) {
        setCloudCategories((prev) =>
          upsertItemInList(prev, next).sort((a, b) => a.sortOrder - b.sortOrder)
        );
        return;
      }

      const { error } = await supabase
        .from('categories')
        .upsert(mapCategoryToDb(next), { onConflict: 'id' });
      if (error) throw normalizeSupabaseError(error.message);
      setCloudCategories((prev) =>
        upsertItemInList(prev, next).sort((a, b) => a.sortOrder - b.sortOrder)
      );
    },
    [materializeDefaultsIfUnseeded]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const safeId = sanitizeId(id);
      await materializeDefaultsIfUnseeded({ skipCategoryId: safeId });
      const remainingCat = categories.find((c) => c.id !== safeId);
      const nextCatId = remainingCat ? remainingCat.id : '';

      if (!supabase || !isSupabaseConfigured) {
        setCloudProducts((prev) =>
          prev.map((p) =>
            p.categoryId === safeId ? { ...p, categoryId: nextCatId, subpageId: '' } : p
          )
        );
        setCloudSubpages((prev) => prev.filter((s) => s.categoryId !== safeId));
        setCloudCategories((prev) => prev.filter((c) => c.id !== safeId));
        return;
      }

      if (remainingCat && !cloudCategories.some((c) => c.id === remainingCat.id)) {
        await supabase
          .from('categories')
          .upsert(mapCategoryToDb(remainingCat), { onConflict: 'id' });
      }

      // Move products from the deleted category first so no FK restriction blocks deletion
      const { error: moveErr } = await supabase
        .from('products')
        .update({ category_id: nextCatId, subpage_id: '', updated_at: new Date().toISOString() })
        .eq('category_id', safeId);
      if (moveErr) throw normalizeSupabaseError(moveErr.message);

      const { error: subErr } = await supabase
        .from('subpages')
        .delete()
        .eq('category_id', safeId);
      if (subErr) throw normalizeSupabaseError(subErr.message);

      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', safeId)
        .select('id');
      if (error) throw normalizeSupabaseError(error.message);
      if ((!data || data.length === 0) && !isVerifiedAdmin) {
        throw new Error(CLOUD_AUTH_REQUIRED_MSG);
      }

      setCloudProducts((prev) =>
        prev.map((p) =>
          p.categoryId === safeId ? { ...p, categoryId: nextCatId, subpageId: '' } : p
        )
      );
      setCloudSubpages((prev) => prev.filter((s) => s.categoryId !== safeId));
      setCloudCategories((prev) => prev.filter((c) => c.id !== safeId));
    },
    [categories, cloudCategories, isVerifiedAdmin, materializeDefaultsIfUnseeded]
  );

  const upsertSubpage = useCallback(
    async (sub: Omit<Subpage, 'createdAt' | 'updatedAt'>, _isNew: boolean) => {
      const id = sanitizeId(sub.id);
      const categoryId = sanitizeId(sub.categoryId);
      const next: Subpage = { ...sub, id, categoryId };
      await materializeDefaultsIfUnseeded();

      if (!supabase || !isSupabaseConfigured) {
        setCloudSubpages((prev) => upsertItemInList(prev, next));
        return;
      }

      const parentCat = categories.find((c) => c.id === categoryId);
      if (parentCat && !cloudCategories.some((c) => c.id === categoryId)) {
        await supabase.from('categories').upsert(mapCategoryToDb(parentCat), { onConflict: 'id' });
      }

      const { error } = await supabase
        .from('subpages')
        .upsert(mapSubpageToDb(next), { onConflict: 'id' });
      if (error) throw normalizeSupabaseError(error.message);
      setCloudSubpages((prev) => upsertItemInList(prev, next));
    },
    [categories, cloudCategories, materializeDefaultsIfUnseeded]
  );

  const deleteSubpage = useCallback(
    async (id: string) => {
      const safeId = sanitizeId(id);
      await materializeDefaultsIfUnseeded({ skipSubpageId: safeId });
      if (!supabase || !isSupabaseConfigured) {
        setCloudProducts((prev) =>
          prev.map((p) => (p.subpageId === safeId ? { ...p, subpageId: '' } : p))
        );
        setCloudSubpages((prev) => prev.filter((s) => s.id !== safeId));
        return;
      }

      await supabase
        .from('products')
        .update({ subpage_id: '', updated_at: new Date().toISOString() })
        .eq('subpage_id', safeId);

      const { data, error } = await supabase
        .from('subpages')
        .delete()
        .eq('id', safeId)
        .select('id');
      if (error) throw normalizeSupabaseError(error.message);
      if ((!data || data.length === 0) && !isVerifiedAdmin) {
        throw new Error(CLOUD_AUTH_REQUIRED_MSG);
      }

      setCloudProducts((prev) =>
        prev.map((p) => (p.subpageId === safeId ? { ...p, subpageId: '' } : p))
      );
      setCloudSubpages((prev) => prev.filter((s) => s.id !== safeId));
    },
    [isVerifiedAdmin, materializeDefaultsIfUnseeded]
  );

  const upsertProduct = useCallback(
    async (prod: Omit<Product, 'createdAt' | 'updatedAt'>, isNew: boolean) => {
      const id = sanitizeId(prod.id);
      const categoryId = prod.categoryId ? sanitizeId(prod.categoryId) : '';
      const next: Product = { ...prod, id, categoryId };
      await materializeDefaultsIfUnseeded();

      if (!supabase || !isSupabaseConfigured) {
        setCloudProducts((prev) => upsertItemInList(prev, next, isNew));
        return;
      }

      const parentCat = categories.find((c) => c.id === categoryId);
      if (parentCat && !cloudCategories.some((c) => c.id === categoryId)) {
        await supabase.from('categories').upsert(mapCategoryToDb(parentCat), { onConflict: 'id' });
      }

      const { error } = await supabase
        .from('products')
        .upsert(mapProductToDb(next), { onConflict: 'id' });
      if (error) throw normalizeSupabaseError(error.message);
      setCloudProducts((prev) => upsertItemInList(prev, next, isNew));
    },
    [categories, cloudCategories, materializeDefaultsIfUnseeded]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const safeId = sanitizeId(id);
      await materializeDefaultsIfUnseeded();
      if (!supabase || !isSupabaseConfigured) {
        setCloudProducts((prev) => prev.filter((p) => p.id !== safeId));
        return;
      }
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', safeId)
        .select('id');
      if (error) throw normalizeSupabaseError(error.message);
      if ((!data || data.length === 0) && !isVerifiedAdmin) {
        throw new Error(CLOUD_AUTH_REQUIRED_MSG);
      }
      setCloudProducts((prev) => prev.filter((p) => p.id !== safeId));
    },
    [isVerifiedAdmin, materializeDefaultsIfUnseeded]
  );

  const deleteAllProducts = useCallback(async () => {
    await materializeDefaultsIfUnseeded();
    if (!supabase || !isSupabaseConfigured) {
      setCloudProducts([]);
      return;
    }
    const hadProducts = cloudProducts.length > 0;
    const { data, error } = await supabase.from('products').delete().neq('id', '').select('id');
    if (error) throw normalizeSupabaseError(error.message);
    if (hadProducts && (!data || data.length === 0) && !isVerifiedAdmin) {
      throw new Error(CLOUD_AUTH_REQUIRED_MSG);
    }
    setCloudProducts([]);
  }, [cloudProducts.length, isVerifiedAdmin, materializeDefaultsIfUnseeded]);

  const cleanAllProductsAndBanners = useCallback(async () => {
    await materializeDefaultsIfUnseeded();
    if (!supabase || !isSupabaseConfigured) {
      setCloudProducts([]);
      setCloudBanners([]);
      setCloudCatalogs([]);
      return;
    }
    const hadAny =
      cloudProducts.length > 0 || cloudBanners.length > 0 || cloudCatalogs.length > 0;
    const [prodRes, banRes, catlgRes] = await Promise.all([
      supabase.from('products').delete().neq('id', '').select('id'),
      supabase.from('banners').delete().neq('id', '').select('id'),
      supabase.from('catalogs').delete().neq('id', '').select('id'),
    ]);
    if (prodRes.error) throw normalizeSupabaseError(prodRes.error.message);
    if (banRes.error) throw normalizeSupabaseError(banRes.error.message);
    if (catlgRes.error) throw normalizeSupabaseError(catlgRes.error.message);
    const totalDeleted =
      (prodRes.data?.length || 0) + (banRes.data?.length || 0) + (catlgRes.data?.length || 0);
    if (hadAny && totalDeleted === 0 && !isVerifiedAdmin) {
      throw new Error(CLOUD_AUTH_REQUIRED_MSG);
    }
    setCloudProducts([]);
    setCloudBanners([]);
    setCloudCatalogs([]);
  }, [
    cloudBanners.length,
    cloudCatalogs.length,
    cloudProducts.length,
    isVerifiedAdmin,
    materializeDefaultsIfUnseeded,
  ]);

  const upsertCatalog = useCallback(
    async (catlg: Omit<ColorCatalog, 'createdAt' | 'updatedAt'>, isNew: boolean) => {
      const id = sanitizeId(catlg.id);
      const rawList =
        Array.isArray(catlg.attachments) && catlg.attachments.length > 0
          ? catlg.attachments.slice(0, 15)
          : catlg.fileUrl
            ? [{ id: 'primary', type: catlg.fileType, url: catlg.fileUrl, name: catlg.title }]
            : [];

      const sanitizedAttachments = rawList
        .filter((a) => Boolean(a.url?.trim()))
        .map((a, idx) => ({
          id: sanitizeId(a.id || `att_${idx}`).slice(0, 80),
          type: a.type === 'pdf' ? ('pdf' as const) : ('image' as const),
          url: a.url.trim(),
          name: (a.name || '').trim().slice(0, 140),
        }));

      const next: ColorCatalog = {
        ...catlg,
        id,
        fileType: sanitizedAttachments[0]?.type || catlg.fileType,
        fileUrl: sanitizedAttachments[0]?.url || catlg.fileUrl,
        attachments: sanitizedAttachments,
      };

      await materializeDefaultsIfUnseeded();

      if (!supabase || !isSupabaseConfigured) {
        setCloudCatalogs((prev) => upsertItemInList(prev, next, isNew));
        return;
      }

      const { error } = await supabase
        .from('catalogs')
        .upsert(mapCatalogToDb(next), { onConflict: 'id' });
      if (error) throw normalizeSupabaseError(error.message);
      setCloudCatalogs((prev) => upsertItemInList(prev, next, isNew));
    },
    [materializeDefaultsIfUnseeded]
  );

  const deleteCatalog = useCallback(
    async (id: string) => {
      const safeId = sanitizeId(id);
      await materializeDefaultsIfUnseeded();
      if (!supabase || !isSupabaseConfigured) {
        setCloudCatalogs((prev) => prev.filter((c) => c.id !== safeId));
        return;
      }
      const { data, error } = await supabase
        .from('catalogs')
        .delete()
        .eq('id', safeId)
        .select('id');
      if (error) throw normalizeSupabaseError(error.message);
      if ((!data || data.length === 0) && !isVerifiedAdmin) {
        throw new Error(CLOUD_AUTH_REQUIRED_MSG);
      }
      setCloudCatalogs((prev) => prev.filter((c) => c.id !== safeId));
    },
    [isVerifiedAdmin, materializeDefaultsIfUnseeded]
  );

  const submitOrder = useCallback(
    async (payload: {
      customerName: string;
      phone: string;
      address: string;
      notes: string;
      paymentMethod: PaymentMethod;
      items: OrderItem[];
      subtotal: number;
      shippingFee: number;
      total: number;
    }) => {
      const id = sanitizeId(`ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`);
      const orderNumber = `MW-${Math.floor(100000 + Math.random() * 900000)}`;

      if (!supabase || !isSupabaseConfigured) {
        const localOrder: Order = {
          id,
          orderNumber,
          customerName: payload.customerName.trim().slice(0, 100),
          phone: payload.phone.trim().slice(0, 30),
          address: payload.address.trim().slice(0, 300),
          notes: payload.notes.trim().slice(0, 500),
          paymentMethod: payload.paymentMethod,
          items: payload.items.slice(0, 50),
          subtotal: Number(payload.subtotal) || 0,
          shippingFee: Number(payload.shippingFee) || 0,
          total: Number(payload.total) || 0,
          status: 'new',
          createdAt: new Date().toISOString(),
        };
        setOrders((prev) => [localOrder, ...prev]);
        return orderNumber;
      }

      const { error } = await supabase.from('orders').insert({
        id,
        order_number: orderNumber,
        customer_name: payload.customerName.trim().slice(0, 100),
        phone: payload.phone.trim().slice(0, 30),
        address: payload.address.trim().slice(0, 300),
        notes: payload.notes.trim().slice(0, 500),
        payment_method: payload.paymentMethod,
        items: payload.items.slice(0, 50),
        subtotal: Number(payload.subtotal) || 0,
        shipping_fee: Number(payload.shippingFee) || 0,
        total: Number(payload.total) || 0,
        status: 'new',
      });
      if (error) throw new Error(error.message);
      return orderNumber;
    },
    []
  );

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    const safeId = sanitizeId(id);
    if (!supabase || !isSupabaseConfigured) {
      setOrders((prev) => prev.map((o) => (o.id === safeId ? { ...o, status } : o)));
      return;
    }
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', safeId);
    if (error) throw normalizeSupabaseError(error.message);
    setOrders((prev) => prev.map((o) => (o.id === safeId ? { ...o, status } : o)));
  }, []);

  const submitInquiry = useCallback(
    async (payload: {
      customerName: string;
      phone: string;
      subject: string;
      message: string;
      colorCode?: string;
    }) => {
      const id = sanitizeId(`inq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`);

      if (!supabase || !isSupabaseConfigured) {
        const localInq: Inquiry = {
          id,
          customerName: payload.customerName.trim().slice(0, 100),
          phone: payload.phone.trim().slice(0, 30),
          subject: payload.subject.trim().slice(0, 140),
          message: payload.message.trim().slice(0, 1500),
          colorCode: (payload.colorCode || '').trim().slice(0, 80),
          status: 'new',
          createdAt: new Date().toISOString(),
        };
        setInquiries((prev) => [localInq, ...prev]);
        return;
      }

      const { error } = await supabase.from('inquiries').insert({
        id,
        customer_name: payload.customerName.trim().slice(0, 100),
        phone: payload.phone.trim().slice(0, 30),
        subject: payload.subject.trim().slice(0, 140),
        message: payload.message.trim().slice(0, 1500),
        color_code: (payload.colorCode || '').trim().slice(0, 80),
        status: 'new',
      });
      if (error) throw new Error(error.message);
    },
    []
  );

  const updateInquiryStatus = useCallback(async (id: string, status: InquiryStatus) => {
    const safeId = sanitizeId(id);
    if (!supabase || !isSupabaseConfigured) {
      setInquiries((prev) => prev.map((q) => (q.id === safeId ? { ...q, status } : q)));
      return;
    }
    const { error } = await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', safeId);
    if (error) throw normalizeSupabaseError(error.message);
    setInquiries((prev) => prev.map((q) => (q.id === safeId ? { ...q, status } : q)));
  }, []);

  const clearAnalytics = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      clearLocalAnalyticsEvents();
      setAnalyticsEvents([]);
      return;
    }
    const { error } = await supabase.from('store_analytics').delete().neq('id', '');
    if (error) throw normalizeSupabaseError(error.message);
    setAnalyticsEvents([]);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        config,
        banners,
        categories,
        subpages,
        products,
        catalogs,
        orders,
        inquiries,
        analyticsEvents,
        cart,
        isLoading,
        isLiveSynced,
        isCloudConfigured: isSupabaseConfigured,
        authReady,
        ownerUser,
        isVerifiedAdmin,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        signInOwnerGoogle,
        signInOwnerPassword,
        signInOwnerMagicLink,
        signUpOwnerPassword,
        sendOwnerPasswordReset,
        signOutOwnerGoogle,
        saveConfig,
        restoreDefaultConfigAndCatalog,
        seedMissingCatalog,
        importGlcCatalogProducts,
        upsertBanner,
        deleteBanner,
        deleteAllBanners,
        upsertCategory,
        deleteCategory,
        upsertSubpage,
        deleteSubpage,
        upsertProduct,
        deleteProduct,
        deleteAllProducts,
        cleanAllProductsAndBanners,
        upsertCatalog,
        deleteCatalog,
        submitOrder,
        updateOrderStatus,
        submitInquiry,
        updateInquiryStatus,
        clearAnalytics,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
