import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  Clock,
  CreditCard,
  Eye,
  Headphones,
  Home,
  LayoutGrid,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { trackAnalyticsEvent } from '../lib/analytics';
import { Banner, Product, StoreFeature, StorefrontPage } from '../types/store';
import { ColorStudioBrand } from './GlcColorStudioPage';
import { PWAInstallButton } from './PWAInstallButton';

interface StorefrontProps {
  activePage: StorefrontPage;
  selectedCategoryId: string;
  selectedSubpageId: string;
  offersOnly: boolean;
  selectedBrandCode: string;
  onSelectPage: (page: StorefrontPage) => void;
  onBack: () => void;
  onOpenProduct: (product: Product) => void;
  onOpenColorStudio: () => void;
  onOpenGlcColors: (brand?: ColorStudioBrand) => void;
  onOpenCart: () => void;
  onSelectCategoryFilter: (categoryId: string, subpageId?: string, navigateToCategories?: boolean) => void;
  onToggleOffersOnly: () => void;
  onResetFilters: () => void;
  onSelectBrandCode: (brandCode: string) => void;
}

const GLC_PREVIEW_CHIPS = [
  { code: 'N03000', hex: '#F7F4F0' },
  { code: 'Y05020', hex: '#F6F0E4' },
  { code: 'Y21010', hex: '#E9D8B7' },
  { code: 'Y31510', hex: '#DEC8AB' },
  { code: 'Y70515', hex: '#FCD5C3' },
  { code: 'B12020', hex: '#90B5BF' },
  { code: 'G32020', hex: '#ACBF9C' },
  { code: 'R10200', hex: '#ECBAB9' },
] as const;

const JOTUN_PREVIEW_CHIPS = [
  { code: '7627', name: 'ريفرش', hex: '#CACFC3' },
  { code: '1001', name: 'إغّ وايت', hex: '#EFEDE3' },
  { code: '1622', name: 'رفلكشن', hex: '#EBE9E2' },
  { code: '1024', name: 'تايملس', hex: '#E0DDD3' },
  { code: '10679', name: 'واشد لينن', hex: '#C9C3B6' },
  { code: '12078', name: 'كمفرت غراي', hex: '#BEB9AF' },
  { code: '8281', name: 'بايل لندين', hex: '#C7C6B6' },
  { code: '4477', name: 'دكو بلو', hex: '#525C64' },
] as const;

const SIPES_PREVIEW_CHIPS = [
  { code: 'S089', name: 'بلاستيك فاتح', hex: '#FEEFCB' },
  { code: '936', name: 'بيج إنامل', hex: '#DFD1C0' },
  { code: '952', name: 'تركواز', hex: '#B3D5C3' },
  { code: '684 FMC', name: 'جرافيـاتو رملي', hex: '#CCC4AA' },
  { code: 'S 4469', name: 'دوكو سماوي', hex: '#539ECF' },
  { code: '1220 (BLUE)', name: 'إيبوكسي مسابح', hex: '#0098D6' },
  { code: 'S 6575', name: 'دوكو برتقالي', hex: '#E34521' },
  { code: 'YELLOW', name: 'تخطيط طرق', hex: '#E7900E' },
] as const;

const SAVETO_PREVIEW_CHIPS = [
  { code: 'SAV-C01', name: 'أبيض خشن 3مم', hex: '#F3F1EC' },
  { code: 'SAV-C03', name: 'حجر رملي خشن', hex: '#DFCFAF' },
  { code: 'SAV-C07', name: 'تيراكوتا خشن', hex: '#C8895F' },
  { code: 'SAV-M06', name: 'أوكر متوسط 2مم', hex: '#CE9F73' },
  { code: 'SAV-M11', name: 'رمادي متوسط 2مم', hex: '#9A9D9C' },
  { code: 'SAV-F02', name: 'ساحلي ناعم 1مم', hex: '#EAE3D3' },
  { code: 'SAV-F08', name: 'زيتوني ناعم 1مم', hex: '#8E937B' },
  { code: 'SAV-C10', name: 'أردوازي خشن', hex: '#747978' },
] as const;

const SCIB_PREVIEW_CHIPS = [
  { code: 'L181', name: 'White Sugar', hex: '#E7ECEB' },
  { code: '9436', name: 'Air Breeze', hex: '#F3EDE8' },
  { code: '8620', name: 'White Clay', hex: '#F3E3D7' },
  { code: '7300', name: 'Jet Stream', hex: '#E2E8E5' },
  { code: 'L139', name: 'Blush', hex: '#F7EBE0' },
  { code: '7348', name: 'Spring Dew', hex: '#E0EAE6' },
  { code: '5184', name: 'Macadamia', hex: '#F0E5D6' },
  { code: '7156', name: 'Lavender Lace', hex: '#ECE6E4' },
] as const;

const CMB_PREVIEW_CHIPS = [
  { code: '347', name: 'كراميل مارمكس', hex: '#A95F2B' },
  { code: '642', name: 'برتقالي S40', hex: '#F36F21' },
  { code: '022', name: 'أوكر مارمكس', hex: '#C69024' },
  { code: '421', name: 'أحمر S40', hex: '#DA2128' },
  { code: '466', name: 'رويال بلو', hex: '#023F88' },
  { code: 'CMB 11', name: 'ألواني زمردي', hex: '#009D46' },
  { code: 'KEMA-GR-SD', name: 'كيما جرافياتو رملي', hex: '#DFCFAF' },
  { code: 'CASHO', name: 'كاشو ذهبي', hex: '#C29B4E' },
] as const;

function FeatureIcon({ icon }: { icon: StoreFeature['icon'] }) {
  switch (icon) {
    case 'credit-card':
      return <CreditCard className="w-5 h-5" />;
    case 'truck':
      return <Truck className="w-5 h-5" />;
    case 'headphones':
      return <Headphones className="w-5 h-5" />;
    case 'award':
      return <Award className="w-5 h-5" />;
    case 'palette':
      return <Palette className="w-5 h-5" />;
    default:
      return <ShieldCheck className="w-5 h-5" />;
  }
}

