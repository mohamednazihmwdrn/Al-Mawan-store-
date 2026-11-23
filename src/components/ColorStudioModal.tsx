import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Maximize2,
  MessageCircle,
  Palette,
  Send,
  X,
} from 'lucide-react';
import { CURATED_PAINT_SHADES } from '../data/defaults';
import { useStore } from '../context/StoreContext';
import { getCatalogAttachments } from '../lib/imageUtils';
import { CatalogAttachment } from '../types/store';

interface ColorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGlcColors?: (brand?: 'glc' | 'jotun' | 'sipes' | 'saveto') => void;
}

export const ColorStudioModal: React.FC<ColorStudioModalProps> = ({
  isOpen,
  onClose,
  onOpenGlcColors,
}) => {
  const { catalogs, config, submitInquiry } = useStore();
  const [selectedShade, setSelectedShade] = useState(CURATED_PAINT_SHADES[0]);
  const [customCode, setCustomCode] = useState('');
  const [finishType, setFinishType] = useState('بلاستيك مطفي قابل للغسيل');
  const [sizeOption, setSizeOption] = useState('بستلة 9 لتر');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedImageByCatalog, setSelectedImageByCatalog] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<{
    title: string;
    images: CatalogAttachment[];
    index: number;
  } | null>(null);

  const activeCode = customCode.trim() || `${selectedShade.code} (${selectedShade.name})`;

  const handleSubmitColorRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.trim().length < 2 || phone.trim().length < 6) {
      setErrorMsg('يرجى إدخال الاسم ورقم الهاتف بشكل صحيح.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await submitInquiry({
        customerName: customerName.trim(),
        phone: phone.trim(),
        subject: `طلب خلط لون بالكمبيوتر: ${activeCode}`,
        message: `الدرجة المطلوبة: ${activeCode}\nنوع الدهان: ${finishType}\nالعبوة: ${sizeOption}`,
        colorCode: activeCode,
      });
      setSubmitted(true);
      setCustomerName('');
      setPhone('');
    } catch {
      setErrorMsg('حدث خطأ أثناء إرسال الطلب، يمكنك التواصل عبر واتساب مباشرة.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `مرحباً الموان للحدايد والبويات، أرغب في خلط لون بالكمبيوتر:\nالكود/اللون: ${activeCode}\nالنوع: ${finishType}\nالحجم: ${sizeOption}`
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-6 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-slate-200 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="sticky top-0 z-10 bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">استوديو كمبيوتر الألوان والكتالوجات</h2>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                اختر كود اللون أو تصفح الكتالوجات المرفقة للخلط الفوري بالكمبيوتر
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-8">
          {/* Featured GLC, JOTUN, SIPES & SAVETO Interactive Wall Visualizer Launchers */}
          {onOpenGlcColors && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 flex flex-col justify-between gap-4 border border-slate-800">
                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs font-bold text-amber-400">
                    GLC PAINTS · كارتيلا سوبر بلاتين
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    ألوان GLC بالكمبيوتر ومعاينة الحائط (132 لون)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    درجات بلاتين الرسمية بأكوادها مع معاينة الغرف ومقارنة لونين على الحائط.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGlcColors('glc');
                  }}
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-3 py-2.5 text-xs font-extrabold text-slate-950 whitespace-nowrap transition-colors cursor-pointer"
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>فتح ألوان GLC والحائط</span>
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 flex flex-col justify-between gap-4 border border-slate-800">
                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs font-bold text-amber-400">
                    JOTUN EGYPT · كتالوج جوتن الداخلي
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    ألوان جوتن بالكمبيوتر ومعاينة الحائط (994 لون)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    جميع درجات جوتن المعتمدة بأكوادها وأسمائها الرسمية (7627 ريفرش، 1001، 1622).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGlcColors('jotun');
                  }}
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 px-3 py-2.5 text-xs font-extrabold text-slate-950 whitespace-nowrap transition-colors cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>فتح ألوان جوتن والحائط</span>
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 flex flex-col justify-between gap-4 border border-slate-800">
                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs font-bold text-amber-400">
                    SIPES PAINTS · 6 أقسام متخصصة
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    ألوان سايبس بالكمبيوتر ومعاينة الحائط (344 لون)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    البلاستيك، اللاكيه، الجرافيـاتو، دوكو NC، الإيبوكسي وتخطيط الطرق بأكوادها.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGlcColors('sipes');
                  }}
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-3 py-2.5 text-xs font-extrabold text-slate-950 whitespace-nowrap transition-colors cursor-pointer"
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>فتح ألوان سايبس (6 أقسام)</span>
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 flex flex-col justify-between gap-4 border border-slate-800">
                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs font-bold text-amber-400">
                    SAVETO · سافياتو وفيتوتاتش واجهات
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    جرافيـاتو سافيتو: خشن ومتوسط وناعم (36 لون)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    سافياتو خشن 3مم، تيكستورا متوسط 2مم، وسموث رندر ناعم 1مم بمعاينة واجهة خارجية.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGlcColors('saveto');
                  }}
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 px-3 py-2.5 text-xs font-extrabold text-slate-950 whitespace-nowrap transition-colors cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>فتح جرافيـاتو سافيتو</span>
                </button>
              </div>
            </div>
          )}

          {/* Owner uploaded PDF / Image Catalogs */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                كتالوجات وكروت الألوان المعتمدة ({catalogs.length})
              </h3>
              <span className="text-xs text-slate-500">محدثة لحظياً من المتجر</span>
            </div>

            {catalogs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                لا توجد كتالوجات مرفقة حالياً. يمكنك اختيار الدرجة من الألوان المقترحة أدناه.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogs.map((catlg) => {
                  const items = getCatalogAttachments(catlg);
                  const imageItems = items.filter((a) => a.type === 'image');
                  const pdfItems = items.filter((a) => a.type === 'pdf');
                  const selectedId = selectedImageByCatalog[catlg.id];
                  const activeImage =
                    imageItems.find((img) => img.id === selectedId) || imageItems[0];
                  const activeImgIndex = activeImage
                    ? Math.max(
                        0,
                        imageItems.findIndex((img) => img.id === activeImage.id)
                      )
                    : 0;

                  const summaryParts: string[] = [];
                  if (imageItems.length > 0) summaryParts.push(`${imageItems.length} صورة`);
                  if (pdfItems.length > 0) summaryParts.push(`${pdfItems.length} ملف PDF`);

                  return (
                    <div
                      key={catlg.id}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col"
                    >
                      {activeImage ? (
                        <div className="space-y-2 bg-slate-50">
                          <div
                            onClick={() =>
                              setLightbox({
                                title: catlg.title,
                                images: imageItems,
                                index: activeImgIndex,
                              })
                            }
                            className="aspect-[4/3] bg-slate-100 overflow-hidden relative cursor-pointer group"
                          >
                            <img
                              src={activeImage.url}
                              alt={activeImage.name || catlg.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightbox({
                                  title: catlg.title,
                                  images: imageItems,
                                  index: activeImgIndex,
                                });
                              }}
                              className="absolute bottom-2 left-2 min-w-[36px] min-h-[36px] inline-flex items-center justify-center rounded-lg bg-slate-950/75 text-white hover:bg-slate-900 cursor-pointer"
                              aria-label={`تكبير صور ${catlg.title}`}
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>

                          {imageItems.length > 1 && (
                            <div className="flex items-center gap-1.5 px-3 pb-2 overflow-x-auto no-scrollbar">
                              {imageItems.map((img) => {
                                const isCurrent = img.id === activeImage.id;
                                return (
                                  <button
                                    key={img.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedImageByCatalog((prev) => ({
                                        ...prev,
                                        [catlg.id]: img.id,
                                      }))
                                    }
                                    className={`w-12 h-10 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-opacity ${
                                      isCurrent
                                        ? 'border-blue-600 opacity-100'
                                        : 'border-slate-200 opacity-70 hover:opacity-100'
                                    }`}
                                    aria-label={img.name || catlg.title}
                                  >
                                    <img
                                      src={img.url}
                                      alt=""
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-slate-900 text-amber-400 flex flex-col items-center justify-center gap-2 p-4">
                          <FileText className="w-10 h-10" />
                          <span className="text-xs font-bold text-white">
                            {pdfItems.length > 1
                              ? `${pdfItems.length} ملفات PDF تفاعلية`
                              : 'كتالوج PDF تفاعلي'}
                          </span>
                        </div>
                      )}

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-blue-700 font-semibold">
                            {summaryParts.join(' · ') || 'كتالوج ألوان'}
                            {catlg.brand ? ` · ${catlg.brand}` : ''}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{catlg.title}</h4>
                          {catlg.notes && (
                            <p className="text-xs text-slate-500 leading-relaxed">{catlg.notes}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          {pdfItems.map((pdf, idx) => (
                            <a
                              key={pdf.id}
                              href={pdf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={`${pdf.name || catlg.title}.pdf`}
                              className="w-full min-h-[40px] inline-flex items-center justify-between gap-2 rounded-lg bg-slate-100 hover:bg-slate-200 py-2 px-3 text-xs font-bold text-slate-800 transition-colors"
                            >
                              <span className="inline-flex items-center gap-2 min-w-0">
                                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate">
                                  {pdf.name || `ملف PDF (${idx + 1})`}
                                </span>
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                            </a>
                          ))}

                          {imageItems.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setLightbox({
                                  title: catlg.title,
                                  images: imageItems,
                                  index: activeImgIndex,
                                })
                              }
                              className="w-full min-h-[40px] inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 py-2 px-3 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>
                                {imageItems.length > 1
                                  ? `تصفح الصور (${imageItems.length})`
                                  : 'فتح وتكبير الصورة'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Interactive Color Swatch Picker + Order Form */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">معاينة درجات الألوان الأكثر طلباً</h3>
              <div
                className="h-28 rounded-xl border border-slate-200 p-4 flex items-end justify-between transition-colors"
                style={{ backgroundColor: selectedShade.hex }}
              >
                <div className="rounded-lg bg-white/90 backdrop-blur-xs px-3 py-1.5 shadow-xs">
                  <div className="font-mono-nums text-xs font-bold text-slate-900">
                    {selectedShade.code}
                  </div>
                  <div className="text-xs text-slate-600">{selectedShade.name}</div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {CURATED_PAINT_SHADES.map((shade) => {
                  const active = shade.code === selectedShade.code;
                  return (
                    <button
                      key={shade.code}
                      type="button"
                      onClick={() => {
                        setSelectedShade(shade);
                        setCustomCode('');
                      }}
                      title={`${shade.code} - ${shade.name}`}
                      className={`group rounded-xl p-1.5 border text-right transition-all cursor-pointer ${
                        active
                          ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="h-10 w-full rounded-lg border border-black/10"
                        style={{ backgroundColor: shade.hex }}
                      />
                      <div className="mt-1 font-mono-nums text-[10px] font-bold text-slate-700 truncate">
                        {shade.code.split(' ')[1] || shade.code}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handleSubmitColorRequest}
              className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900">طلب تلوين وتجهيز بالكمبيوتر</h3>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  كود اللون المطلوب (أو اختر من المعاينة):
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder={`${selectedShade.code} (${selectedShade.name})`}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">نوع الدهان:</label>
                  <select
                    value={finishType}
                    onChange={(e) => setFinishType(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-base sm:text-xs font-medium text-slate-900"
                  >
                    <option>بلاستيك مطفي قابل للغسيل</option>
                    <option>بلاستيك نصف لامع</option>
                    <option>لاكيه أخشاب ومعادن</option>
                    <option>دهان واجهات خارجية</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">حجم العبوة:</label>
                  <select
                    value={sizeOption}
                    onChange={(e) => setSizeOption(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-base sm:text-xs font-medium text-slate-900"
                  >
                    <option>جالون 3 لتر</option>
                    <option>بستلة 9 لتر</option>
                    <option>بستلة 15 لتر</option>
                    <option>1 لتر عينة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="الاسم بالكامل *"
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900"
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف / واتساب *"
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900 font-mono-nums"
                />
              </div>

              {errorMsg && <p className="text-xs font-semibold text-red-600">{errorMsg}</p>}
              {submitted && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>تم إرسال طلب تلوين الكود للإدارة بنجاح وسنتواصل معك فوراً!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 py-2.5 px-4 text-sm font-bold text-white transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'جاري الإرسال...' : 'إرسال طلب التلوين للمتجر'}</span>
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 text-sm font-bold text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>واتساب</span>
                </a>
              </div>
            </form>
          </section>
        </div>
          </motion.div>

          {/* Fullscreen Lightbox for Multi-Image Color Cards */}
          <AnimatePresence>
            {lightbox && lightbox.images[lightbox.index] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(null);
                }}
                className="fixed inset-0 z-[60] bg-slate-950/90 flex flex-col justify-between p-3 sm:p-6"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between gap-3 text-white max-w-5xl w-full mx-auto"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold truncate">{lightbox.title}</h4>
                    <p className="text-xs text-slate-300 font-mono-nums truncate">
                      {lightbox.images[lightbox.index].name || 'صورة ألوان'} ·{' '}
                      {lightbox.index + 1} / {lightbox.images.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={lightbox.images[lightbox.index].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-bold text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">فتح الأصل</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setLightbox(null)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                      aria-label="إغلاق المعاينة"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center max-w-5xl w-full mx-auto my-3 relative min-h-0"
                >
                  {lightbox.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox((prev) =>
                          prev
                            ? {
                                ...prev,
                                index:
                                  (prev.index - 1 + prev.images.length) % prev.images.length,
                              }
                            : null
                        )
                      }
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 cursor-pointer shrink-0 z-10"
                      aria-label="الصورة السابقة"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  <img
                    src={lightbox.images[lightbox.index].url}
                    alt={lightbox.images[lightbox.index].name || lightbox.title}
                    referrerPolicy="no-referrer"
                    className="max-h-[75vh] max-w-full object-contain rounded-xl mx-2"
                  />

                  {lightbox.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox((prev) =>
                          prev
                            ? { ...prev, index: (prev.index + 1) % prev.images.length }
                            : null
                        )
                      }
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 cursor-pointer shrink-0 z-10"
                      aria-label="الصورة التالية"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {lightbox.images.length > 1 && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar max-w-5xl w-full mx-auto pb-safe"
                  >
                    {lightbox.images.map((img, i) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() =>
                          setLightbox((prev) => (prev ? { ...prev, index: i } : null))
                        }
                        className={`w-14 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                          i === lightbox.index
                            ? 'border-amber-400 opacity-100'
                            : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
