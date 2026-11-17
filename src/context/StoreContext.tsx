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
} from '../data/defaults';
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
  signOutOwnerGoogle: () => Promise<void>;
  saveConfig: (nextConfig: StoreConfig) => Promise<void>;
  restoreDefaultConfigAndCatalog: () => Promise<void>;
  seedMissingCatalog: () => Promise<void>;
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

function readLocalSnapshot(): LocalSnapshotState {
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
      return {
        initialized: Boolean(parsed.initialized),
        config: mergedConfig,
        banners: Array.isArray(parsed.banners) ? parsed.banners : DEFAULT_BANNERS,
        categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES,
        subpages: Array.isArray(parsed.subpages) ? parsed.subpages : DEFAULT_SUBPAGES,
        products: Array.isArray(parsed.products) ? parsed.products : DEFAULT_PRODUCTS,
        catalogs: Array.isArray(parsed.catalogs) ? parsed.catalogs : DEFAULT_CATALOGS,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      };
    }
  } catch {
    // Ignore corrupted cache
  }
  return {
    initialized: false,
    config: DEFAULT_STORE_CONFIG,
    banners: DEFAULT_BANNERS,
    categories: DEFAULT_CATEGORIES,
    subpages: DEFAULT_SUBPAGES,
    products: DEFAULT_PRODUCTS,
    catalogs: DEFAULT_CATALOGS,
    orders: [],
    inquiries: [],
  };
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

  // Once cloud store_config exists, PostgreSQL is the sole source of truth—even when empty ([])
  const banners = useMemo(
    () => (hasCloudConfig || cloudBanners.length > 0 ? cloudBanners : DEFAULT_BANNERS),
    [hasCloudConfig, cloudBanners]
  );
  const categories = useMemo(
    () => (hasCloudConfig || cloudCategories.length > 0 ? cloudCategories : DEFAULT_CATEGORIES),
    [hasCloudConfig, cloudCategories]
  );
  const subpages = useMemo(
    () => (hasCloudConfig || cloudSubpages.length > 0 ? cloudSubpages : DEFAULT_SUBPAGES),
    [hasCloudConfig, cloudSubpages]
  );
  const products = useMemo(
    () => (hasCloudConfig || cloudProducts.length > 0 ? cloudProducts : DEFAULT_PRODUCTS),
    [hasCloudConfig, cloudProducts]
  );
  const catalogs = useMemo(
    () => (hasCloudConfig || cloudCatalogs.length > 0 ? cloudCatalogs : DEFAULT_CATALOGS),
    [hasCloudConfig, cloudCatalogs]
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
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
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

  // Materializes defaults into PostgreSQL (or local state) before first mutation so deletions stay permanent
  const materializeDefaultsIfUnseeded = useCallback(
    async (opts?: {
      skipBannerId?: string;
      skipCategoryId?: string;
      skipSubpageId?: string;
      skipProductId?: string;
      skipCatalogId?: string;
      skipAllBanners?: boolean;
      skipAllProducts?: boolean;
    }) => {
      if (hasCloudConfigRef.current) return;

      const cats = DEFAULT_CATEGORIES.filter((c) => c.id !== opts?.skipCategoryId);
      const subs = DEFAULT_SUBPAGES.filter(
        (s) => s.id !== opts?.skipSubpageId && s.categoryId !== opts?.skipCategoryId
      );
      const bans = opts?.skipAllBanners
        ? []
        : DEFAULT_BANNERS.filter((b) => b.id !== opts?.skipBannerId);
      const prods = opts?.skipAllProducts
        ? []
        : DEFAULT_PRODUCTS.filter((p) => p.id !== opts?.skipProductId);
      const catlgs = DEFAULT_CATALOGS.filter((k) => k.id !== opts?.skipCatalogId);

      if (!supabase || !isSupabaseConfigured) {
        hasCloudConfigRef.current = true;
        setHasCloudConfig(true);
        setCloudCategories(cats);
        setCloudSubpages(subs);
        setCloudBanners(bans);
        setCloudProducts(prods);
        setCloudCatalogs(catlgs);
        return;
      }

      const client = supabase;
      const { error: cfgErr } = await client
        .from('store_config')
        .upsert(mapConfigToDb(config), { onConflict: 'id' });
      if (cfgErr) throw new Error(cfgErr.message);

      if (cats.length > 0) {
        const { error } = await client
          .from('categories')
          .upsert(cats.map(mapCategoryToDb), { onConflict: 'id' });
        if (error) throw new Error(error.message);
      }

      if (subs.length > 0) {
        const { error } = await client
          .from('subpages')
          .upsert(subs.map(mapSubpageToDb), { onConflict: 'id' });
        if (error) throw new Error(error.message);
      }

      if (bans.length > 0) {
        const { error } = await client
          .from('banners')
          .upsert(bans.map(mapBannerToDb), { onConflict: 'id' });
        if (error) throw new Error(error.message);
      }

      if (prods.length > 0) {
        const { error } = await client
          .from('products')
          .upsert(prods.map(mapProductToDb), { onConflict: 'id' });
        if (error) throw new Error(error.message);
      }

      if (catlgs.length > 0) {
        const { error } = await client
          .from('catalogs')
          .upsert(catlgs.map(mapCatalogToDb), { onConflict: 'id' });
        if (error) throw new Error(error.message);
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
    if (error) throw new Error(error.message);
    hasCloudConfigRef.current = true;
    setHasCloudConfig(true);
    setConfig(nextConfig);
  }, []);

  const seedMissingCatalog = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      hasCloudConfigRef.current = true;
      setHasCloudConfig(true);
      setConfig(DEFAULT_STORE_CONFIG);
      setCloudCategories(DEFAULT_CATEGORIES);
      setCloudSubpages(DEFAULT_SUBPAGES);
      setCloudBanners(DEFAULT_BANNERS);
      setCloudProducts(DEFAULT_PRODUCTS);
      setCloudCatalogs(DEFAULT_CATALOGS);
      return;
    }

    const client = supabase;
    const { error: e1 } = await client
      .from('store_config')
      .upsert(mapConfigToDb(DEFAULT_STORE_CONFIG), { onConflict: 'id' });
    if (e1) throw new Error(e1.message);

    const { error: e2 } = await client
      .from('categories')
      .upsert(DEFAULT_CATEGORIES.map(mapCategoryToDb), { onConflict: 'id' });
    if (e2) throw new Error(e2.message);

    const { error: e3 } = await client
      .from('subpages')
      .upsert(DEFAULT_SUBPAGES.map(mapSubpageToDb), { onConflict: 'id' });
    if (e3) throw new Error(e3.message);

    const { error: e4 } = await client
      .from('banners')
      .upsert(DEFAULT_BANNERS.map(mapBannerToDb), { onConflict: 'id' });
    if (e4) throw new Error(e4.message);

    const { error: e5 } = await client
      .from('products')
      .upsert(DEFAULT_PRODUCTS.map(mapProductToDb), { onConflict: 'id' });
    if (e5) throw new Error(e5.message);

    const { error: e6 } = await client
      .from('catalogs')
      .upsert(DEFAULT_CATALOGS.map(mapCatalogToDb), { onConflict: 'id' });
    if (e6) throw new Error(e6.message);

    hasCloudConfigRef.current = true;
    setHasCloudConfig(true);
    setConfig(DEFAULT_STORE_CONFIG);
    setCloudCategories(DEFAULT_CATEGORIES);
    setCloudSubpages(DEFAULT_SUBPAGES);
    setCloudBanners(DEFAULT_BANNERS);
    setCloudProducts(DEFAULT_PRODUCTS);
    setCloudCatalogs(DEFAULT_CATALOGS);
  }, []);

  const restoreDefaultConfigAndCatalog = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      hasCloudConfigRef.current = true;
      setHasCloudConfig(true);
      setConfig(DEFAULT_STORE_CONFIG);
      setCloudCategories(DEFAULT_CATEGORIES);
      setCloudBanners(DEFAULT_BANNERS);
      return;
    }

    const client = supabase;
    const { error: e1 } = await client
      .from('store_config')
      .upsert(mapConfigToDb(DEFAULT_STORE_CONFIG), { onConflict: 'id' });
    if (e1) throw new Error(e1.message);

    const { error: e2 } = await client
      .from('categories')
      .upsert(DEFAULT_CATEGORIES.map(mapCategoryToDb), { onConflict: 'id' });
    if (e2) throw new Error(e2.message);

    const { error: e3 } = await client
      .from('banners')
      .upsert(DEFAULT_BANNERS.map(mapBannerToDb), { onConflict: 'id' });
    if (e3) throw new Error(e3.message);

    hasCloudConfigRef.current = true;
    setHasCloudConfig(true);
    setConfig(DEFAULT_STORE_CONFIG);
  }, []);

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
      if (error) throw new Error(error.message);
      setCloudBanners((prev) =>
        upsertItemInList(prev, next).sort((a, b) => a.sortOrder - b.sortOrder)
      );
    },
    [materializeDefaultsIfUnseeded]
  );

  const deleteBanner = useCallback(
    async (id: string) => {
      const safeId = sanitizeId(id);
      await materializeDefaultsIfUnseeded({ skipBannerId: safeId });
      if (!supabase || !isSupabaseConfigured) {
        setCloudBanners((prev) => prev.filter((b) => b.id !== safeId));
        return;
      }
      const { error } = await supabase.from('banners').delete().eq('id', safeId);
      if (error) throw new Error(error.message);
      setCloudBanners((prev) => prev.filter((b) => b.id !== safeId));
    },
    [materializeDefaultsIfUnseeded]
  );

  const deleteAllBanners = useCallback(async () => {
    await materializeDefaultsIfUnseeded({ skipAllBanners: true });
    if (!supabase || !isSupabaseConfigured) {
      setCloudBanners([]);
      return;
    }
    const { error } = await supabase.from('banners').delete().neq('id', '');
    if (error) throw new Error(error.message);
    setCloudBanners([]);
  }, [materializeDefaultsIfUnseeded]);

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
      if (error) throw new Error(error.message);
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
      if (!supabase || !isSupabaseConfigured) {
        setCloudCategories((prev) => prev.filter((c) => c.id !== safeId));
        return;
      }
      const { error } = await supabase.from('categories').delete().eq('id', safeId);
      if (error) throw new Error(error.message);
      setCloudCategories((prev) => prev.filter((c) => c.id !== safeId));
    },
    [materializeDefaultsIfUnseeded]
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
      if (error) throw new Error(error.message);
      setCloudSubpages((prev) => upsertItemInList(prev, next));
    },
    [categories, cloudCategories, materializeDefaultsIfUnseeded]
  );

  const deleteSubpage = useCallback(
    async (id: string) => {
      const safeId = sanitizeId(id);
      await materializeDefaultsIfUnseeded({ skipSubpageId: safeId });
      if (!supabase || !isSupabaseConfigured) {
        setCloudSubpages((prev) => prev.filter((s) => s.id !== safeId));
        return;
      }
      const { error } = await supabase.from('subpages').delete().eq('id', safeId);
      if (error) throw new Error(error.message);
      setCloudSubpages((prev) => prev.filter((s) => s.id !== safeId));
    },
    [materializeDefaultsIfUnseeded]
  );

  const upsertProduct = useCallback(
    async (prod: Omit<Product, 'createdAt' | 'updatedAt'>, isNew: boolean) => {
      const id = sanitizeId(prod.id);
      const categoryId = sanitizeId(prod.categoryId);
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
      if (error) throw new Error(error.message);
      setCloudProducts((prev) => upsertItemInList(prev, next, isNew));
    },
    [categories, cloudCategories, materializeDefaultsIfUnseeded]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const safeId = sanitizeId(id);
      await materializeDefaultsIfUnseeded({ skipProductId: safeId });
      if (!supabase || !isSupabaseConfigured) {
        setCloudProducts((prev) => prev.filter((p) => p.id !== safeId));
        return;
      }
      const { error } = await supabase.from('products').delete().eq('id', safeId);
      if (error) throw new Error(error.message);
      setCloudProducts((prev) => prev.filter((p) => p.id !== safeId));
    },
    [materializeDefaultsIfUnseeded]
  );

  const deleteAllProducts = useCallback(async () => {
    await materializeDefaultsIfUnseeded({ skipAllProducts: true });
    if (!supabase || !isSupabaseConfigured) {
      setCloudProducts([]);
      return;
    }
    const { error } = await supabase.from('products').delete().neq('id', '');
    if (error) throw new Error(error.message);
    setCloudProducts([]);
  }, [materializeDefaultsIfUnseeded]);

  const cleanAllProductsAndBanners = useCallback(async () => {
    await materializeDefaultsIfUnseeded({
      skipAllProducts: true,
      skipAllBanners: true,
    });
    if (!supabase || !isSupabaseConfigured) {
      setCloudProducts([]);
      setCloudBanners([]);
      return;
    }
    const [prodRes, banRes] = await Promise.all([
      supabase.from('products').delete().neq('id', ''),
      supabase.from('banners').delete().neq('id', ''),
    ]);
    if (prodRes.error) throw new Error(prodRes.error.message);
    if (banRes.error) throw new Error(banRes.error.message);
    setCloudProducts([]);
    setCloudBanners([]);
  }, [materializeDefaultsIfUnseeded]);

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
      if (error) throw new Error(error.message);
      setCloudCatalogs((prev) => upsertItemInList(prev, next, isNew));
    },
    [materializeDefaultsIfUnseeded]
  );

  const deleteCatalog = useCallback(
    async (id: string) => {
      const safeId = sanitizeId(id);
      await materializeDefaultsIfUnseeded({ skipCatalogId: safeId });
      if (!supabase || !isSupabaseConfigured) {
        setCloudCatalogs((prev) => prev.filter((c) => c.id !== safeId));
        return;
      }
      const { error } = await supabase.from('catalogs').delete().eq('id', safeId);
      if (error) throw new Error(error.message);
      setCloudCatalogs((prev) => prev.filter((c) => c.id !== safeId));
    },
    [materializeDefaultsIfUnseeded]
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
    if (error) throw new Error(error.message);
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
    if (error) throw new Error(error.message);
    setInquiries((prev) => prev.map((q) => (q.id === safeId ? { ...q, status } : q)));
  }, []);

  const clearAnalytics = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      clearLocalAnalyticsEvents();
      setAnalyticsEvents([]);
      return;
    }
    const { error } = await supabase.from('store_analytics').delete().neq('id', '');
    if (error) throw new Error(error.message);
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
        signOutOwnerGoogle,
        saveConfig,
        restoreDefaultConfigAndCatalog,
        seedMissingCatalog,
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