export const Storefront: React.FC<StorefrontProps> = ({
  activePage,
  selectedCategoryId,
  selectedSubpageId,
  offersOnly,
  selectedBrandCode,
  onSelectPage,
  onBack,
  onOpenProduct,
  onOpenColorStudio,
  onOpenGlcColors,
  onOpenCart,
  onSelectCategoryFilter,
  onToggleOffersOnly,
  onResetFilters,
  onSelectBrandCode,
}) => {
  const {
    config,
    banners,
    categories,
    subpages,
    products,
    cart,
    addToCart,
    submitInquiry,
  } = useStore();

  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const bannerTouchStartXRef = useRef<number | null>(null);

  // Inquiry form state
  const [inqName, setInqName] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqSubject, setInqSubject] = useState('');
  const [inqMessage, setInqMessage] = useState('');
  const [inqSending, setInqSending] = useState(false);
  const [inqSuccess, setInqSuccess] = useState(false);
  const [inqError, setInqError] = useState('');

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const activeBanners = useMemo(
    () => banners.filter((b) => b.active),
    [banners]
  );

  const safeBannerIndex =
    activeBanners.length > 0 ? bannerIndex % activeBanners.length : 0;
  const currentBanner = activeBanners[safeBannerIndex];

  useEffect(() => {
    if (activePage !== 'home' || activeBanners.length <= 1 || isBannerPaused) {
      return;
    }
    const timer = window.setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [activePage, activeBanners.length, isBannerPaused]);

  const homeCategorySections = useMemo(() => {
    const knownCategoryIds = new Set(categories.map((c) => c.id));
    const grouped = categories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        items: products.filter((p) => p.categoryId === cat.id),
      }))
      .filter((section) => section.items.length > 0);

    const orphanItems = products.filter((p) => !knownCategoryIds.has(p.categoryId));
    if (orphanItems.length > 0) {
      grouped.push({
        id: 'other',
        name: 'منتجات أخرى',
        items: orphanItems,
      });
    }
    return grouped;
  }, [categories, products]);

  const categorySubpages = useMemo(
    () =>
      selectedCategoryId === 'all'
        ? []
        : subpages.filter((s) => s.categoryId === selectedCategoryId),
    [subpages, selectedCategoryId]
  );

  const filteredCategoryProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) return false;
      if (selectedSubpageId !== 'all' && p.subpageId !== selectedSubpageId) return false;
      if (offersOnly && !p.isOffer) return false;
      if (q) {
        const hay = `${p.name} ${p.description} ${p.brandName} ${p.specs}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, selectedCategoryId, selectedSubpageId, offersOnly, searchQuery]);

  const brandProducts = useMemo(() => {
    if (!selectedBrandCode) return [];
    const needle = selectedBrandCode.trim().toLowerCase();
    return products.filter((p) =>
      `${p.brandName} ${p.name} ${p.specs}`.toLowerCase().includes(needle)
    );
  }, [products, selectedBrandCode]);

  const navigatePage = (page: StorefrontPage) => {
    onSelectPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBannerAction = (banner: Banner) => {
    if (banner.actionType === 'none') return;
    if (banner.actionType === 'color_studio') {
      onOpenColorStudio();
      return;
    }
    if (banner.actionType === 'whatsapp') {
      const msg = encodeURIComponent(`مرحباً، أستفسر عن عرض: ${banner.title}`);
      window.open(
        `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${msg}`,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }
    if (banner.actionType === 'category' && banner.actionTarget) {
      onSelectCategoryFilter(banner.actionTarget, 'all', true);
    }
  };

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1200);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inqName.trim().length < 2 || inqPhone.trim().length < 6 || inqMessage.trim().length < 2) {
      setInqError('يرجى كتابة الاسم ورقم الهاتف وتفاصيل الاستفسار.');
      return;
    }
    setInqError('');
    setInqSending(true);
    try {
      await submitInquiry({
        customerName: inqName.trim(),
        phone: inqPhone.trim(),
        subject: inqSubject.trim() || 'استفسار عام من الموقع',
        message: inqMessage.trim(),
        colorCode: '',
      });
      setInqSuccess(true);
      setInqName('');
      setInqPhone('');
      setInqSubject('');
      setInqMessage('');
      window.setTimeout(() => setInqSuccess(false), 5000);
    } catch {
      setInqError('تعذر إرسال الرسالة حالياً، يمكنك مراسلتنا مباشرة على واتساب.');
    } finally {
      setInqSending(false);
    }
  };

  const whatsappBase = `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`;

  const featureColorClasses: Record<StoreFeature['color'], string> = {
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    slate: 'bg-slate-100 text-slate-800',
  };

  const renderProductCard = (product: Product, extraClassName = '') => {
    const catName =
      categories.find((c) => c.id === product.categoryId)?.name || 'منتجات المتجر';
    const isAdded = addedId === product.id;

    return (
      <motion.div
        key={product.id}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18 }}
        className={`mowan-product-shell group flex flex-col ${extraClassName}`.trim()}
      >
        <article className="mowan-product-core bg-white flex-1 flex flex-col justify-between h-full">
          {/* 4:3 Chamfered Image Frame */}
          <div
            onClick={() => onOpenProduct(product)}
            className="mowan-product-media relative aspect-[4/3] bg-white overflow-hidden cursor-pointer"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {product.badge && (
              <div className="absolute bottom-0 right-0 bg-slate-950/90 text-amber-300 px-2.5 py-1 text-[10px] sm:text-xs font-bold tracking-tight border-t border-l border-amber-400/50">
                {product.badge}
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenProduct(product);
              }}
              className="absolute bottom-2 left-2 min-w-[36px] min-h-[36px] sm:min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-950/80 text-white px-2 sm:px-3 py-1.5 text-xs font-semibold backdrop-blur-xs hover:bg-slate-900 cursor-pointer"
              aria-label={`عرض تفاصيل ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">التفاصيل الكاملة</span>
            </button>
          </div>

          {/* Card Details */}
          <div className="p-2.5 min-[400px]:p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
            <div className="space-y-1 sm:space-y-1.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] min-[400px]:text-[11px] sm:text-xs text-slate-500 truncate">
                <span className="hidden sm:inline truncate">{catName}</span>
                {product.brandName && (
                  <>
                    <span className="hidden sm:inline" aria-hidden="true">·</span>
                    <span className="font-bold text-slate-700 shrink-0">{product.brandName}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span
                  className={`shrink-0 font-semibold ${
                    product.available ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {product.available ? 'متوفر' : 'غير متوفر'}
                </span>
              </div>

              <h3
                onClick={() => onOpenProduct(product)}
                className="text-[13px] min-[400px]:text-sm sm:text-base font-extrabold text-slate-900 leading-snug line-clamp-2 min-h-[2.3rem] sm:min-h-[2.75rem] cursor-pointer hover:text-blue-700 transition-colors"
              >
                {product.name}
              </h3>

              <p className="hidden min-[420px]:line-clamp-1 sm:line-clamp-2 text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                {product.price !== null ? (
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="font-mono-nums text-sm min-[400px]:text-base sm:text-lg font-extrabold text-slate-900">
                      {product.price.toFixed(0)}{' '}
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-600">
                        ج.م
                      </span>
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="font-mono-nums text-[10px] sm:text-xs text-slate-400 line-through">
                        {product.oldPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-blue-700">
                    السعر عند التواصل
                  </span>
                )}
                {product.unit && (
                  <span className="text-[10px] sm:text-xs text-slate-400 truncate max-w-full">
                    {product.unit}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  disabled={!product.available}
                  onClick={() => handleQuickAdd(product)}
                  className={`flex-1 min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 text-[11px] min-[400px]:text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">تمت الإضافة</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">أضف للسلة</span>
                    </>
                  )}
                </button>

                <a
                  href={`${whatsappBase}?text=${encodeURIComponent(
                    `مرحباً، أرغب في طلب: ${product.name}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackAnalyticsEvent({
                      eventType: 'whatsapp_click',
                      targetId: product.id,
                      targetLabel: product.name,
                    })
                  }
                  className="w-11 h-11 shrink-0 mowan-btn-bevel border border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                  aria-label={`طلب ${product.name} عبر واتساب`}
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </article>
      </motion.div>
    );
  };

  const renderPageBackBar = (title: string, subtitle?: string) => (
    <div className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-2xl font-extrabold text-white">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-slate-300">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs sm:text-sm font-bold text-amber-400 transition-colors cursor-pointer shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للصفحة السابقة</span>
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        {/* Slim optional announcement bar */}
        {config.announcementBar && !announcementDismissed && (
          <div className="bg-amber-400 text-slate-950 min-h-9 py-1.5 px-9 flex items-center justify-center relative text-xs sm:text-sm font-bold">
            <span className="truncate max-w-4xl text-center">{config.announcementBar}</span>
            <button
              type="button"
              onClick={() => setAnnouncementDismissed(true)}
              className="absolute left-2 p-1.5 rounded hover:bg-amber-500/30 cursor-pointer"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ================================================================
              PAGE 1: HOME — Pure Banners + Products Showcase (No Clutter)
             ================================================================ */}
          {activePage === 'home' && (
            <motion.div
              key="page-home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {/* Pure Full-Scale Auto-Advancing Horizontal Banners (no arrows, no text overlay) */}
              {config.visibility.hero && currentBanner && (
                <section
                  id="hero-section"
                  className="bg-slate-900 text-white overflow-x-clip"
                  onMouseEnter={() => setIsBannerPaused(true)}
                  onMouseLeave={() => setIsBannerPaused(false)}
                  onTouchStart={(e) => {
                    setIsBannerPaused(true);
                    bannerTouchStartXRef.current = e.touches[0]?.clientX ?? null;
                  }}
                  onTouchEnd={(e) => {
                    const startX = bannerTouchStartXRef.current;
                    const endX = e.changedTouches[0]?.clientX ?? null;
                    bannerTouchStartXRef.current = null;
                    if (
                      startX !== null &&
                      endX !== null &&
                      activeBanners.length > 1 &&
                      Math.abs(endX - startX) > 40
                    ) {
                      if (endX < startX) {
                        setBannerIndex((prev) => (prev + 1) % activeBanners.length);
                      } else {
                        setBannerIndex(
                          (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                        );
                      }
                    }
                    setIsBannerPaused(false);
                  }}
                >
                  <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={currentBanner.id}
                        initial={{ opacity: 0.35, x: -48 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0.35, x: 48 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="mowan-banner-shell w-full"
                      >
                        <div className="mowan-banner-core relative w-full bg-slate-950 overflow-hidden">
                          <img
                            src={currentBanner.imageUrl}
                            alt={currentBanner.title || config.storeName}
                            referrerPolicy="no-referrer"
                            onClick={() => handleBannerAction(currentBanner)}
                            className={`w-full h-auto block select-none ${
                              currentBanner.actionType !== 'none' ? 'cursor-pointer' : ''
                            }`}
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {/* Category Name + Horizontal Scrolling Products Directly Below Banner */}
              <section
                id="products-section"
                className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8"
              >
                {products.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-3">
                    <p className="text-base font-bold text-slate-800">
                      لا توجد منتجات منشورة بالمتجر حالياً
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                      يتم الآن تحديث التشكيلة وإضافة منتجات جديدة — يمكنك التواصل معنا عبر واتساب أو طلب خلط الألوان بالكمبيوتر.
                    </p>
                  </div>
                ) : (
                  homeCategorySections.map((section) => (
                    <div key={section.id} className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-2.5 min-w-0">
                          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 truncate">
                            {section.name}
                          </h2>
                          <span className="font-mono-nums text-xs text-slate-500 shrink-0">
                            {section.items.length} منتج
                          </span>
                        </div>
                        {section.id !== 'other' && (
                          <button
                            type="button"
                            onClick={() => {
                              trackAnalyticsEvent({
                                eventType: 'category_view',
                                targetId: section.id,
                                targetLabel: section.name,
                              });
                              onSelectCategoryFilter(section.id, 'all', true);
                            }}
                            className="min-h-[44px] inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 px-2 shrink-0 cursor-pointer transition-colors"
                          >
                            <span>عرض القسم</span>
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-stretch gap-3 sm:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                        {section.items.map((product) =>
                          renderProductCard(
                            product,
                            'w-[72vw] min-[400px]:w-[58vw] sm:w-[290px] lg:w-[310px] shrink-0 snap-start'
                          )
                        )}
                      </div>

                      {section.id === 'cat_glc' && config.visibility.colorStudio && (
                        <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-bold text-amber-400">
                              GLC PAINTS · تلوين بالكمبيوتر · 132 لون من كارتيلا بلاتين
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">
                              استعرض جميع ألوان GLC بأكوادها وجرّبها مباشرة على الحائط
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              {GLC_PREVIEW_CHIPS.map((chip) => (
                                <button
                                  key={chip.code}
                                  type="button"
                                  onClick={() => onOpenGlcColors('glc')}
                                  title={`معاينة لون GLC ${chip.code} على الحائط`}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer shrink-0"
                                  style={{ backgroundColor: chip.hex }}
                                  aria-label={`معاينة لون GLC ${chip.code}`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenGlcColors('glc')}
                              className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                            >
                              <Palette className="w-4 h-4" />
                              <span>معاينة الحائط وأكواد GLC</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'cat_jotun' && config.visibility.colorStudio && (
                        <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-bold text-amber-400">
                              JOTUN EGYPT · تلوين بالكمبيوتر · 994 لون جوتن داخلي معتمد
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">
                              استعرض ألوان جوتن (JOTUN) بأكوادها وجرّبها مباشرة على الحائط
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              {JOTUN_PREVIEW_CHIPS.map((chip) => (
                                <button
                                  key={chip.code}
                                  type="button"
                                  onClick={() => onOpenGlcColors('jotun')}
                                  title={`معاينة جوتن ${chip.code} (${chip.name}) على الحائط`}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer shrink-0"
                                  style={{ backgroundColor: chip.hex }}
                                  aria-label={`معاينة جوتن ${chip.code} ${chip.name}`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenGlcColors('jotun')}
                              className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                            >
                              <Palette className="w-4 h-4" />
                              <span>معاينة الحائط وأكواد جوتن</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'cat_sipes' && config.visibility.colorStudio && (
                        <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-bold text-amber-400">
                              SIPES PAINTS · 344 لون · بلاستيك · لاكيه · جرافيـاتو · دوكو NC · إيبوكسي · طرق
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">
                              استعرض جميع أقسام وألوان سايبس (SIPES) بأكوادها وجرّبها على الحائط
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              {SIPES_PREVIEW_CHIPS.map((chip) => (
                                <button
                                  key={chip.code}
                                  type="button"
                                  onClick={() => onOpenGlcColors('sipes')}
                                  title={`معاينة سايبس ${chip.code} (${chip.name}) على الحائط`}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer shrink-0"
                                  style={{ backgroundColor: chip.hex }}
                                  aria-label={`معاينة سايبس ${chip.code} ${chip.name}`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenGlcColors('sipes')}
                              className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                            >
                              <Palette className="w-4 h-4" />
                              <span>معاينة الحائط وأقسام سايبس</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'cat_saveto' && config.visibility.colorStudio && (
                        <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-bold text-amber-400">
                              SAVETO VETO · 36 لون جرافيـاتو واجهات · خشن 3مم · متوسط 2مم · ناعم 1مم
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">
                              جرّب ألوان سافياتو وفيتوتاتش سافيتو (خشن ومتوسط وناعم) على واجهة خارجية
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              {SAVETO_PREVIEW_CHIPS.map((chip) => (
                                <button
                                  key={chip.code}
                                  type="button"
                                  onClick={() => onOpenGlcColors('saveto')}
                                  title={`معاينة سافيتو ${chip.code} (${chip.name}) على الواجهة`}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer shrink-0"
                                  style={{ backgroundColor: chip.hex }}
                                  aria-label={`معاينة سافيتو ${chip.code} ${chip.name}`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenGlcColors('saveto')}
                              className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                            >
                              <Palette className="w-4 h-4" />
                              <span>معاينة جرافيـاتو سافيتو (خشن/متوسط/ناعم)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'cat_scib' && config.visibility.colorStudio && (
                        <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-bold text-amber-400">
                              SCIB PAINTS · تلوين بالكمبيوتر · 2,221 لون سكيب رسمي في 11 عائلة لونية
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">
                              استعرض جميع ألوان سكيب (SCIB) بأكوادها وجرّبها مباشرة على الحائط أو الواجهة
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              {SCIB_PREVIEW_CHIPS.map((chip) => (
                                <button
                                  key={chip.code}
                                  type="button"
                                  onClick={() => onOpenGlcColors('scib')}
                                  title={`معاينة سكيب ${chip.code} (${chip.name}) على الحائط`}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer shrink-0"
                                  style={{ backgroundColor: chip.hex }}
                                  aria-label={`معاينة سكيب ${chip.code} ${chip.name}`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenGlcColors('scib')}
                              className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                            >
                              <Palette className="w-4 h-4" />
                              <span>معاينة الحائط وألوان سكيب (2221 لون)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'cat_cmb' && config.visibility.colorStudio && (
                        <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="text-[11px] font-bold text-amber-400">
                              CMB EGYPT · 7 أقسام بمنتجاتها (مارمكس S40 · ألواني · كيما جرافياتو · الديكوري · كيمابوكسي · فيرونا)
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-white">
                              استعرض ألوان ومنتجات كيماويات البناء الحديث CMB بالكمبيوتر ومعاينة الحائط والواجهة
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              {CMB_PREVIEW_CHIPS.map((chip) => (
                                <button
                                  key={chip.code}
                                  type="button"
                                  onClick={() => onOpenGlcColors('cmb')}
                                  title={`معاينة CMB ${chip.code} (${chip.name})`}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer shrink-0"
                                  style={{ backgroundColor: chip.hex }}
                                  aria-label={`معاينة CMB ${chip.code} ${chip.name}`}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenGlcColors('cmb')}
                              className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                            >
                              <Palette className="w-4 h-4" />
                              <span>معاينة ألوان ومنتجات CMB</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {config.visibility.colorStudio && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-amber-400/50 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-[11px] font-bold text-amber-400">
                          جرافيـاتو ليزر · 6 صور أصلية (1002 – 1220) · خشن · وسط · ناعم
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-white">
                          كتالوج جرافيـاتو ليزر (110 كود) ومعاينة واجهة البيت
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          استعرض 6 لوحات ليزر أصلية بأكوادها وشاهد الملمس الخشن والوسط والناعم والليزر على واجهة البيت.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          {[
                            { code: '1004', hex: '#BDBAB0' },
                            { code: '1016', hex: '#BFB690' },
                            { code: '1046', hex: '#C4967E' },
                            { code: '1052', hex: '#B5A576' },
                            { code: '1118', hex: '#1D7D9E' },
                            { code: '1198', hex: '#172C59' },
                          ].map((chip) => (
                            <button
                              key={chip.code}
                              type="button"
                              onClick={() => onOpenGlcColors('graffiato_laser')}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer shrink-0"
                              style={{ backgroundColor: chip.hex }}
                              aria-label={`معاينة جرافيـاتو ليزر ${chip.code}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenGlcColors('graffiato_laser')}
                          className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4" />
                          <span>فتح جرافيـاتو ليزر (6 صور)</span>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-[11px] font-bold text-amber-400">
                          جرافيـاتو بدون ليزر · 6 صور أصلية (90 كود) · خشن · وسط · ناعم
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-white">
                          كتالوج جرافيـاتو بدون ليزر (جوتاشيلد · مارفكس · جيماتكس · ماربل)
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          تصفح اللوحات الـ 6 الأصلية وجرّب الملمس الخشن والوسط والناعم على واجهة البيت مباشرة.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          {[
                            { code: '6050', hex: '#DBD7C4' },
                            { code: '6064', hex: '#BD603A' },
                            { code: 'R50', hex: '#DFD6B9' },
                            { code: 'X11', hex: '#D4BF78' },
                            { code: '5001', hex: '#DDD0AE' },
                            { code: '5055', hex: '#53AF55' },
                          ].map((chip) => (
                            <button
                              key={chip.code}
                              type="button"
                              onClick={() => onOpenGlcColors('graffiato_classic')}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer shrink-0"
                              style={{ backgroundColor: chip.hex }}
                              aria-label={`معاينة جرافيـاتو بدون ليزر ${chip.code}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenGlcColors('graffiato_classic')}
                          className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4 text-slate-800" />
                          <span>فتح جرافيـاتو بدون ليزر (6 صور)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dedicated Futec Newtec 2025 & PS Mlkawy 2026 Standalone Moulding Catalogs */}
                {config.visibility.colorStudio && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-amber-400/40 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-[11px] font-bold text-amber-400">
                          فيوتك NEWTEC 2025 · 10 أقسام · 162 كود وشكل · معاينة على 8 غرف وحيطة
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-white">
                          كتالوج فيوتك نيوتك 2025 الرسمي (كرانيش · بانوهات · بديل خشب WP · 3D · صرر)
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          اختر الكود من الفيوتك واعرضه مباشرة داخل الصالون، الركنة، غرفة النوم، الأطفال، المطبخ، الحمام، الحائط أو الواجهة.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5 font-mono-nums text-[10px] font-bold text-amber-300">
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">K217</span>
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">M150</span>
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">WP1</span>
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">3D5</span>
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">R21</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenGlcColors('futec_newtec')}
                          className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4" />
                          <span>فتح كتالوج فيوتك NEWTEC 2025</span>
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-[11px] font-bold text-amber-400">
                          PS ملكاوي جروب 2026 · 20 كود RT ARTEC · معاينة مباشرة على الغرف
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-white">
                          كتالوج بانوهات وكرانيش ووزر PS عالية الكثافة (RT02 – RT121)
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          جميع أشكال البانوهات والكرانيش وبيت النور والوزر وزوايا PS بالكمبيوتر ومعاينتها فوراً على أي غرفة أو حيطة.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5 font-mono-nums text-[10px] font-bold text-slate-200">
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">RT02</span>
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">RT09</span>
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">RT020</span>
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">RT07</span>
                          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">RT32</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenGlcColors('ps_mlkawy')}
                          className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4 text-slate-800" />
                          <span>فتح كتالوج بانوهات PS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {config.visibility.colorStudio &&
                  !homeCategorySections.some(
                    (s) =>
                      s.id === 'cat_jotun' ||
                      s.id === 'cat_sipes' ||
                      s.id === 'cat_saveto' ||
                      s.id === 'cat_scib' ||
                      s.id === 'cat_cmb'
                  ) && (
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="text-[11px] font-bold text-amber-400">
                            JOTUN · SIPES · SCIB · CMB · SAVETO · استوديو كمبيوتر الألوان والواجهات
                          </div>
                          <h3 className="text-sm sm:text-base font-extrabold text-white">
                            استعرض ألوان جوتن وسكيب وسايبس وCMB وسافيتو بأكوادها وجرّبها مباشرة على الحائط أو الواجهة
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenGlcColors('jotun')}
                          className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4" />
                          <span>فتح كمبيوتر الألوان</span>
                        </button>
                      </div>
                    </div>
                  )}
              </section>
            </motion.div>
          )}

          {/* ================================================================
              PAGE 2: CATEGORIES, SUBPAGES, SEARCH & OFFERS (Sidebar Page)
             ================================================================ */}
          {activePage === 'categories' && (
            <motion.div
              key="page-categories"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {renderPageBackBar(
                config.sectionsTitleCategories || 'الأقسام والبحث والعروض',
                config.sectionsSubtitleCategories
              )}

              <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
                {/* Categories Grid */}
                {config.visibility.categories && categories.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                        اختر القسم للتصفية
                      </h2>
                      {selectedCategoryId !== 'all' && (
                        <button
                          type="button"
                          onClick={() => onSelectCategoryFilter('all', 'all', false)}
                          className="min-h-[36px] text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                        >
                          عرض جميع الأقسام ←
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
                      {categories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        const catProductsCount = products.filter(
                          (p) => p.categoryId === cat.id
                        ).length;
                        return (
                          <div key={cat.id} className="mowan-cat-shell" data-active={isSelected}>
                            <button
                              type="button"
                              onClick={() => {
                                const nextId = isSelected ? 'all' : cat.id;
                                onSelectCategoryFilter(nextId, 'all', false);
                                if (nextId !== 'all') {
                                  trackAnalyticsEvent({
                                    eventType: 'category_view',
                                    targetId: cat.id,
                                    targetLabel: cat.name,
                                  });
                                }
                              }}
                              className={`mowan-cat-core w-full min-h-[60px] p-2.5 sm:p-3.5 text-right transition-colors flex items-center gap-2.5 sm:gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-white text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <div className="w-11 h-11 sm:w-13 sm:h-13 overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 mowan-cat-core">
                                {cat.imageUrl ? (
                                  <img
                                    src={cat.imageUrl}
                                    alt={cat.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-400">
                                    {cat.name.slice(0, 2)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <h3 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2">
                                  {cat.name}
                                </h3>
                                <p
                                  className={`text-[11px] sm:text-xs font-mono-nums ${
                                    isSelected ? 'text-amber-300' : 'text-slate-500'
                                  }`}
                                >
                                  {catProductsCount} منتج
                                </p>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {categorySubpages.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                            <span className="text-xs font-bold text-slate-500 shrink-0 ml-1">
                              الصفحات الفرعية:
                            </span>
                            <button
                              type="button"
                              onClick={() => onSelectCategoryFilter(selectedCategoryId, 'all', false)}
                              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                                selectedSubpageId === 'all'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              الكل داخل القسم
                            </button>
                            {categorySubpages.map((sub) => (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => onSelectCategoryFilter(selectedCategoryId, sub.id, false)}
                                className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                                  selectedSubpageId === sub.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                )}

                {/* Dedicated GLC & JOTUN Computer Colors & Wall Visualizer Banners inside Categories */}
                {selectedCategoryId === 'cat_glc' && config.visibility.colorStudio && (
                  <section className="rounded-2xl bg-slate-900 text-white p-4 sm:p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="text-xs font-bold text-amber-400">
                        كتالوج ألوان GLC سوبر بلاتين · تلوين بالكمبيوتر
                      </div>
                      <h2 className="text-base sm:text-xl font-extrabold text-white">
                        132 درجة لونية بأكوادها الرسمية مع خاصية العرض على الحائط
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        اضغط على أي درجة لون لتظهر فوراً على حائط غرفة المعيشة أو النوم أو مقارنة لونين قبل طلب التجهيز بالكمبيوتر.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        {GLC_PREVIEW_CHIPS.slice(0, 6).map((chip) => (
                          <button
                            key={chip.code}
                            type="button"
                            onClick={() => onOpenGlcColors('glc')}
                            className="w-8 h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: chip.hex }}
                            aria-label={`معاينة كود ${chip.code}`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenGlcColors('glc')}
                        className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                      >
                        <Palette className="w-4 h-4" />
                        <span>فتح كمبيوتر ألوان GLC ومعاينة الحائط</span>
                      </button>
                    </div>
                  </section>
                )}

                {(selectedCategoryId === 'cat_jotun' || selectedCategoryId === 'cat_paints') &&
                  config.visibility.colorStudio && (
                    <section className="rounded-2xl bg-slate-900 text-white p-4 sm:p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-xs font-bold text-amber-400">
                          كتالوج ألوان جوتن (JOTUN) الرسمية · تلوين بالكمبيوتر
                        </div>
                        <h2 className="text-base sm:text-xl font-extrabold text-white">
                          994 درجة لونية بأكوادها وأسمائها المعتمدة مع خاصية العرض على الحائط
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          تصفح درجات جوتن الداخلية (مثل 7627 ريفرش و1001 إغّ وايت و1622 رفلكشن) وشاهدها على الحائط قبل طلب الخلط.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          {JOTUN_PREVIEW_CHIPS.slice(0, 6).map((chip) => (
                            <button
                              key={chip.code}
                              type="button"
                              onClick={() => onOpenGlcColors('jotun')}
                              className="w-8 h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer"
                              style={{ backgroundColor: chip.hex }}
                              aria-label={`معاينة كود جوتن ${chip.code} ${chip.name}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenGlcColors('jotun')}
                          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4" />
                          <span>فتح كمبيوتر ألوان جوتن ومعاينة الحائط</span>
                        </button>
                      </div>
                    </section>
                  )}

                {(selectedCategoryId === 'cat_sipes' || selectedCategoryId === 'cat_paints') &&
                  config.visibility.colorStudio && (
                    <section className="rounded-2xl bg-slate-900 text-white p-4 sm:p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-xs font-bold text-amber-400">
                          كتالوجات ألوان سايبس (SIPES) · 6 أقسام متخصصة
                        </div>
                        <h2 className="text-base sm:text-xl font-extrabold text-white">
                          344 درجة لونية (البلاستيك، اللاكيه، الجرافيـاتو، دوكو NC، الإيبوكسي والطرق)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          كل قسم بأكواده الرسمية وملف الـ PDF المعتمد مع معاينة الحائط الفورية قبل التلوين.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          {SIPES_PREVIEW_CHIPS.slice(0, 6).map((chip) => (
                            <button
                              key={chip.code}
                              type="button"
                              onClick={() => onOpenGlcColors('sipes')}
                              className="w-8 h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer"
                              style={{ backgroundColor: chip.hex }}
                              aria-label={`معاينة كود سايبس ${chip.code} ${chip.name}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenGlcColors('sipes')}
                          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4" />
                          <span>فتح كمبيوتر ألوان سايبس (6 أقسام)</span>
                        </button>
                      </div>
                    </section>
                  )}

                {selectedCategoryId === 'cat_saveto' && config.visibility.colorStudio && (
                  <section className="rounded-2xl bg-slate-900 text-white p-4 sm:p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="text-xs font-bold text-amber-400">
                        كتالوج جرافيـاتو وواجهات سافيتو (SAVETO) · خشن · متوسط · ناعم
                      </div>
                      <h2 className="text-base sm:text-xl font-extrabold text-white">
                        36 درجة لونية لسافياتو خشن 3مم وتيكستورا متوسط 2مم وسموث رندر ناعم 1مم
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        تصفح الدرجات وشاهد الملمس الحقيقي (خشن، متوسط، ناعم) على واجهة مبنى خارجية مباشرة.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        {SAVETO_PREVIEW_CHIPS.slice(0, 6).map((chip) => (
                          <button
                            key={chip.code}
                            type="button"
                            onClick={() => onOpenGlcColors('saveto')}
                            className="w-8 h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: chip.hex }}
                            aria-label={`معاينة كود سافيتو ${chip.code} ${chip.name}`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenGlcColors('saveto')}
                        className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                      >
                        <Palette className="w-4 h-4" />
                        <span>معاينة جرافيـاتو سافيتو على الواجهة</span>
                      </button>
                    </div>
                  </section>
                )}

                {(selectedCategoryId === 'cat_scib' || selectedCategoryId === 'cat_paints') &&
                  config.visibility.colorStudio && (
                    <section className="rounded-2xl bg-slate-900 text-white p-4 sm:p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-xs font-bold text-amber-400">
                          كتالوج ألوان دهانات سكيب (SCIB) الرسمي · 11 عائلة لونية
                        </div>
                        <h2 className="text-base sm:text-xl font-extrabold text-white">
                          2,221 درجة لونية رسمية من كتالوج سكيب مع خاصية العرض على الحائط والواجهة
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          ابحث بالكود أو الاسم باللغتين وجرّب اللون مباشرة على قواعد سكيب (رويال، نوفي سيلك، أكريكوت، ويذر كوت وألتيما).
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          {SCIB_PREVIEW_CHIPS.slice(0, 6).map((chip) => (
                            <button
                              key={chip.code}
                              type="button"
                              onClick={() => onOpenGlcColors('scib')}
                              className="w-8 h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer"
                              style={{ backgroundColor: chip.hex }}
                              aria-label={`معاينة كود سكيب ${chip.code} ${chip.name}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenGlcColors('scib')}
                          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4" />
                          <span>فتح كمبيوتر ألوان سكيب (2221 لون)</span>
                        </button>
                      </div>
                    </section>
                  )}

                {(selectedCategoryId === 'cat_cmb' || selectedCategoryId === 'cat_construction') &&
                  config.visibility.colorStudio && (
                    <section className="rounded-2xl bg-slate-900 text-white p-4 sm:p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-xs font-bold text-amber-400">
                          كتالوجات ألوان ومنتجات كيماويات البناء الحديث (CMB) · 7 أقسام متخصصة
                        </div>
                        <h2 className="text-base sm:text-xl font-extrabold text-white">
                          78 لون ونظام (مارمكس S40، ألواني CMB، كيما جرافياتو، الديكوري، كيمابوكسي وأخشاب فيرونا)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          تصفح الألوان حسب المنتج مع تحميل الكتالوجات الرسمية PDF ومعاينة الدرجات والملمس على الحائط أو الواجهة.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          {CMB_PREVIEW_CHIPS.slice(0, 6).map((chip) => (
                            <button
                              key={chip.code}
                              type="button"
                              onClick={() => onOpenGlcColors('cmb')}
                              className="w-8 h-8 rounded-lg border border-white/25 hover:scale-110 transition-transform cursor-pointer"
                              style={{ backgroundColor: chip.hex }}
                              aria-label={`معاينة كود CMB ${chip.code} ${chip.name}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenGlcColors('cmb')}
                          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4" />
                          <span>فتح كمبيوتر ألوان ومنتجات CMB</span>
                        </button>
                      </div>
                    </section>
                  )}

                {/* Search & Quick Filters Toolbar */}
                <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold text-slate-900">
                        {config.sectionsTitleProducts}
                      </h2>
                      <p className="text-xs text-slate-500 font-mono-nums mt-0.5">
                        النتائج المطابقة: {filteredCategoryProducts.length} منتج
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                      <div className="relative flex-1 sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ابحث بالاسم أو الماركة أو المواصفات..."
                          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      {config.visibility.quickFilters && (
                        <div className="grid grid-cols-3 sm:inline-flex sm:items-center gap-1 p-1 bg-slate-200/75 rounded-xl w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={onResetFilters}
                            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              !offersOnly && selectedCategoryId === 'all'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            جميع المنتجات
                          </button>
                          <button
                            type="button"
                            onClick={onToggleOffersOnly}
                            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                              offersOnly
                                ? 'bg-amber-400 text-slate-950 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            العروض والخصومات
                          </button>
                          {config.visibility.colorStudio && (
                            <button
                              type="button"
                              onClick={onOpenColorStudio}
                              className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap text-blue-700 hover:bg-white transition-colors cursor-pointer"
                            >
                              كمبيوتر الألوان
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Filtered Products Grid */}
                {filteredCategoryProducts.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center space-y-3">
                    {products.length === 0 ? (
                      <p className="text-base font-bold text-slate-800">
                        لا توجد منتجات منشورة بالمتجر حالياً
                      </p>
                    ) : (
                      <>
                        <p className="text-base font-bold text-slate-800">
                          لا توجد منتجات مطابقة لبحثك حالياً
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            onResetFilters();
                          }}
                          className="min-h-[44px] mowan-btn-bevel bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 cursor-pointer"
                        >
                          إعادة عرض كل المنتجات
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <motion.div
                    key={`${selectedCategoryId}-${selectedSubpageId}-${offersOnly}`}
                    initial={{ opacity: 0.4, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
                  >
                    {filteredCategoryProducts.map((product) => renderProductCard(product))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================================================================
              PAGE 3: PARTNER BRANDS & AGENCIES (Sidebar Page)
             ================================================================ */}
          {activePage === 'brands' && (
            <motion.div
              key="page-brands"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {renderPageBackBar(
                config.sectionsTitleBrands || 'علاماتنا التجارية وشركاء النجاح',
                config.sectionsSubtitleBrands
              )}

              <section className="bg-slate-900 text-white py-8 sm:py-10">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-slate-300">
                      اضغط على أي علامة تجارية لعرض منتجاتها المتوفرة بالمتجر
                    </p>
                    {selectedBrandCode && (
                      <button
                        type="button"
                        onClick={() => onSelectBrandCode('')}
                        className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                      >
                        إلغاء تحديد الماركة ({selectedBrandCode})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3">
                    {config.brands.map((brand) => {
                      const active = selectedBrandCode === brand.code;
                      return (
                        <button
                          key={brand.id}
                          type="button"
                          onClick={() =>
                            onSelectBrandCode(active ? '' : brand.code)
                          }
                          className={`min-h-[72px] mowan-cat-core border p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-colors cursor-pointer ${
                            active
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 text-white'
                          }`}
                        >
                          {brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt={brand.nameAr}
                              referrerPolicy="no-referrer"
                              className="h-8 w-auto object-contain rounded bg-white p-1"
                            />
                          ) : (
                            <span
                              className={`font-mono-nums text-xs sm:text-sm font-extrabold tracking-wider px-2.5 py-0.5 rounded border ${
                                active
                                  ? 'bg-slate-950 text-amber-400 border-slate-900'
                                  : 'bg-slate-900/90 text-amber-400 border-slate-700'
                              }`}
                            >
                              {brand.code}
                            </span>
                          )}
                          <span
                            className={`text-[11px] sm:text-xs font-semibold leading-snug line-clamp-1 ${
                              active ? 'text-slate-950' : 'text-slate-300'
                            }`}
                          >
                            {brand.nameAr}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {selectedBrandCode && (
                <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base sm:text-xl font-extrabold text-slate-900">
                      منتجات {selectedBrandCode} ({brandProducts.length})
                    </h2>
                    {(selectedBrandCode.toUpperCase() === 'JOTUN' ||
                      selectedBrandCode.toUpperCase() === 'GLC' ||
                      selectedBrandCode.toUpperCase() === 'SIPES' ||
                      selectedBrandCode.toUpperCase() === 'SCIB' ||
                      selectedBrandCode.toUpperCase() === 'CMB' ||
                      selectedBrandCode.toUpperCase() === 'SAVETO') &&
                      config.visibility.colorStudio && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenGlcColors(
                              selectedBrandCode.toUpperCase() === 'JOTUN'
                                ? 'jotun'
                                : selectedBrandCode.toUpperCase() === 'SIPES'
                                ? 'sipes'
                                : selectedBrandCode.toUpperCase() === 'SCIB'
                                ? 'scib'
                                : selectedBrandCode.toUpperCase() === 'CMB'
                                ? 'cmb'
                                : selectedBrandCode.toUpperCase() === 'SAVETO'
                                ? 'saveto'
                                : 'glc'
                            )
                          }
                          className="min-h-[42px] inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 px-4 py-2 text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                        >
                          <Palette className="w-4 h-4" />
                          <span>
                            {selectedBrandCode.toUpperCase() === 'JOTUN'
                              ? 'تصفح ألوان جوتن على الحائط (994 لون)'
                              : selectedBrandCode.toUpperCase() === 'SIPES'
                              ? 'تصفح ألوان سايبس على الحائط (344 لون — 6 أقسام)'
                              : selectedBrandCode.toUpperCase() === 'SCIB'
                              ? 'تصفح ألوان سكيب على الحائط (2221 لون)'
                              : selectedBrandCode.toUpperCase() === 'CMB'
                              ? 'تصفح ألوان ومنتجات CMB على الحائط (7 أقسام)'
                              : selectedBrandCode.toUpperCase() === 'SAVETO'
                              ? 'تصفح ألوان وجرافيـاتو سافيتو على الواجهة (36 لون)'
                              : 'تصفح ألوان GLC على الحائط (132 لون)'}
                          </span>
                        </button>
                      )}
                  </div>
                  {brandProducts.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                      لا توجد منتجات مسجلة حالياً تحت اسم {selectedBrandCode}. يمكنك طلب أي صنف عبر واتساب المبيعات.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {brandProducts.map((product) => renderProductCard(product))}
                    </div>
                  )}
                </section>
              )}
            </motion.div>
          )}

          {/* ================================================================
              PAGE 4: ABOUT STORE, FEATURES & APP INSTALL (Sidebar Page)
             ================================================================ */}
          {activePage === 'about' && (
            <motion.div
              key="page-about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {renderPageBackBar(
                'عن المتجر والمميزات',
                'معلومات الفرع، مواعيد العمل، مميزات الخدمة، وتثبيت التطبيق'
              )}

              <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8">
                {/* Editorial Store Identity & Details Card */}
                <section className="rounded-2xl bg-slate-900 text-white p-5 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <img
                      src="/pwa-192x192.png"
                      alt={config.storeName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-400 shrink-0"
                    />
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-amber-400">{config.address}</p>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-balance text-white">
                        {config.storeName}
                      </h2>
                      <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                        {config.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigatePage('home')}
                      className="min-h-[44px] inline-flex items-center justify-center mowan-btn-bevel bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                    >
                      تصفح المنتجات والأسعار
                    </button>
                    {config.visibility.colorStudio && (
                      <button
                        type="button"
                        onClick={onOpenColorStudio}
                        className="min-h-[44px] inline-flex items-center justify-center gap-2 mowan-btn-bevel bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <Palette className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>كمبيوتر الألوان</span>
                      </button>
                    )}
                    <PWAInstallButton />
                  </div>

                  <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{config.workingHours}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        شحن مجاني للطلبات فوق{' '}
                        <strong className="font-mono-nums text-white">
                          {config.freeShippingMin}
                        </strong>{' '}
                        ج.م
                      </span>
                    </div>
                  </div>
                </section>

                {/* Store Features Cards */}
                {config.visibility.features && config.features.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900">
                      مميزات الشراء من {config.headerBrandName}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {config.features.map((feat) => (
                        <div
                          key={feat.id}
                          className="rounded-xl bg-white border border-slate-200 p-4 flex items-start gap-3"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              featureColorClasses[feat.color] || featureColorClasses.blue
                            }`}
                          >
                            <FeatureIcon icon={feat.icon} />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900">{feat.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {feat.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          )}

          {/* ================================================================
              PAGE 5: CONTACT & DIRECT INQUIRY FORM (Sidebar Page)
             ================================================================ */}
          {activePage === 'contact' && (
            <motion.div
              key="page-contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {renderPageBackBar(
                config.contactTitle || 'تواصل معنا والاستفسارات',
                config.contactBadge
              )}

              <section id="contact-section" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
                <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                  <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                    <div className="space-y-1.5 sm:space-y-2">
                      <p className="text-xs font-bold text-blue-700">{config.contactBadge}</p>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                        {config.contactTitle}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {config.contactDescription}
                      </p>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-slate-700 pt-2 border-t border-slate-100">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{config.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="flex flex-wrap gap-3 font-mono-nums font-semibold">
                          <a href={`tel:${config.phonePrimary}`} className="hover:text-blue-700 py-1">
                            {config.phonePrimary}
                          </a>
                          {config.phoneSecondary && (
                            <>
                              <span className="text-slate-300 self-center">|</span>
                              <a
                                href={`tel:${config.phoneSecondary}`}
                                className="hover:text-blue-700 py-1"
                              >
                                {config.phoneSecondary}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                        <span>{config.workingHours}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1">
                      <a
                        href={whatsappBase}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackAnalyticsEvent({
                            eventType: 'whatsapp_click',
                            targetId: 'contact_whatsapp',
                            targetLabel: 'تواصل واتساب مباشر',
                          })
                        }
                        className="min-h-[44px] inline-flex items-center gap-2 mowan-btn-bevel bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>مراسلة واتساب مبيعات</span>
                      </a>
                      {config.mapsUrl && (
                        <a
                          href={config.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] inline-flex items-center gap-2 mowan-btn-bevel bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 transition-colors"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>موقع المحل على الخريطة</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <form
                    onSubmit={handleInquirySubmit}
                    className="lg:col-span-7 rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-6 space-y-3.5 sm:space-y-4"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      أرسل استفسارك لإدارة المتجر مباشرة
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={inqName}
                        onChange={(e) => setInqName(e.target.value)}
                        placeholder="الاسم بالكامل *"
                        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900"
                      />
                      <input
                        type="tel"
                        required
                        value={inqPhone}
                        onChange={(e) => setInqPhone(e.target.value)}
                        placeholder="رقم الهاتف / واتساب *"
                        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900 font-mono-nums"
                      />
                    </div>
                    <input
                      type="text"
                      value={inqSubject}
                      onChange={(e) => setInqSubject(e.target.value)}
                      placeholder="موضوع الاستفسار (تسعير، كميات، كود لون...)"
                      className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900"
                    />
                    <textarea
                      rows={4}
                      required
                      value={inqMessage}
                      onChange={(e) => setInqMessage(e.target.value)}
                      placeholder="اكتب تفاصيل طلبك أو سؤالك هنا..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900"
                    />
                    {inqError && <p className="text-xs font-semibold text-red-600">{inqError}</p>}
                    {inqSuccess && (
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>
                          تم إرسال رسالتك بنجاح! ستظهر فوراً في لوحة المالك وسنتواصل معك قريباً.
                        </span>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={inqSending}
                      className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 mowan-btn-bevel bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-6 py-3 text-sm font-bold text-white transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{inqSending ? 'جاري الإرسال...' : 'إرسال الاستفسار الآن'}</span>
                    </button>
                  </form>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <img
                src="/pwa-192x192.png"
                alt={config.storeName}
                className="w-11 h-11 rounded-full object-cover border border-amber-400/70 shrink-0"
              />
              <h3 className="text-base font-extrabold text-amber-400">{config.storeName}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{config.footerBio}</p>
          </div>
          <div className="space-y-2 text-xs">
            <h4 className="text-sm font-bold text-white">التواصل وفروع المحل</h4>
            <p>{config.address}</p>
            <p className="font-mono-nums">
              {config.phonePrimary}
              {config.phoneSecondary ? ` | ${config.phoneSecondary}` : ''}
            </p>
            <p className="font-mono-nums">واتساب مبيعات: {config.whatsappNumber}</p>
            <p>{config.workingHours}</p>
          </div>
          <div className="space-y-2 text-xs">
            <h4 className="text-sm font-bold text-white">روابط سريعة</h4>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigatePage('home')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                المنتجات
              </button>
              <button
                type="button"
                onClick={() => navigatePage('categories')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                الأقسام والبحث
              </button>
              <button
                type="button"
                onClick={() => onOpenGlcColors('glc')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                كمبيوتر ألوان GLC
              </button>
              <button
                type="button"
                onClick={() => onOpenGlcColors('jotun')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                كمبيوتر ألوان جوتن
              </button>
              <button
                type="button"
                onClick={() => onOpenGlcColors('sipes')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                كمبيوتر ألوان سايبس
              </button>
              <button
                type="button"
                onClick={() => onOpenGlcColors('scib')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                كمبيوتر ألوان سكيب
              </button>
              <button
                type="button"
                onClick={() => onOpenGlcColors('cmb')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                كمبيوتر ألوان CMB
              </button>
              <button
                type="button"
                onClick={() => onOpenGlcColors('graffiato_laser')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                جرافيـاتو ليزر
              </button>
              <button
                type="button"
                onClick={() => onOpenGlcColors('graffiato_classic')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                جرافيـاتو بدون ليزر
              </button>
              <button
                type="button"
                onClick={() => onOpenGlcColors('futec_newtec')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                فيوتك نيوتك 2025
              </button>
              <button
                type="button"
                onClick={() => onOpenGlcColors('ps_mlkawy')}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                بانوهات PS ملكاوي
              </button>
              <button
                type="button"
                onClick={onOpenColorStudio}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                الكتالوجات
              </button>
              {config.visibility.contact && (
                <button
                  type="button"
                  onClick={() => navigatePage('contact')}
                  className="hover:text-amber-400 cursor-pointer py-1"
                >
                  تواصل معنا
                </button>
              )}
              {config.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 py-1"
                >
                  فيسبوك
                </a>
              )}
              {config.mapsUrl && (
                <a
                  href={config.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 py-1"
                >
                  خريطة جوجل
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-900 py-4 px-3 text-center text-xs text-slate-500">
          جميع الحقوق محفوظة © {new Date().getFullYear()} {config.storeName}
        </div>
      </footer>

      {/* Floating WhatsApp Quick Action */}
      <a
        href={whatsappBase}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[4.5rem] left-3.5 md:bottom-5 md:right-5 md:left-auto z-30 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        aria-label="تواصل عبر واتساب"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Thumb-Zone Mobile Bottom Bar */}
      <nav
        aria-label="تنقل الهاتف السريع"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-1.5 pb-safe grid grid-cols-4 items-center text-[11px] font-bold text-slate-300"
      >
        <button
          type="button"
          onClick={() => navigatePage('home')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activePage === 'home' ? 'text-amber-400' : 'hover:text-amber-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>
        <button
          type="button"
          onClick={() => navigatePage('categories')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activePage === 'categories' ? 'text-amber-400' : 'hover:text-amber-400'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>الأقسام</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenGlcColors('glc')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activePage === 'glc_colors' ? 'text-amber-400' : 'hover:text-amber-400'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>الألوان</span>
        </button>
        <button
          type="button"
          onClick={onOpenCart}
          className="relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 hover:text-amber-400 cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -left-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-slate-950 font-mono-nums text-[10px] font-extrabold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>السلة</span>
        </button>
      </nav>
    </main>
  );
};
