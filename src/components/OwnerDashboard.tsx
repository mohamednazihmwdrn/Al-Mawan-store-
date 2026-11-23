import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  DollarSign,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Lock,
  LogIn,
  Mail,
  MessageCircle,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Trash2,
  Upload,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sanitizeId } from '../lib/imageUtils';
import { ADMIN_EMAIL, uploadImageAsset } from '../lib/supabase';
import { InquiryStatus, OrderStatus, OwnerTab, Product } from '../types/store';
import { OwnerBannersTab, OwnerCatalogsTab, OwnerCategoriesTab } from './owner/OwnerCatalogTabs';
import { OwnerBrandsFeaturesTab, OwnerSiteSettingsTab } from './owner/OwnerSettingsTab';
import { OwnerAnalyticsSection } from './owner/OwnerAnalyticsSection';
import { ConfirmActionModal } from './ConfirmActionModal';
import { GLC_ALL_PRODUCTS } from '../data/glcCatalog';

interface OwnerDashboardProps {
  onPreviewCustomer: () => void;
  onLockAndExit: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  onPreviewCustomer,
  onLockAndExit,
}) => {
  const {
    config,
    banners,
    categories,
    subpages,
    products,
    catalogs,
    orders,
    inquiries,
    analyticsEvents,
    isLiveSynced,
    isCloudConfigured,
    ownerUser,
    isVerifiedAdmin,
    signInOwnerGoogle,
    signInOwnerPassword,
    signInOwnerMagicLink,
    signUpOwnerPassword,
    sendOwnerPasswordReset,
    signOutOwnerGoogle,
    seedMissingCatalog,
    importGlcCatalogProducts,
    upsertProduct,
    deleteProduct,
    deleteAllProducts,
    cleanAllProductsAndBanners,
    updateOrderStatus,
    updateInquiryStatus,
    clearAnalytics,
  } = useStore();

  const [activeTab, setActiveTab] = useState<OwnerTab>('overview');
  const [toastMsg, setToastMsg] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [importingGlc, setImportingGlc] = useState(false);
  const [showCloudLogin, setShowCloudLogin] = useState(false);
  const [authEmail, setAuthEmail] = useState(ADMIN_EMAIL);
  const [authPass, setAuthPass] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Destructive root action confirmation modal state
  const [confirmKind, setConfirmKind] = useState<'clean_all' | 'delete_all_products' | 'delete_product' | null>(null);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Order & inquiry filters
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [inquiryFilter, setInquiryFilter] = useState<'all' | InquiryStatus>('all');

  // Product management form & filters
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pOldPrice, setPOldPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pUnit, setPUnit] = useState('');
  const [pSizes, setPSizes] = useState('');
  const [pSpecs, setPSpecs] = useState('');
  const [pBadge, setPBadge] = useState('');
  const [pCategoryId, setPCategoryId] = useState(categories[0]?.id || 'cat_glc');
  const [pSubpageId, setPSubpageId] = useState('');
  const [pBrandName, setPBrandName] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pGallery, setPGallery] = useState<string[]>([]);
  const [pExtraUrl, setPExtraUrl] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pAvailable, setPAvailable] = useState(true);
  const [pSaving, setPSaving] = useState(false);

  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('all');
  const [prodViewMode, setProdViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    if (categories.length === 0) {
      if (pCategoryId !== '') setPCategoryId('');
      return;
    }
    if (!categories.some((c) => c.id === pCategoryId)) {
      setPCategoryId(categories[0].id);
      setPSubpageId('');
    }
  }, [categories, pCategoryId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (isCloudConfigured && !isVerifiedAdmin && msg.includes('تسجيل دخول السحابة')) {
      setShowCloudLogin(true);
    }
    window.setTimeout(() => setToastMsg(''), 5000);
  };

  const requestCleanEntireSite = () => {
    setTargetProduct(null);
    setConfirmKind('clean_all');
  };

  const requestDeleteAllProducts = () => {
    setTargetProduct(null);
    setConfirmKind('delete_all_products');
  };

  const requestDeleteSingleProduct = (prod: Product) => {
    setTargetProduct(prod);
    setConfirmKind('delete_product');
  };

  const executeConfirmedAction = async () => {
    if (!confirmKind) return;
    setConfirmLoading(true);
    try {
      if (confirmKind === 'clean_all') {
        await cleanAllProductsAndBanners();
        resetProductForm();
        showToast('تم تنظيف الموقع بالكامل وحذف جميع المنتجات والبنرات والكتالوجات نهائياً!');
      } else if (confirmKind === 'delete_all_products') {
        await deleteAllProducts();
        resetProductForm();
        showToast('تم حذف جميع المنتجات نهائياً من المتجر وقاعدة البيانات!');
      } else if (confirmKind === 'delete_product' && targetProduct) {
        await deleteProduct(targetProduct.id);
        if (editingProductId === targetProduct.id) {
          resetProductForm();
        }
        showToast(`تم حذف "${targetProduct.name}" نهائياً من المتجر والعملاء.`);
      }
      setConfirmKind(null);
      setTargetProduct(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'تعذر تنفيذ الحذف النهائي');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      await seedMissingCatalog();
      showToast('تمت تهيئة إعدادات المتجر والأقسام الأساسية بنجاح!');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'تعذر تهيئة الأقسام');
    } finally {
      setSeeding(false);
    }
  };

  const handleImportGlc32 = async () => {
    setImportingGlc(true);
    try {
      const addedCount = await importGlcCatalogProducts();
      if (addedCount > 0) {
        showToast(`تم نشر ${addedCount} منتج من تشكيلة GLC داخل قسم "منتجات GLC" (الأسعار مفتوحة للتعديل).`);
      } else {
        showToast(`جميع منتجات GLC الـ ${GLC_ALL_PRODUCTS.length} مضافة بالفعل في قسم "منتجات GLC".`);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'تعذر استيراد منتجات GLC');
    } finally {
      setImportingGlc(false);
    }
  };

  const handleMainImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPImageUrl(await uploadImageAsset(file, 'products', 1080, 0.78));
      showToast('تم تجهيز ورفع صورة المنتج بنجاح');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'تعذر رفع الصورة');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length === 0) return;

    const remaining = Math.max(0, 6 - pGallery.length);
    if (remaining === 0) {
      showToast('الحد الأقصى للصور الإضافية هو 6 صور لكل منتج.');
      return;
    }

    const uploaded: string[] = [];
    for (const file of files.slice(0, remaining)) {
      try {
        uploaded.push(await uploadImageAsset(file, 'products', 960, 0.75));
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'تعذر رفع الصورة الإضافية');
      }
    }
    if (uploaded.length > 0) {
      setPGallery((prev) => [...prev, ...uploaded].slice(0, 6));
      showToast(`تم رفع ${uploaded.length} صورة إضافية بنجاح`);
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setPName('');
    setPPrice('');
    setPOldPrice('');
    setPStock('');
    setPUnit('');
    setPSizes('');
    setPSpecs('');
    setPBadge('');
    setPCategoryId(categories[0]?.id || 'cat_glc');
    setPSubpageId('');
    setPBrandName('');
    setPImageUrl('');
    setPGallery([]);
    setPExtraUrl('');
    setPDesc('');
    setPAvailable(true);
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setPName(prod.name);
    setPPrice(prod.price !== null ? String(prod.price) : '');
    setPOldPrice(prod.oldPrice !== null ? String(prod.oldPrice) : '');
    setPStock(prod.stock !== null ? String(prod.stock) : '');
    setPUnit(prod.unit || '');
    setPSizes(prod.sizes || '');
    setPSpecs(prod.specs || '');
    setPBadge(prod.badge || '');
    setPCategoryId(prod.categoryId || categories[0]?.id || 'cat_glc');
    setPSubpageId(prod.subpageId || '');
    setPBrandName(prod.brandName || '');
    setPImageUrl(prod.imageUrl);
    setPGallery(prod.galleryImages || []);
    setPDesc(prod.description || '');
    setPAvailable(prod.available);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pImageUrl.trim()) {
      showToast('يرجى إدخال اسم المنتج واختيار صورته.');
      return;
    }
    setPSaving(true);
    try {
      const id = editingProductId || sanitizeId(`prod_${Date.now().toString(36)}`);
      const priceNum = pPrice.trim() ? Number(pPrice) : null;
      const oldPriceNum = pOldPrice.trim() ? Number(pOldPrice) : null;
      const stockNum = pStock.trim() ? Number(pStock) : null;

      await upsertProduct(
        {
          id,
          name: pName.trim(),
          description: pDesc.trim() || pName.trim(),
          price: Number.isFinite(priceNum) ? priceNum : null,
          oldPrice: Number.isFinite(oldPriceNum) ? oldPriceNum : null,
          stock: Number.isFinite(stockNum) ? stockNum : null,
          available: pAvailable,
          unit: pUnit.trim(),
          sizes: pSizes.trim(),
          specs: pSpecs.trim(),
          badge: pBadge.trim(),
          categoryId: pCategoryId || categories[0]?.id || '',
          subpageId: pSubpageId,
          brandName: pBrandName.trim(),
          imageUrl: pImageUrl.trim(),
          galleryImages: pGallery,
          isOffer: Boolean(oldPriceNum && priceNum && oldPriceNum > priceNum),
        },
        !editingProductId
      );
      showToast(
        editingProductId
          ? 'تم تحديث المنتج وظهوره فوراً للعملاء!'
          : 'تم نشر المنتج وإضافته للمتجر على جميع الأجهزة!'
      );
      resetProductForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'تعذر نشر المنتج');
    } finally {
      setPSaving(false);
    }
  };

  const confirmedSales = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0),
    [orders]
  );

  const filteredOrders = useMemo(
    () => (orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter)),
    [orders, orderFilter]
  );

  const filteredInquiries = useMemo(
    () =>
      inquiryFilter === 'all'
        ? inquiries
        : inquiries.filter((i) => i.status === inquiryFilter),
    [inquiries, inquiryFilter]
  );

  const filteredProducts = useMemo(() => {
    const q = prodSearch.trim().toLowerCase();
    return products.filter((p) => {
      if (prodCatFilter !== 'all' && p.categoryId !== prodCatFilter) return false;
      if (q) {
        const hay = `${p.name} ${p.description} ${p.brandName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, prodSearch, prodCatFilter]);

  const currentCatSubpages = useMemo(
    () => subpages.filter((s) => s.categoryId === pCategoryId),
    [subpages, pCategoryId]
  );

  const tabs: { id: OwnerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'الإحصائيات ونظرة عامة', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'orders', label: `طلبات العملاء (${orders.length})`, icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'inquiries', label: `استفسارات العملاء (${inquiries.length})`, icon: <Mail className="w-4 h-4" /> },
    { id: 'products', label: `إدارة المنتجات (${products.length})`, icon: <Package className="w-4 h-4" /> },
    { id: 'banners', label: `بنرات الواجهة (${banners.length})`, icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'categories', label: `الأقسام والصفحات الفرعية (${categories.length})`, icon: <Layers className="w-4 h-4" /> },
    { id: 'catalogs', label: `كتالوجات الألوان (${catalogs.length})`, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'brands', label: 'المميزات والماركات', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'settings', label: 'إعدادات ونصوص الموقع', icon: <Settings className="w-4 h-4" /> },
  ];

  const orderStatusLabels: Record<OrderStatus, string> = {
    new: 'جديد',
    preparing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };

  const inquiryStatusLabels: Record<InquiryStatus, string> = {
    new: 'جديد',
    replied: 'تم الرد',
    completed: 'مكتمل',
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Owner Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <img
                src="/pwa-192x192.png"
                alt={config.storeName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base sm:text-xl font-extrabold">لوحة تحكم مالك متجر الموان</h1>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isLiveSynced
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {isLiveSynced ? 'متصل بقاعدة البيانات مباشرة' : 'جاري المزامنة...'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{config.address}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onPreviewCustomer}
                className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs sm:text-sm font-bold text-white cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>معاينة كعميل</span>
              </button>
              <button
                type="button"
                onClick={onLockAndExit}
                className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs sm:text-sm font-bold text-white cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>قفل اللوحة والخروج</span>
              </button>
            </div>
          </div>

          {/* Clean Non-Blocking Owner Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 bg-slate-800/70 rounded-xl px-4 py-2.5">
            <span className="flex items-center gap-2 text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {!isCloudConfigured
                  ? 'لوحة الإدارة مفعّلة بالكامل — تعديلاتك محفوظة وتعمل مباشرة'
                  : isVerifiedAdmin
                    ? `متصل بقاعدة بيانات Supabase (${ownerUser?.email}) — المزامنة الفورية مفعلة`
                    : 'لوحة الإدارة جاهزة للعمل — متصلة بمشروع Supabase'}
              </span>
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={seeding}
                onClick={handleSeedDatabase}
                className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{seeding ? 'جاري التهيئة...' : 'تهيئة الأقسام الأساسية'}</span>
              </button>
              {isCloudConfigured && !isVerifiedAdmin && (
                <button
                  type="button"
                  onClick={() => setShowCloudLogin((v) => !v)}
                  className="text-slate-300 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  {showCloudLogin ? 'إخفاء دخول السحابة' : 'تسجيل دخول السحابة'}
                </button>
              )}
              {isCloudConfigured && ownerUser && (
                <button
                  type="button"
                  onClick={() => signOutOwnerGoogle()}
                  className="text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  تسجيل خروج
                </button>
              )}
            </div>
          </div>

          {isCloudConfigured && !isVerifiedAdmin && showCloudLogin && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!authEmail.trim() || !authPass) {
                  showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
                  return;
                }
                setAuthSubmitting(true);
                try {
                  await signInOwnerPassword(authEmail.trim(), authPass);
                  setAuthPass('');
                  setShowCloudLogin(false);
                  showToast('تم ربط جلسة السحابة بنجاح!');
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'تعذر تسجيل الدخول');
                } finally {
                  setAuthSubmitting(false);
                }
              }}
              className="rounded-xl bg-slate-800/80 border border-slate-700 p-3.5 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="البريد الإلكتروني للمالك"
                  className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white sm:w-56"
                />
                <input
                  type="password"
                  dir="ltr"
                  value={authPass}
                  onChange={(e) => setAuthPass(e.target.value)}
                  placeholder="كلمة المرور (أو استخدم رابط الإيميل)"
                  className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white sm:w-52"
                />
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/60 text-slate-950 px-4 py-2 text-xs font-extrabold cursor-pointer shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{authSubmitting ? 'جاري التحقق...' : 'دخول المالك'}</span>
                </button>
                <button
                  type="button"
                  disabled={authSubmitting}
                  onClick={async () => {
                    if (!authEmail.trim()) {
                      showToast('اكتب بريدك الإلكتروني أولاً.');
                      return;
                    }
                    setAuthSubmitting(true);
                    try {
                      await signInOwnerMagicLink(authEmail.trim());
                      showToast(
                        `تم إرسال رابط دخول فوري (بدون كلمة سر) إلى ${authEmail.trim()} — افتح رسائلك واضغط الرابط.`
                      );
                    } catch (err) {
                      showToast(err instanceof Error ? err.message : 'تعذر إرسال رابط الدخول');
                    } finally {
                      setAuthSubmitting(false);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold cursor-pointer shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>دخول برابط على الإيميل (بدون رقم سري)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    signInOwnerGoogle().catch((e) =>
                      showToast(e instanceof Error ? e.message : 'تعذر تسجيل الدخول عبر Google')
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 text-xs font-bold cursor-pointer shrink-0"
                >
                  <span>عبر Google</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 pt-1">
                <span>أول مرة تدخل أو نسيت كلمة المرور؟ اكتب البريد وكلمة مرور جديدة ثم اضغط:</span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={authSubmitting}
                    onClick={async () => {
                      if (!authEmail.trim() || !authPass) {
                        showToast('اكتب البريد الإلكتروني وكلمة المرور الجديدة (6+ أحرف) أولاً.');
                        return;
                      }
                      setAuthSubmitting(true);
                      try {
                        const loggedInNow = await signUpOwnerPassword(authEmail.trim(), authPass);
                        setAuthPass('');
                        if (loggedInNow) {
                          setShowCloudLogin(false);
                          showToast('تم إنشاء وتفعيل حساب المالك وتسجيل الدخول بنجاح!');
                        } else {
                          showToast(
                            `تم إرسال رسالة تأكيد الحساب إلى ${authEmail.trim()} — افتح البريد واضغط تأكيد لتدخل مباشرة.`
                          );
                        }
                      } catch (err) {
                        showToast(err instanceof Error ? err.message : 'تعذر إنشاء الحساب');
                      } finally {
                        setAuthSubmitting(false);
                      }
                    }}
                    className="text-amber-300 hover:underline font-bold cursor-pointer"
                  >
                    تسجيل كلمة مرور لأول مرة
                  </button>
                  <button
                    type="button"
                    disabled={authSubmitting}
                    onClick={async () => {
                      if (!authEmail.trim()) {
                        showToast('اكتب بريدك الإلكتروني أولاً.');
                        return;
                      }
                      setAuthSubmitting(true);
                      try {
                        await sendOwnerPasswordReset(authEmail.trim());
                        showToast(`تم إرسال رابط تغيير كلمة المرور إلى ${authEmail.trim()}.`);
                      } catch (err) {
                        showToast(err instanceof Error ? err.message : 'تعذر إرسال رابط الاستعادة');
                      } finally {
                        setAuthSubmitting(false);
                      }
                    }}
                    className="text-slate-300 hover:text-white hover:underline cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Scrollable Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] inline-flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl bg-slate-900 text-amber-300 px-4 py-3 text-sm font-bold shadow-md flex items-center justify-between"
            >
              <span>{toastMsg}</span>
              <button
                type="button"
                onClick={() => setToastMsg('')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                إغلاق
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
        {/* TAB 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500">إجمالي المبيعات المؤكدة</p>
                  <p className="font-mono-nums text-2xl font-extrabold text-emerald-700">
                    EGP {confirmedSales.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">من طلبات المتجر المباشرة</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500">إجمالي عدد الطلبات</p>
                  <p className="font-mono-nums text-2xl font-extrabold text-blue-700">
                    {orders.length} طلب
                  </p>
                  <p className="text-xs text-amber-600 font-semibold">
                    {orders.filter((o) => o.status === 'new').length} قيد المراجعة الفورية
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500">المنتجات المتوفرة</p>
                  <p className="font-mono-nums text-2xl font-extrabold text-indigo-700">
                    {products.length} صنف
                  </p>
                  <p className="text-xs text-slate-400">جاهزة للشحن والتسليم</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500">بنرات الواجهة النشطة</p>
                  <p className="font-mono-nums text-2xl font-extrabold text-amber-600">
                    {banners.filter((b) => b.active).length} بنر
                  </p>
                  <p className="text-xs text-slate-400">قابلة للإضافة والتعديل</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-6 space-y-4">
              <div className="space-y-1.5">
                <h2 className="text-xl font-extrabold">
                  مرحباً بك في لوحة تحكم {config.storeName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  العنوان المعتمد: {config.address} | هاتف: {config.phonePrimary}
                  {config.phoneSecondary ? ` - ${config.phoneSecondary}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-bold text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة صنف جديد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('banners')}
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-3 text-sm font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة بنر للواجهة</span>
                </button>
                {(products.length > 0 || banners.length > 0 || catalogs.length > 0) && (
                  <button
                    type="button"
                    onClick={requestCleanEntireSite}
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-sm font-bold cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>تنظيف الموقع بالكامل (حذف كل المنشورات)</span>
                  </button>
                )}
              </div>
            </div>

            <OwnerAnalyticsSection
              events={analyticsEvents}
              onClearAnalytics={clearAnalytics}
              onNotify={showToast}
            />
          </div>
        )}

        {/* TAB 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500">تصفية حسب الحالة:</span>
                {(
                  [
                    ['all', 'جميع الطلبات'],
                    ['new', 'جديد'],
                    ['preparing', 'قيد التجهيز'],
                    ['shipped', 'تم الشحن'],
                    ['delivered', 'تم التوصيل'],
                    ['cancelled', 'ملغي'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOrderFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      orderFilter === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono-nums font-bold text-slate-500">
                عدد الطلبات: {filteredOrders.length}
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center space-y-2 text-slate-500">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold">لا توجد طلبات تطابق الفلتر الحالي</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-mono-nums text-sm font-extrabold text-blue-700">
                          #{ord.orderNumber}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{ord.customerName}</h4>
                        <p className="text-xs text-slate-500">
                          هاتف: <span className="font-mono-nums">{ord.phone}</span> · {ord.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            updateOrderStatus(ord.id, e.target.value as OrderStatus)
                              .then(() => showToast('تم تحديث حالة الطلب بنجاح.'))
                              .catch((err) =>
                                showToast(err instanceof Error ? err.message : 'تعذر تحديث الطلب')
                              )
                          }
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold bg-slate-50"
                        >
                          {Object.entries(orderStatusLabels).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                        <a
                          href={`https://wa.me/${ord.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          title="مراسلة العميل واتساب"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-700">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {it.name} × {it.quantity}
                          </span>
                          <span className="font-mono-nums font-bold">
                            {(it.price * it.quantity).toFixed(2)} ج.م
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-sm font-bold">
                      <span className="text-xs text-slate-500">
                        الدفع:{' '}
                        {ord.paymentMethod === 'cod'
                          ? 'كاش عند الاستلام'
                          : ord.paymentMethod === 'instapay'
                            ? 'إنستاباي'
                            : 'فودافون كاش'}
                      </span>
                      <span className="font-mono-nums text-emerald-700">
                        الإجمالي: {ord.total.toFixed(2)} ج.م
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500">تصفية الاستفسارات:</span>
                {(
                  [
                    ['all', 'الكل'],
                    ['new', 'جديد'],
                    ['replied', 'تم الرد'],
                    ['completed', 'مكتمل'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInquiryFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      inquiryFilter === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono-nums font-bold text-slate-500">
                عدد الرسائل: {filteredInquiries.length}
              </span>
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center space-y-2 text-slate-500">
                <Mail className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold">لا توجد استفسارات تطابق الفلتر الحالي</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{inq.subject}</h4>
                        <p className="text-xs text-slate-500">
                          {inq.customerName} · <span className="font-mono-nums">{inq.phone}</span>
                          {inq.colorCode ? ` · كود اللون: ${inq.colorCode}` : ''}
                        </p>
                      </div>
                      <select
                        value={inq.status}
                        onChange={(e) =>
                          updateInquiryStatus(inq.id, e.target.value as InquiryStatus)
                            .then(() => showToast('تم تحديث حالة الاستفسار بنجاح.'))
                            .catch((err) =>
                              showToast(err instanceof Error ? err.message : 'تعذر تحديث الاستفسار')
                            )
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold bg-slate-50"
                      >
                        {Object.entries(inquiryStatusLabels).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 whitespace-pre-line">
                      {inq.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <form
              onSubmit={handleProductSubmit}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden"
            >
              <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-extrabold">
                    {editingProductId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
                  </h3>
                </div>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="text-xs font-bold text-amber-300 hover:underline cursor-pointer"
                  >
                    إلغاء التعديل وإضافة منتج جديد
                  </button>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700">اسم المنتج *</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="مثال: بلاستيك مطفي 3030 - 9 لتر، شنيور دقاق..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      السعر (جنيه — اختياري)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      placeholder="اتركه فارغاً: عند التواصل"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      السعر قبل الخصم (اختياري)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={pOldPrice}
                      onChange={(e) => setPOldPrice(e.target.value)}
                      placeholder="لإظهار عرض"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">القسم *</label>
                    <select
                      value={pCategoryId}
                      onChange={(e) => {
                        setPCategoryId(e.target.value);
                        setPSubpageId('');
                      }}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">العلامة التجارية</label>
                    <select
                      value={pBrandName}
                      onChange={(e) => setPBrandName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
                    >
                      <option value="">عام / غير محدد</option>
                      {config.brands.map((b) => (
                        <option key={b.id} value={b.code}>
                          {b.code} — {b.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      الصفحة الفرعية (اختياري)
                    </label>
                    <select
                      value={pSubpageId}
                      onChange={(e) => setPSubpageId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
                    >
                      <option value="">عام داخل القسم الرئيسي</option>
                      {currentCatSubpages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800">صورة المنتج الرئيسية *</span>
                    <label className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>اختر صورة من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImgUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={pImageUrl}
                    onChange={(e) => setPImageUrl(e.target.value)}
                    placeholder="https://... أو الصق رابط الصورة مباشرة"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-700">
                      صور إضافية للمنتج (اختياري)
                    </span>
                    <label className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 text-xs font-bold cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة صور من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pExtraUrl}
                      onChange={(e) => setPExtraUrl(e.target.value)}
                      placeholder="أو الصق رابط صورة إضافية..."
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (pExtraUrl.trim()) {
                          setPGallery((prev) => [...prev, pExtraUrl.trim()].slice(0, 6));
                          setPExtraUrl('');
                        }
                      }}
                      className="rounded-xl bg-slate-200 hover:bg-slate-300 px-4 py-2 text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      إضافة
                    </button>
                  </div>
                  {pGallery.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-1">
                      {pGallery.map((imgUrl, idx) => (
                        <div key={idx} className="relative w-16 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white">
                          <img
                            src={imgUrl}
                            alt={`صورة إضافية ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPGallery((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-950/80 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
                            aria-label="حذف الصورة الإضافية"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    الوصف والتفاصيل الكاملة للمنتج (اختياري)
                  </label>
                  <textarea
                    rows={7}
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="اكتب وصفاً تفصيلياً لمواصفات، مميزات، وطريقة استخدام المنتج..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm leading-relaxed"
                  />
                </div>

                {/* Extra Options */}
                <details className="rounded-xl border border-slate-200 p-3.5 bg-slate-50">
                  <summary className="text-xs font-bold text-slate-700 cursor-pointer">
                    خيارات إضافية (المخزون، الوحدة، المقاسات، شارات العرض، المواصفات)
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                    <input
                      type="number"
                      value={pStock}
                      onChange={(e) => setPStock(e.target.value)}
                      placeholder="العدد بالمخزن (اتركه فارغاً: متوفر)"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono-nums"
                    />
                    <input
                      type="text"
                      value={pUnit}
                      onChange={(e) => setPUnit(e.target.value)}
                      placeholder="الوحدة (مثال: بستلة 14 كجم)"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={pSizes}
                      onChange={(e) => setPSizes(e.target.value)}
                      placeholder="المقاسات المتاحة (مثال: 5 كجم / 14 كجم)"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={pBadge}
                      onChange={(e) => setPBadge(e.target.value)}
                      placeholder="شارة العرض (مثال: الأكثر مبيعاً)"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={pSpecs}
                      onChange={(e) => setPSpecs(e.target.value)}
                      placeholder="المواصفات المختصرة"
                      className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                </details>

                <button
                  type="submit"
                  disabled={pSaving}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 text-sm font-extrabold cursor-pointer"
                >
                  {pSaving
                    ? 'جاري النشر الفوري...'
                    : editingProductId
                      ? 'حفظ تعديلات المنتج ونشرها فوراً'
                      : 'نشر المنتج وإضافته للمتجر'}
                </button>
              </div>
            </form>

            {/* Product List Toolbar */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  المنتجات المعروضة بالمتجر ({filteredProducts.length})
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setProdViewMode('cards')}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        prodViewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>بطاقات</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdViewMode('table')}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        prodViewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>جدول</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={importingGlc}
                    onClick={handleImportGlc32}
                    className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 disabled:opacity-60 text-amber-900 px-3 py-2 text-xs font-extrabold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{importingGlc ? 'جاري استيراد GLC...' : 'استيراد تشكيلة GLC (41 منتج)'}</span>
                  </button>
                  {products.length > 0 && (
                    <button
                      type="button"
                      onClick={requestDeleteAllProducts}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف جميع المنتجات</span>
                    </button>
                  )}
                  {(products.length > 0 || banners.length > 0 || catalogs.length > 0) && (
                    <button
                      type="button"
                      onClick={requestCleanEntireSite}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 text-xs font-extrabold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>تنظيف الموقع بالكامل</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو الوصف أو الماركة..."
                    className="w-full rounded-xl border border-slate-200 pr-10 pl-4 py-2.5 text-sm"
                  />
                </div>
                <select
                  value={prodCatFilter}
                  onChange={(e) => setProdCatFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
                >
                  <option value="all">جميع الأقسام ({products.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {prodViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="aspect-[4/3] rounded-xl bg-white border border-slate-100 overflow-hidden">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-1.5"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-500">{p.brandName || 'عام'}</span>
                          <span className={p.available ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                            {p.available ? 'متوفر' : 'غير متوفر'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                        <p className="font-mono-nums text-sm font-extrabold text-rose-600">
                          {p.price !== null ? `EGP ${p.price.toFixed(2)}` : 'عند التواصل'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => startEditProduct(p)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs font-bold cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            upsertProduct({ ...p, available: !p.available }, false).catch((err) =>
                              showToast(err instanceof Error ? err.message : 'تعذر تحديث الحالة')
                            );
                          }}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                        >
                          {p.available ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{p.available ? 'إخفاء' : 'إتاحة'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteSingleProduct(p)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                          aria-label={`حذف ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="border-b border-slate-200 text-xs text-slate-500">
                      <tr>
                        <th className="py-3 px-2">المنتج</th>
                        <th className="py-3 px-2">الماركة</th>
                        <th className="py-3 px-2">السعر</th>
                        <th className="py-3 px-2">الحالة</th>
                        <th className="py-3 px-2">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 px-2 font-bold">{p.name}</td>
                          <td className="py-3 px-2 text-slate-600">{p.brandName || '-'}</td>
                          <td className="py-3 px-2 font-mono-nums font-bold">
                            {p.price !== null ? `${p.price.toFixed(2)} ج.م` : 'عند التواصل'}
                          </td>
                          <td className="py-3 px-2">{p.available ? 'متوفر' : 'غير متوفر'}</td>
                          <td className="py-3 px-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditProduct(p)}
                              className="text-blue-600 font-bold text-xs cursor-pointer"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDeleteSingleProduct(p)}
                              className="text-red-600 font-bold text-xs cursor-pointer"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'banners' && <OwnerBannersTab requireAuthToast={showToast} />}
        {activeTab === 'categories' && <OwnerCategoriesTab requireAuthToast={showToast} />}
        {activeTab === 'catalogs' && <OwnerCatalogsTab requireAuthToast={showToast} />}
        {activeTab === 'brands' && <OwnerBrandsFeaturesTab requireAuthToast={showToast} />}
        {activeTab === 'settings' && <OwnerSiteSettingsTab requireAuthToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <ConfirmActionModal
        isOpen={confirmKind !== null}
        title={
          confirmKind === 'clean_all'
            ? 'تنظيف الموقع بالكامل نهائياً'
            : confirmKind === 'delete_all_products'
              ? 'حذف جميع المنتجات نهائياً'
              : 'حذف المنتج نهائياً'
        }
        description={
          confirmKind === 'clean_all'
            ? `سيتم حذف جميع المنتجات (${products.length} منتج) وجميع البنرات (${banners.length} بنر) والكتالوجات (${catalogs.length}) من جذور قاعدة البيانات فوراً، ولن تظهر لأي عميل حتى تضيف منشورات جديدة.`
            : confirmKind === 'delete_all_products'
              ? `سيتم حذف جميع المنتجات (${products.length} منتج) نهائياً من الموقع وقاعدة البيانات لجميع العملاء على كافة الأجهزة.`
              : `هل أنت متأكد من حذف "${targetProduct?.name || ''}" نهائياً من قاعدة البيانات؟ سيختفي فورياً عند جميع العملاء.`
        }
        confirmLabel={
          confirmKind === 'clean_all'
            ? 'نعم، نظّف الموقع بالكامل'
            : confirmKind === 'delete_all_products'
              ? 'نعم، احذف كل المنتجات'
              : 'نعم، احذف نهائياً'
        }
        loading={confirmLoading}
        onConfirm={executeConfirmedAction}
        onClose={() => {
          setConfirmKind(null);
          setTargetProduct(null);
        }}
      />
    </div>
  );
};
