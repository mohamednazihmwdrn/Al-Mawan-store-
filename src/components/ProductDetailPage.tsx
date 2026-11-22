import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  Box,
  Check,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Layers,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { trackAnalyticsEvent } from '../lib/analytics';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onOpenProduct: (product: Product) => void;
  onOpenCategory: (categoryId: string, subpageId?: string) => void;
}

interface ParsedProductDetails {
  overview: string;
  features: string[];
  uses: string[];
  techSpecs: { label: string; value: string }[];
  storage: string;
  extraSections: { title: string; body: string }[];
}

function parseProductDescription(product: Product): ParsedProductDetails {
  const raw = (product.description || '').trim();
  const blocks = raw
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  let overview = '';
  const features: string[] = [];
  const uses: string[] = [];
  const techSpecs: { label: string; value: string }[] = [];
  let storage = '';
  const extraSections: { title: string; body: string }[] = [];

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const first = lines[0];

    if (first.startsWith('المميزات') || first.startsWith('الخصائص')) {
      for (const line of lines.slice(1)) {
        const cleaned = line.replace(/^[-•*]\s*/, '').trim();
        if (cleaned) features.push(cleaned);
      }
      continue;
    }

    if (first.startsWith('الاستخدامات') || first.startsWith('الأسطح') || first.startsWith('مجالات الاستخدام')) {
      for (const line of lines.slice(1)) {
        const cleaned = line.replace(/^[-•*]\s*/, '').trim();
        if (cleaned) uses.push(cleaned);
      }
      continue;
    }

    if (first.startsWith('المواصفات الفنية') || first.startsWith('البيانات الفنية')) {
      for (const line of lines.slice(1)) {
        const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
        const colonIdx = cleaned.indexOf(':');
        if (colonIdx > 0) {
          techSpecs.push({
            label: cleaned.slice(0, colonIdx).trim(),
            value: cleaned.slice(colonIdx + 1).trim(),
          });
        } else if (cleaned) {
          techSpecs.push({ label: 'ملاحظة تشغيل', value: cleaned });
        }
      }
      continue;
    }

    if (first.startsWith('التخزين والسلامة') || first.startsWith('التخزين')) {
      storage = lines.slice(1).join(' ').trim();
      continue;
    }

    if (!overview) {
      overview = block;
    } else if (first.endsWith(':') && lines.length > 1) {
      extraSections.push({
        title: first.replace(/:$/, ''),
        body: lines.slice(1).join('\n'),
      });
    } else {
      overview = `${overview}\n\n${block}`;
    }
  }

  // Merge concise specs line if techSpecs is empty or missing summary attributes
  if (product.specs && techSpecs.length === 0) {
    const parts = product.specs
      .split('·')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0) {
        techSpecs.push({
          label: part.slice(0, colonIdx).trim(),
          value: part.slice(colonIdx + 1).trim(),
        });
      } else {
        techSpecs.push({ label: 'مواصفة', value: part });
      }
    }
  }

  return { overview, features, uses, techSpecs, storage, extraSections };
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onOpenProduct,
  onOpenCategory,
}) => {
  const { categories, subpages, products, config, addToCart } = useStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setSelectedImage(null);
    setQuantity(1);
    setAddedFeedback(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const images = useMemo(
    () => [product.imageUrl, ...(product.galleryImages || [])].filter(Boolean),
    [product.imageUrl, product.galleryImages]
  );
  const activeImg = selectedImage && images.includes(selectedImage) ? selectedImage : images[0];

  const category = categories.find((c) => c.id === product.categoryId);
  const subpage = subpages.find((s) => s.id === product.subpageId);
  const parsed = useMemo(() => parseProductDescription(product), [product]);

  const relatedProducts = useMemo(() => {
    const others = products.filter((p) => p.id !== product.id);
    const sameSubpage = product.subpageId
      ? others.filter((p) => p.subpageId === product.subpageId)
      : [];
    const sameCategory = others.filter(
      (p) => p.categoryId === product.categoryId && p.subpageId !== product.subpageId
    );
    return [...sameSubpage, ...sameCategory].slice(0, 6);
  }, [products, product.id, product.subpageId, product.categoryId]);

  const handleAdd = () => {
    addToCart(product, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1600);
  };

  const whatsappBase = `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`;
  const whatsappText = encodeURIComponent(
    `مرحباً، أرغب في الاستفسار وطلب المنتج:\n${product.name}\nالكمية: ${quantity}${
      product.price !== null ? `\nالسعر المعروض: ${product.price} جنيه` : '\n(أرجو إفادتي بالسعر المتاح)'
    }`
  );
  const whatsappUrl = `${whatsappBase}?text=${whatsappText}`;

  const discountPct =
    product.price !== null && product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <motion.div
      key={`product-page-${product.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24 }}
      className="min-h-screen bg-slate-50 text-slate-900 pb-14"
    >
      {/* Top Breadcrumb & Back Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav
            aria-label="مسار التنقل"
            className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-300 min-w-0"
          >
            <button
              type="button"
              onClick={onBack}
              className="hover:text-amber-400 font-semibold transition-colors cursor-pointer shrink-0"
            >
              الرئيسية
            </button>
            {category && (
              <>
                <span className="text-slate-600">/</span>
                <button
                  type="button"
                  onClick={() => onOpenCategory(category.id)}
                  className="hover:text-amber-400 font-semibold transition-colors cursor-pointer truncate max-w-[160px]"
                >
                  {category.name}
                </button>
              </>
            )}
            {subpage && (
              <>
                <span className="text-slate-600">/</span>
                <button
                  type="button"
                  onClick={() => onOpenCategory(product.categoryId, subpage.id)}
                  className="hover:text-amber-400 font-semibold transition-colors cursor-pointer truncate max-w-[180px]"
                >
                  {subpage.name}
                </button>
              </>
            )}
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-bold truncate max-w-[240px] sm:max-w-md">
              {product.name}
            </span>
          </nav>

          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs sm:text-sm font-bold text-amber-400 transition-colors cursor-pointer shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمنتجات</span>
          </button>
        </div>
      </div>

      {/* Main Full-Page Product Showcase */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-5 sm:pt-8 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Column 1: Product Media Gallery (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-20">
            <div className="mowan-product-shell">
              <div className="mowan-product-core bg-white aspect-square sm:aspect-[4/3] w-full overflow-hidden relative flex items-center justify-center p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={activeImg}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0.4, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.4 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full object-contain"
                  />
                </AnimatePresence>

                {product.badge && (
                  <div className="absolute bottom-0 right-0 bg-slate-950/90 text-amber-300 px-3 py-1.5 text-xs font-extrabold border-t border-l border-amber-400/50">
                    {product.badge}
                  </div>
                )}

                {discountPct !== null && (
                  <div className="absolute top-3 left-3 rounded-lg bg-rose-600 text-white px-2.5 py-1 font-mono-nums text-xs font-extrabold shadow-xs">
                    خصم {discountPct}%
                  </div>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 bg-white p-1 shrink-0 cursor-pointer transition-all ${
                      activeImg === img
                        ? 'border-blue-600 ring-2 ring-blue-100'
                        : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - صورة ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Purchase Module & Core Highlights (7 cols on lg) */}
          <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-4 sm:p-7 space-y-5 shadow-xs">
            {/* Brand, Category & Stock Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {product.brandName && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-amber-400 px-2.5 py-1 font-extrabold">
                  <Award className="w-3.5 h-3.5" />
                  <span>{product.brandName}</span>
                </span>
              )}
              {category && (
                <button
                  type="button"
                  onClick={() => onOpenCategory(category.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 font-bold transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>{category.name}</span>
                </button>
              )}
              {subpage && (
                <button
                  type="button"
                  onClick={() => onOpenCategory(product.categoryId, subpage.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 px-2.5 py-1 font-bold transition-colors cursor-pointer"
                >
                  <span>{subpage.name}</span>
                </button>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold ${
                  product.available
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    product.available ? 'bg-emerald-600' : 'bg-red-600'
                  }`}
                />
                {product.available
                  ? product.stock !== null
                    ? `متوفر بالمخزن (${product.stock} قطعة)`
                    : 'متوفر للطلب الفوري'
                  : 'غير متوفر حالياً'}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Price Banner */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-3">
                {product.price !== null ? (
                  <>
                    <span className="font-mono-nums text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {product.price.toFixed(2)}{' '}
                      <span className="text-sm font-bold text-slate-600">ج.م</span>
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="font-mono-nums text-sm sm:text-base text-slate-400 line-through">
                        {product.oldPrice.toFixed(2)} ج.م
                      </span>
                    )}
                  </>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-lg sm:text-xl font-extrabold text-blue-700 block">
                      السعر عند التواصل
                    </span>
                    <span className="text-xs text-slate-500 block">
                      اضغط على واتساب للاستعلام الفوري عن السعر حسب العبوة والكمية المطلوبة
                    </span>
                  </div>
                )}
              </div>
              {product.unit && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  <span>{product.unit}</span>
                </div>
              )}
            </div>

            {/* Brief Intro */}
            {parsed.overview && (
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {parsed.overview}
              </p>
            )}

            {/* Available Packaging & Quick Highlights */}
            {(product.sizes || product.specs) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.sizes && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Box className="w-3.5 h-3.5 text-amber-600" />
                      <span>العبوات والأوزان المتاحة</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{product.sizes}</p>
                  </div>
                )}
                {product.specs && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span>ملخص المواصفات الفنية</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                      {product.specs}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Order CTAs */}
            <div className="pt-2 space-y-3 border-t border-slate-100">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 min-h-[48px]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="min-w-[46px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                    aria-label="تقليل الكمية"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-mono-nums text-base font-extrabold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="min-w-[46px] min-h-[48px] flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                    aria-label="زيادة الكمية"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!product.available}
                  onClick={handleAdd}
                  className={`flex-1 min-w-[190px] min-h-[48px] mowan-btn-bevel inline-flex items-center justify-center gap-2 py-3 px-5 text-sm sm:text-base font-extrabold text-white transition-colors cursor-pointer ${
                    addedFeedback
                      ? 'bg-emerald-600'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت الإضافة للسلة بنجاح</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>أضف إلى سلة المشتريات</span>
                    </>
                  )}
                </button>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackAnalyticsEvent({
                    eventType: 'whatsapp_click',
                    targetId: product.id,
                    targetLabel: product.name,
                  })
                }
                className="w-full min-h-[48px] mowan-btn-bevel inline-flex items-center justify-center gap-2 border border-emerald-600/35 bg-emerald-50 hover:bg-emerald-100 py-3 px-4 text-sm sm:text-base font-extrabold text-emerald-800 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>طلب فوري أو استعلام عن السعر عبر واتساب</span>
              </a>
            </div>

            {/* Store Trust Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">منتج أصلي مضمون 100%</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">توصيل سريع للموقع والمنزل</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <Headphones className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">استشارة فنية مجانية بالتشغيل</span>
              </div>
            </div>
          </div>
        </section>

        {/* Full Comprehensive Specifications & Usage Guide */}
        <section className="space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900">
                التفاصيل الكاملة ودليل التشغيل والمواصفات الفنية
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                كافة البيانات الفنية، معدلات الفرد، نسب التخفيف، وخطوات التطبيق الاحترافية
              </p>
            </div>
          </div>

          {/* Features & Suitable Surfaces Grid */}
          {(parsed.features.length > 0 || parsed.uses.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {parsed.features.length > 0 && (
                <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      المميزات والخصائص الرئيسية
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {parsed.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {parsed.uses.length > 0 && (
                <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Layers className="w-5 h-5 text-blue-600 shrink-0" />
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      الاستخدامات والأسطح المناسبة
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {parsed.uses.map((useItem, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                        <span>{useItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Technical Datasheet Table */}
          {(parsed.techSpecs.length > 0 || product.sizes || product.unit) && (
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm sm:text-base font-extrabold">
                  المواصفات الفنية وبيانات التشغيل المعتمدة
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {product.brandName && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 px-5 py-3 text-sm bg-slate-50/40">
                    <div className="sm:col-span-4 font-bold text-slate-700">الشركة المصنعة / الماركة</div>
                    <div className="sm:col-span-8 font-semibold text-slate-900">{product.brandName}</div>
                  </div>
                )}
                {product.sizes && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 px-5 py-3 text-sm">
                    <div className="sm:col-span-4 font-bold text-slate-700">العبوات والأحجام المتوفرة</div>
                    <div className="sm:col-span-8 text-slate-800">{product.sizes}</div>
                  </div>
                )}
                {parsed.techSpecs.map((spec, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-1 sm:grid-cols-12 px-5 py-3 text-sm ${
                      idx % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="sm:col-span-4 font-bold text-slate-700">{spec.label}</div>
                    <div className="sm:col-span-8 text-slate-800 leading-relaxed">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Extra Sections (if owner adds custom paragraphs) */}
          {parsed.extraSections.map((sec, idx) => (
            <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-2">
              <h3 className="text-base font-extrabold text-slate-900">{sec.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{sec.body}</p>
            </div>
          ))}

          {/* Storage & Safety Card */}
          {parsed.storage && (
            <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 sm:p-5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-amber-950">إرشادات التخزين والسلامة</h3>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">{parsed.storage}</p>
              </div>
            </div>
          )}
        </section>

        {/* Related Products in the Same Category */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                منتجات أخرى ذات صلة {category ? `في ${category.name}` : ''}
              </h2>
              {category && (
                <button
                  type="button"
                  onClick={() => onOpenCategory(category.id)}
                  className="text-xs sm:text-sm font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  عرض كل القسم ←
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {relatedProducts.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onOpenProduct(rel)}
                  className="rounded-xl bg-white border border-slate-200 hover:border-amber-400 p-2.5 text-right flex flex-col justify-between gap-2 transition-all cursor-pointer group"
                >
                  <div className="aspect-[4/3] w-full bg-white rounded-lg overflow-hidden p-1">
                    <img
                      src={rel.imageUrl}
                      alt={rel.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {rel.name}
                    </h3>
                    <p className="text-[11px] font-bold text-blue-700 font-mono-nums">
                      {rel.price !== null ? `${rel.price.toFixed(0)} ج.م` : 'السعر عند التواصل'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
};
