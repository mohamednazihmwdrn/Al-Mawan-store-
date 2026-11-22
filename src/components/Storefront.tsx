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
import { PWAInstallButton } from './PWAInstallButton';

interface StorefrontProps {
  activePage: StorefrontPage;
  onSelectPage: (page: StorefrontPage) => void;
  onOpenProduct: (product: Product) => void;
  onOpenColorStudio: () => void;
  onOpenCart: () => void;
  categoryJump?: { categoryId: string; subpageId?: string; nonce: number } | null;
}

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
  onSelectPage,
  onOpenProduct,
  onOpenColorStudio,
  onOpenCart,
  categoryJump,
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSubpageId, setSelectedSubpageId] = useState<string>('all');
  const [offersOnly, setOffersOnly] = useState(false);
  const [selectedBrandCode, setSelectedBrandCode] = useState<string>('');
  const [addedId, setAddedId] = useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const bannerTouchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (!categoryJump) return;
    setSelectedCategoryId(categoryJump.categoryId || 'all');
    setSelectedSubpageId(categoryJump.subpageId || 'all');
    setOffersOnly(false);
  }, [categoryJump]);

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
      setSelectedCategoryId(banner.actionTarget);
      setSelectedSubpageId('all');
      setOffersOnly(false);
      navigatePage('categories');
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
          onClick={() => navigatePage('home')}
          className="min-h-[44px] self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs sm:text-sm font-bold text-amber-400 transition-colors cursor-pointer shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لعرض المنتجات</span>
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
                              setSelectedCategoryId(section.id);
                              setSelectedSubpageId('all');
                              setOffersOnly(false);
                              trackAnalyticsEvent({
                                eventType: 'category_view',
                                targetId: section.id,
                                targetLabel: section.name,
                              });
                              navigatePage('categories');
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
                    </div>
                  ))
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
                          onClick={() => {
                            setSelectedCategoryId('all');
                            setSelectedSubpageId('all');
                          }}
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
                                setSelectedCategoryId(nextId);
                                setSelectedSubpageId('all');
                                setOffersOnly(false);
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
                          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar pb-1">
                            <span className="text-xs font-bold text-slate-500 shrink-0 ml-1">
                              الصفحات الفرعية:
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedSubpageId('all')}
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
                                onClick={() => setSelectedSubpageId(sub.id)}
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
                        <div className="flex items-center gap-1 p-1 bg-slate-200/75 rounded-xl overflow-x-auto no-scrollbar shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setOffersOnly(false);
                              setSelectedCategoryId('all');
                              setSelectedSubpageId('all');
                            }}
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
                            onClick={() => setOffersOnly((v) => !v)}
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
                            setSelectedCategoryId('all');
                            setSelectedSubpageId('all');
                            setOffersOnly(false);
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
                        onClick={() => setSelectedBrandCode('')}
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
                            setSelectedBrandCode(active ? '' : brand.code)
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
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-xl font-extrabold text-slate-900">
                      منتجات {selectedBrandCode} ({brandProducts.length})
                    </h2>
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
                onClick={onOpenColorStudio}
                className="hover:text-amber-400 cursor-pointer py-1"
              >
                كمبيوتر الألوان
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
          onClick={onOpenColorStudio}
          className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 hover:text-amber-400 cursor-pointer"
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
