import React, { useEffect, useState } from 'react';
import {
  Check,
  Eye,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { sanitizeId } from '../../lib/imageUtils';
import { uploadImageAsset } from '../../lib/supabase';
import { PartnerBrand, StoreConfig, StoreFeature } from '../../types/store';

export const OwnerBrandsFeaturesTab: React.FC<{
  requireAuthToast: (msg: string) => void;
}> = ({ requireAuthToast }) => {
  const { config, saveConfig } = useStore();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Feature form
  const [featTitle, setFeatTitle] = useState('');
  const [featDesc, setFeatDesc] = useState('');
  const [featIcon, setFeatIcon] = useState<StoreFeature['icon']>('shield');
  const [featColor, setFeatColor] = useState<StoreFeature['color']>('blue');
  const [editingFeatId, setEditingFeatId] = useState<string | null>(null);

  // Brand form
  const [brandCode, setBrandCode] = useState('');
  const [brandNameAr, setBrandNameAr] = useState('');
  const [brandColor, setBrandColor] = useState<PartnerBrand['color']>('blue');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  const persistFeatures = async (nextFeatures: StoreFeature[], msg: string) => {
    setSaving(true);
    try {
      await saveConfig({ ...config, features: nextFeatures });
      setFeedback(msg);
      window.setTimeout(() => setFeedback(''), 3000);
    } catch (e) {
      requireAuthToast(e instanceof Error ? e.message : 'تعذر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const persistBrands = async (nextBrands: PartnerBrand[], msg: string) => {
    setSaving(true);
    try {
      await saveConfig({ ...config, brands: nextBrands });
      setFeedback(msg);
      window.setTimeout(() => setFeedback(''), 3000);
    } catch (e) {
      requireAuthToast(e instanceof Error ? e.message : 'تعذر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featTitle.trim() || !featDesc.trim()) return;
    if (editingFeatId) {
      const next = config.features.map((f) =>
        f.id === editingFeatId
          ? { ...f, title: featTitle.trim(), description: featDesc.trim(), icon: featIcon, color: featColor }
          : f
      );
      await persistFeatures(next, 'تم تحديث الميزة بنجاح');
      setEditingFeatId(null);
    } else {
      const next: StoreFeature[] = [
        ...config.features,
        {
          id: sanitizeId(`feat_${Date.now().toString(36)}`),
          title: featTitle.trim(),
          description: featDesc.trim(),
          icon: featIcon,
          color: featColor,
        },
      ];
      await persistFeatures(next, 'تمت إضافة الميزة للواجهة');
    }
    setFeatTitle('');
    setFeatDesc('');
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandCode.trim() || !brandNameAr.trim()) return;
    if (editingBrandId) {
      const next = config.brands.map((b) =>
        b.id === editingBrandId
          ? {
              ...b,
              code: brandCode.trim(),
              nameAr: brandNameAr.trim(),
              color: brandColor,
              logoUrl: brandLogoUrl.trim(),
            }
          : b
      );
      await persistBrands(next, 'تم تحديث العلامة التجارية');
      setEditingBrandId(null);
    } else {
      const next: PartnerBrand[] = [
        ...config.brands,
        {
          id: sanitizeId(`br_${Date.now().toString(36)}`),
          code: brandCode.trim(),
          nameAr: brandNameAr.trim(),
          color: brandColor,
          logoUrl: brandLogoUrl.trim(),
        },
      ];
      await persistBrands(next, 'تمت إضافة العلامة التجارية بنجاح');
    }
    setBrandCode('');
    setBrandNameAr('');
    setBrandLogoUrl('');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploadedUrl = await uploadImageAsset(file, 'brands', 400, 0.8);
      setBrandLogoUrl(uploadedUrl);
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر رفع الشعار');
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Add Feature */}
      <form
        onSubmit={handleSaveFeature}
        className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-slate-900">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold">
            {editingFeatId ? 'تعديل ميزة المتجر' : 'إضافة ميزة للمتجر'}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={featTitle}
            onChange={(e) => setFeatTitle(e.target.value)}
            placeholder="عنوان الميزة * (مثال: توصيل سريع لكل مصر)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            required
            value={featDesc}
            onChange={(e) => setFeatDesc(e.target.value)}
            placeholder="الوصف المختصر *"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <select
            value={featIcon}
            onChange={(e) => setFeatIcon(e.target.value as StoreFeature['icon'])}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="shield">درع الضمان</option>
            <option value="truck">سيارة التوصيل</option>
            <option value="headphones">استشارة فنية</option>
            <option value="credit-card">طرق الدفع</option>
            <option value="award">جودة معتمدة</option>
            <option value="palette">ألوان الكمبيوتر</option>
          </select>
          <select
            value={featColor}
            onChange={(e) => setFeatColor(e.target.value as StoreFeature['color'])}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="blue">أزرق</option>
            <option value="amber">كهرماني ذهبي</option>
            <option value="emerald">أخضر</option>
            <option value="slate">داكن</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{editingFeatId ? 'حفظ تعديل الميزة' : 'إضافة الميزة للواجهة'}</span>
          </button>
          {editingFeatId && (
            <button
              type="button"
              onClick={() => {
                setEditingFeatId(null);
                setFeatTitle('');
                setFeatDesc('');
              }}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>

      {/* Current Features */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          بطاقات مميزات المتجر في الصفحة الرئيسية ({config.features.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.features.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{f.title}</h4>
                <p className="text-xs text-slate-500 truncate">{f.description}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFeatId(f.id);
                    setFeatTitle(f.title);
                    setFeatDesc(f.description);
                    setFeatIcon(f.icon);
                    setFeatColor(f.color);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer"
                >
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() =>
                    persistFeatures(
                      config.features.filter((x) => x.id !== f.id),
                      'تم حذف الميزة'
                    )
                  }
                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Brand */}
      <form
        onSubmit={handleSaveBrand}
        className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4"
      >
        <h3 className="text-base font-bold text-slate-900">
          {editingBrandId ? 'تعديل علامة تجارية' : 'إضافة ماركة / توكيل جديد'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={brandCode}
            onChange={(e) => setBrandCode(e.target.value)}
            placeholder="اسم الماركة بالإنجليزية أو المختصر * (مثال: JOTUN)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            required
            value={brandNameAr}
            onChange={(e) => setBrandNameAr(e.target.value)}
            placeholder="الوصف بالعربية * (مثال: دهانات جوتن)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <select
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value as PartnerBrand['color'])}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="navy">كحلي داكن</option>
            <option value="blue">أزرق</option>
            <option value="red">أحمر</option>
            <option value="amber">كهرماني</option>
            <option value="emerald">أخضر</option>
            <option value="slate">رمادي</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={brandLogoUrl}
              onChange={(e) => setBrandLogoUrl(e.target.value)}
              placeholder="رابط شعار الماركة (اختياري)"
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
            />
            <label className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-700 px-3 py-2.5 text-xs font-bold cursor-pointer hover:bg-blue-100 shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>رفع شعار</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{editingBrandId ? 'حفظ تعديل الماركة' : 'إضافة العلامة التجارية'}</span>
          </button>
          {editingBrandId && (
            <button
              type="button"
              onClick={() => {
                setEditingBrandId(null);
                setBrandCode('');
                setBrandNameAr('');
                setBrandLogoUrl('');
              }}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>

      {/* Current Brands */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          العلامات التجارية وشركاء النجاح ({config.brands.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {config.brands.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 p-3 flex flex-col items-center text-center gap-2"
            >
              {b.logoUrl ? (
                <img
                  src={b.logoUrl}
                  alt={b.nameAr}
                  referrerPolicy="no-referrer"
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="font-mono-nums text-xs font-extrabold px-2.5 py-1 rounded bg-slate-900 text-amber-400">
                  {b.code}
                </span>
              )}
              <span className="text-xs font-bold text-slate-800">{b.nameAr}</span>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBrandId(b.id);
                    setBrandCode(b.code);
                    setBrandNameAr(b.nameAr);
                    setBrandColor(b.color);
                    setBrandLogoUrl(b.logoUrl);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer"
                >
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() =>
                    persistBrands(
                      config.brands.filter((x) => x.id !== b.id),
                      'تم حذف العلامة التجارية'
                    )
                  }
                  className="p-1.5 rounded-lg bg-red-50 text-red-600 cursor-pointer"
                  aria-label="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const OwnerSiteSettingsTab: React.FC<{
  requireAuthToast: (msg: string) => void;
}> = ({ requireAuthToast }) => {
  const { config, saveConfig, restoreDefaultConfigAndCatalog } = useStore();
  const [draft, setDraft] = useState<StoreConfig>(config);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await saveConfig(draft);
      setSavedMsg('تم حفظ وتطبيق كافة التعديلات على جميع الأجهزة فوراً');
      window.setTimeout(() => setSavedMsg(''), 3500);
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setSaving(true);
    try {
      await restoreDefaultConfigAndCatalog();
      setSavedMsg('تمت استعادة الإعدادات والأقسام الافتراضية بنجاح');
      window.setTimeout(() => setSavedMsg(''), 3500);
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر الاستعادة');
    } finally {
      setSaving(false);
    }
  };

  const toggleVis = (key: keyof StoreConfig['visibility']) => {
    setDraft((prev) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [key]: !prev.visibility[key],
      },
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              إعدادات المتجر والتحكم الكامل في نصوص وأقسام الموقع
            </h3>
            <p className="text-xs text-slate-500">
              أي تعديل تحفظه هنا ينعكس فوراً لكل العملاء على المتصفح والتطبيق
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 text-sm font-bold cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </button>
        </div>

        {savedMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{savedMsg}</span>
          </div>
        )}

        {/* Section 1: Store & Contact */}
        <div className="space-y-4">
          <div className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800">
            1. بيانات المحل والتواصل والشحن
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">اسم المحل الرسمي *</label>
              <input
                type="text"
                required
                value={draft.storeName}
                onChange={(e) => setDraft({ ...draft, storeName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                الاسم في الهيدر (زر الدخول السري 10 ضغطات) *
              </label>
              <input
                type="text"
                required
                value={draft.headerBrandName}
                onChange={(e) => setDraft({ ...draft, headerBrandName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">الوصف الفرعي للمحل *</label>
              <input
                type="text"
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                شريط إعلان أو تنبيه أعلى الموقع (اختياري — اتركه فارغاً لإخفائه)
              </label>
              <input
                type="text"
                value={draft.announcementBar}
                onChange={(e) => setDraft({ ...draft, announcementBar: e.target.value })}
                placeholder="مثال: خصم 15% طوال الأسبوع على جميع العدد الكهربائية"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">رقم الهاتف الأساسي *</label>
              <input
                type="text"
                required
                value={draft.phonePrimary}
                onChange={(e) => setDraft({ ...draft, phonePrimary: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">رقم الهاتف الثاني</label>
              <input
                type="text"
                value={draft.phoneSecondary}
                onChange={(e) => setDraft({ ...draft, phoneSecondary: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                رقم الواتساب الرسمي للطلبات (بكود الدولة 20) *
              </label>
              <input
                type="text"
                required
                value={draft.whatsappNumber}
                onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">مواعيد وساعات العمل *</label>
              <input
                type="text"
                value={draft.workingHours}
                onChange={(e) => setDraft({ ...draft, workingHours: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                عنوان المحل الرسمي والمعتمد *
              </label>
              <input
                type="text"
                required
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                سعر الشحن والتوصيل الافتراضي (EGP)
              </label>
              <input
                type="number"
                min={0}
                value={draft.shippingFee}
                onChange={(e) => setDraft({ ...draft, shippingFee: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                الحد الأدنى للشحن المجاني (EGP)
              </label>
              <input
                type="number"
                min={0}
                value={draft.freeShippingMin}
                onChange={(e) => setDraft({ ...draft, freeShippingMin: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">رابط فيسبوك (اختياري)</label>
              <input
                type="text"
                dir="ltr"
                value={draft.facebookUrl}
                onChange={(e) => setDraft({ ...draft, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                رابط الخريطة Google Maps (اختياري)
              </label>
              <input
                type="text"
                dir="ltr"
                value={draft.mapsUrl}
                onChange={(e) => setDraft({ ...draft, mapsUrl: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Homepage & Footer Copy */}
        <div className="space-y-4 pt-2">
          <div className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800">
            2. تعديل عناوين ونصوص أقسام الصفحة الرئيسية والفوتر
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">عنوان قسم الأقسام الرئيسية</label>
              <input
                type="text"
                value={draft.sectionsTitleCategories}
                onChange={(e) => setDraft({ ...draft, sectionsTitleCategories: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">الوصف أسفل عنوان الأقسام</label>
              <input
                type="text"
                value={draft.sectionsSubtitleCategories}
                onChange={(e) => setDraft({ ...draft, sectionsSubtitleCategories: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">عنوان قسم المنتجات والمعروضات</label>
              <input
                type="text"
                value={draft.sectionsTitleProducts}
                onChange={(e) => setDraft({ ...draft, sectionsTitleProducts: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">عنوان قسم العلامات التجارية</label>
              <input
                type="text"
                value={draft.sectionsTitleBrands}
                onChange={(e) => setDraft({ ...draft, sectionsTitleBrands: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">الوصف أسفل العلامات التجارية</label>
              <input
                type="text"
                value={draft.sectionsSubtitleBrands}
                onChange={(e) => setDraft({ ...draft, sectionsSubtitleBrands: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">شارة قسم التواصل</label>
              <input
                type="text"
                value={draft.contactBadge}
                onChange={(e) => setDraft({ ...draft, contactBadge: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">عنوان قسم التواصل</label>
              <input
                type="text"
                value={draft.contactTitle}
                onChange={(e) => setDraft({ ...draft, contactTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">نص وصف قسم التواصل</label>
              <textarea
                rows={3}
                value={draft.contactDescription}
                onChange={(e) => setDraft({ ...draft, contactDescription: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                النبذة التعريفية في أسفل الموقع (Footer)
              </label>
              <textarea
                rows={2}
                value={draft.footerBio}
                onChange={(e) => setDraft({ ...draft, footerBio: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Visibility Toggles */}
        <div className="space-y-3 pt-2">
          <div className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>3. إظهار أو إخفاء أقسام الواجهة الرئيسية</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(
              [
                ['hero', 'قسم البنرات الرئيسية (Hero)'],
                ['features', 'بطاقات مميزات المتجر'],
                ['quickFilters', 'بطاقات الفلاتر السريعة'],
                ['categories', 'دوائر الأقسام الرئيسية'],
                ['brands', 'قسم العلامات التجارية'],
                ['contact', 'قسم التواصل والرسائل'],
                ['colorStudio', 'أداة كمبيوتر الألوان'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-slate-800">{label}</span>
                <input
                  type="checkbox"
                  checked={draft.visibility[key]}
                  onChange={() => toggleVis(key)}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 text-sm font-bold cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جاري التطبيق...' : 'تطبيق وحفظ كافة التعديلات فوراً'}</span>
        </button>
      </div>

      {/* Restore Defaults */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-slate-900">
            استعادة الإعدادات والأقسام الأساسية للمتجر
          </h4>
          <p className="text-xs text-slate-500">
            يستعيد بيانات التواصل ونصوص الواجهة والأقسام الأساسية فقط دون إضافة أي منشورات تجريبية أو المساس بمنتجاتك وبنراتك.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRestoreDefaults}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-800 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>استعادة الإعدادات الأساسية</span>
        </button>
      </div>
    </form>
  );
};
