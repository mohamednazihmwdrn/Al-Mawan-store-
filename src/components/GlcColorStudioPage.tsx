import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Columns2,
  ExternalLink,
  FileText,
  Lamp,
  MessageCircle,
  Paintbrush,
  Search,
  Send,
  Sun,
} from 'lucide-react';
import {
  GLC_COLOR_FAMILIES,
  GLC_PLATINE_BASES,
  GLC_PLATINE_COLORS,
  GLC_PLATINE_PDF_URL,
  GlcColorShade,
  getToneBrightnessLabel,
} from '../data/glcColors';
import { useStore } from '../context/StoreContext';
import { Product } from '../types/store';
import { trackAnalyticsEvent } from '../lib/analytics';
import {
  GlcWallPreview,
  RoomSceneType,
  WallFinishType,
  WallLightingMode,
} from './GlcWallPreview';

interface GlcColorStudioPageProps {
  onBackHome: () => void;
  onBrowseGlcProducts: () => void;
  onOpenProduct: (product: Product) => void;
}

const SIZE_OPTIONS = ['1 لتر عينة', 'جالون 2.75 لتر', 'بستلة 9 لتر', 'بستلة 15 لتر'] as const;

export const GlcColorStudioPage: React.FC<GlcColorStudioPageProps> = ({
  onBackHome,
  onBrowseGlcProducts,
  onOpenProduct,
}) => {
  const { config, products, submitInquiry } = useStore();

  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('all');
  const [searchCode, setSearchCode] = useState('');
  const [primaryShade, setPrimaryShade] = useState<GlcColorShade>(
    () => GLC_PLATINE_COLORS.find((c) => c.code === 'Y21010') || GLC_PLATINE_COLORS[0]
  );
  const [compareMode, setCompareMode] = useState(false);
  const [compareSlotTarget, setCompareSlotTarget] = useState<'primary' | 'compare'>('compare');
  const [compareShade, setCompareShade] = useState<GlcColorShade>(
    () => GLC_PLATINE_COLORS.find((c) => c.code === 'N03000') || GLC_PLATINE_COLORS[1]
  );

  const [scene, setScene] = useState<RoomSceneType>('living');
  const [lighting, setLighting] = useState<WallLightingMode>('daylight');
  const [finish, setFinish] = useState<WallFinishType>('matt');
  const [selectedBaseId, setSelectedBaseId] = useState<string>(GLC_PLATINE_BASES[0].id);
  const [sizeOption, setSizeOption] = useState<string>(SIZE_OPTIONS[2]);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const familyNameById = useMemo(
    () => new Map(GLC_COLOR_FAMILIES.map((f) => [f.id, f.nameAr])),
    []
  );

  const selectedBase = useMemo(
    () => GLC_PLATINE_BASES.find((b) => b.id === selectedBaseId) || GLC_PLATINE_BASES[0],
    [selectedBaseId]
  );

  const matchingStoreProduct = useMemo(
    () => products.find((p) => p.id === selectedBase.productId) || null,
    [products, selectedBase.productId]
  );

  const filteredColors = useMemo(() => {
    const q = searchCode.trim().toLowerCase();
    return GLC_PLATINE_COLORS.filter((c) => {
      if (selectedFamilyId !== 'all' && c.familyId !== selectedFamilyId) return false;
      if (q) {
        const famName = (familyNameById.get(c.familyId) || '').toLowerCase();
        return c.code.toLowerCase().includes(q) || famName.includes(q);
      }
      return true;
    });
  }, [selectedFamilyId, searchCode, familyNameById]);

  const handleSelectSwatch = (shade: GlcColorShade) => {
    setSubmitted(false);
    if (compareMode && compareSlotTarget === 'compare') {
      setCompareShade(shade);
    } else {
      setPrimaryShade(shade);
    }
  };

  const handleSelectFinish = (nextFinish: WallFinishType) => {
    setFinish(nextFinish);
    if (selectedBase.finish !== nextFinish) {
      const firstMatch = GLC_PLATINE_BASES.find((b) => b.finish === nextFinish);
      if (firstMatch) setSelectedBaseId(firstMatch.id);
    }
  };

  const handleSelectBase = (baseId: string) => {
    setSelectedBaseId(baseId);
    const found = GLC_PLATINE_BASES.find((b) => b.id === baseId);
    if (found) setFinish(found.finish);
  };

  const orderColorSummary = compareMode
    ? `${primaryShade.code} (أساسي) / للمقارنة: ${compareShade.code}`
    : primaryShade.code;

  const whatsappUrl = `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `مرحباً ${config.storeName}، أرغب في تجهيز لون GLC بالكمبيوتر من كتالوج بلاتين:\n• كود اللون: ${primaryShade.code} (${familyNameById.get(primaryShade.familyId) || ''})\n• نوع الدهان: ${selectedBase.nameAr} (${selectedBase.finishLabelAr})\n• العبوة المطلوبة: ${sizeOption}`
  )}`;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.trim().length < 2 || phone.trim().length < 6) {
      setErrorMsg('يرجى إدخال الاسم ورقم الهاتف للتواصل وتأكيد التجهيز.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await submitInquiry({
        customerName: customerName.trim(),
        phone: phone.trim(),
        subject: `تلوين كمبيوتر GLC بلاتين: كود ${primaryShade.code}`,
        message: `الكود المطلوب: ${orderColorSummary}\nنوع المنتج: ${selectedBase.nameAr} (${selectedBase.finishLabelAr})\nالعبوة: ${sizeOption}`,
        colorCode: `GLC ${primaryShade.code}`,
      });
      setSubmitted(true);
      setCustomerName('');
      setPhone('');
    } catch {
      setErrorMsg('تعذر إرسال الطلب الآن، يمكنك الطلب مباشرة عبر واتساب.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12">
      {/* Top Studio Header Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
              <span>GLC PAINTS</span>
              <span aria-hidden="true">·</span>
              <span>كارتيلا سوبر بلاتين المعتمدة</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-nums">{GLC_PLATINE_COLORS.length} كود لون</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white leading-snug">
              كمبيوتر ألوان GLC ومعاينة الحائط المباشرة
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={GLC_PLATINE_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              download="GLC_Platine_Color_Card.pdf"
              className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-100 whitespace-nowrap shrink-0 transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>كتالوج بلاتين PDF</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <button
              type="button"
              onClick={onBrowseGlcProducts}
              className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-100 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Paintbrush className="w-4 h-4 text-amber-400" />
              <span>منتجات GLC</span>
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-3.5 py-2 text-xs font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للمتجر</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Interactive Studio Workspace */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RIGHT / STICKY COLUMN (in RTL): Interactive Wall Visualizer + Selected Shade Details & Order */}
        <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-5 space-y-4 shadow-xs">
            {/* Wall Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Scene Selector */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(
                  [
                    { id: 'living', label: 'غرفة معيشة' },
                    { id: 'bedroom', label: 'غرفة نوم' },
                    { id: 'wall', label: 'حائط كامل' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScene(item.id)}
                    className={`min-h-[36px] px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      scene === item.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Lighting + Split Compare Toggles */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setLighting((prev) => (prev === 'daylight' ? 'warm' : 'daylight'))
                  }
                  className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    lighting === 'warm'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {lighting === 'warm' ? (
                    <>
                      <Lamp className="w-3.5 h-3.5 text-amber-600" />
                      <span>إضاءة دافئة</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-blue-600" />
                      <span>إضاءة نهارية</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCompareMode((prev) => !prev)}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    compareMode
                      ? 'bg-slate-900 border-slate-900 text-amber-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>مقارنة لونين</span>
                </button>
              </div>
            </div>

            {/* Split-Compare Slot Selector when enabled */}
            {compareMode && (
              <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCompareSlotTarget('primary')}
                  className={`min-h-[42px] rounded-lg border px-3 py-1.5 flex items-center justify-between gap-2 text-right transition-all cursor-pointer ${
                    compareSlotTarget === 'primary'
                      ? 'border-blue-600 bg-white ring-2 ring-blue-600/15'
                      : 'border-slate-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500">تغيير اللون الأساسي (يمين)</div>
                    <div className="font-mono-nums text-xs font-extrabold text-slate-900">
                      {primaryShade.code}
                    </div>
                  </div>
                  <span
                    className="w-6 h-6 rounded border border-black/15 shrink-0"
                    style={{ backgroundColor: primaryShade.hex }}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setCompareSlotTarget('compare')}
                  className={`min-h-[42px] rounded-lg border px-3 py-1.5 flex items-center justify-between gap-2 text-right transition-all cursor-pointer ${
                    compareSlotTarget === 'compare'
                      ? 'border-blue-600 bg-white ring-2 ring-blue-600/15'
                      : 'border-slate-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500">تغيير لون المقارنة (يسار)</div>
                    <div className="font-mono-nums text-xs font-extrabold text-slate-900">
                      {compareShade.code}
                    </div>
                  </div>
                  <span
                    className="w-6 h-6 rounded border border-black/15 shrink-0"
                    style={{ backgroundColor: compareShade.hex }}
                  />
                </button>
              </div>
            )}

            {/* Architectural Live Wall Visualizer */}
            <GlcWallPreview
              primaryShade={primaryShade}
              compareShade={compareMode ? compareShade : null}
              scene={scene}
              lighting={lighting}
              finish={finish}
            />

            {/* Sheen / Finish Type Bar (PDF p.13: Matt · Silk · Semigloss) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <span className="text-xs font-bold text-slate-700">درجة اللمعة على الحائط:</span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(
                  [
                    { id: 'matt', label: 'مط (Matt)' },
                    { id: 'silk', label: 'حريري (Silk)' },
                    { id: 'semigloss', label: 'نصف لامع (Semi-Gloss)' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectFinish(item.id)}
                    className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      finish === item.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Swatch Specifications Summary */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-12 h-12 rounded-xl border border-black/15 shrink-0 shadow-xs"
                  style={{ backgroundColor: primaryShade.hex }}
                />
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-nums text-base font-extrabold text-slate-900">
                      GLC {primaryShade.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-nums">
                      {primaryShade.hex}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">
                    {familyNameById.get(primaryShade.familyId)}
                    <span aria-hidden="true"> · </span>
                    {getToneBrightnessLabel(primaryShade.hex)}
                    <span aria-hidden="true"> · </span>
                    صفحة {primaryShade.pageNumber} بالكتالوج
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Computer Color Mixing & Order Request Card */}
          <form
            onSubmit={handleOrderSubmit}
            className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                تجهيز اللون بالكمبيوتر وطلبه الآن
              </h2>
              {matchingStoreProduct && (
                <button
                  type="button"
                  onClick={() => onOpenProduct(matchingStoreProduct)}
                  className="text-xs font-bold text-blue-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  تفاصيل الدهان ←
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  منتج GLC المطلوب للتلوين:
                </label>
                <select
                  value={selectedBaseId}
                  onChange={(e) => handleSelectBase(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {GLC_PLATINE_BASES.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.nameAr} — {base.finishLabelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">حجم العبوة:</label>
                <select
                  value={sizeOption}
                  onChange={(e) => setSizeOption(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {SIZE_OPTIONS.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="الاسم بالكامل *"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف / واتساب *"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 font-mono-nums focus:outline-none focus:border-blue-600"
              />
            </div>

            {errorMsg && <p className="text-xs font-semibold text-red-600">{errorMsg}</p>}
            {submitted && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4 shrink-0" />
                <span>
                  تم إرسال طلب تجهيز كود {primaryShade.code} لإدارة المتجر وسنتواصل معك فوراً!
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-white whitespace-nowrap transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitting ? 'جاري الإرسال...' : `طلب خلط كود ${primaryShade.code}`}
                </span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackAnalyticsEvent({
                    eventType: 'whatsapp_click',
                    targetId: `glc_color_${primaryShade.code}`,
                    targetLabel: `طلب لون GLC ${primaryShade.code}`,
                  })
                }
                className="min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white whitespace-nowrap shrink-0 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>طلب عبر واتساب</span>
              </a>
            </div>
          </form>
        </div>

        {/* LEFT / CATALOG GRID COLUMN (in RTL): Search + All 11 Family Filter Tabs + 132 Swatches */}
        <div className="lg:col-span-6 space-y-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  اختر الدرجة لتظهر فوراً على الحائط
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono-nums">
                  معروض {filteredColors.length} من أصل {GLC_PLATINE_COLORS.length} لون في كارتيلا
                  GLC بلاتين
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="ابحث بالكود (مثلاً Y21010)..."
                  className="w-full min-h-[42px] rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 py-1.5 text-sm font-mono-nums text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* 11 Authentic PDF Family Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setSelectedFamilyId('all')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedFamilyId === 'all'
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                جميع الألوان ({GLC_PLATINE_COLORS.length})
              </button>
              {GLC_COLOR_FAMILIES.map((fam) => {
                const active = selectedFamilyId === fam.id;
                const firstSample = GLC_PLATINE_COLORS.find((c) => c.familyId === fam.id);
                return (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => setSelectedFamilyId(fam.id)}
                    className={`min-h-[38px] inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {firstSample && (
                      <span
                        className="w-3.5 h-3.5 rounded-sm border border-black/15 shrink-0"
                        style={{ backgroundColor: firstSample.hex }}
                      />
                    )}
                    <span>{fam.nameAr}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Coded Swatches Grid */}
          {filteredColors.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
              <p className="text-sm font-bold text-slate-800">
                لا توجد أكواد مطابقة للبحث &quot;{searchCode}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchCode('');
                  setSelectedFamilyId('all');
                }}
                className="min-h-[40px] rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold cursor-pointer"
              >
                عرض جميع الـ 132 لون
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 min-[460px]:grid-cols-4 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredColors.map((shade) => {
                const isPrimary = shade.code === primaryShade.code;
                const isCompare = compareMode && shade.code === compareShade.code;
                return (
                  <button
                    key={shade.code}
                    type="button"
                    onClick={() => handleSelectSwatch(shade)}
                    className={`group rounded-xl border bg-white p-1.5 text-right transition-all cursor-pointer ${
                      isPrimary
                        ? 'border-blue-600 ring-2 ring-blue-600/25 shadow-sm'
                        : isCompare
                        ? 'border-amber-500 ring-2 ring-amber-400/35 shadow-sm'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                    aria-label={`اختيار لون GLC ${shade.code} لمعاينته على الحائط`}
                  >
                    <div
                      className="relative h-16 sm:h-20 w-full rounded-lg border border-black/10 transition-transform duration-150 group-hover:scale-[1.02]"
                      style={{ backgroundColor: shade.hex }}
                    >
                      {(isPrimary || isCompare) && (
                        <span
                          className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold shadow-xs ${
                            isPrimary
                              ? 'bg-blue-600 text-white'
                              : 'bg-amber-400 text-slate-950'
                          }`}
                        >
                          {isCompare && !isPrimary ? '2' : '1'}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 px-1 flex items-center justify-between gap-1">
                      <span className="font-mono-nums text-xs sm:text-[13px] font-extrabold text-slate-900 tracking-tight">
                        {shade.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono-nums hidden sm:inline">
                        ص{shade.pageNumber}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Color Accuracy Disclaimer matching PDF page 3 */}
          <p className="text-[11px] text-slate-500 leading-relaxed px-1">
            قد تختلف درجة اللون المعروضة على الشاشة بنسبة طفيفة عن الدهان النهائي بسبب إعدادات الإضاءة
            وسطوع الشاشة؛ يُعتمد كود GLC الرسمي عند التلوين الفعلي بماكينة الكمبيوتر بالمتجر.
          </p>
        </div>
      </div>
    </div>
  );
};
