import React, { useState } from 'react';
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Layers,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getCatalogAttachments, sanitizeId } from '../../lib/imageUtils';
import { uploadImageAsset, uploadPdfAsset } from '../../lib/supabase';
import { BannerActionType, CatalogAttachment } from '../../types/store';
import { ConfirmActionModal } from '../ConfirmActionModal';

export const OwnerBannersTab: React.FC<{
  requireAuthToast: (msg: string) => void;
}> = ({ requireAuthToast }) => {
  const {
    banners,
    categories,
    upsertBanner,
    deleteBanner,
    deleteAllBanners,
  } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [actionType, setActionType] = useState<BannerActionType>('none');
  const [actionTarget, setActionTarget] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setImageUrl('');
    setActionType('none');
    setActionTarget('');
    setActive(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageAsset(file, 'banners', 1400, 0.82);
      setImageUrl(url);
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر رفع الصورة');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      requireAuthToast('يرجى اختيار صورة أو وضع رابط صورة للبنر.');
      return;
    }
    setSaving(true);
    try {
      const id = editingId || sanitizeId(`ban_${Date.now().toString(36)}`);
      await upsertBanner(
        {
          id,
          title: title.trim() || 'عرض الموان للحدايد والبويات',
          imageUrl: imageUrl.trim(),
          actionType,
          actionTarget: actionType === 'category' ? actionTarget : '',
          active,
          sortOrder: editingId
            ? banners.find((b) => b.id === editingId)?.sortOrder ?? 1
            : banners.length + 1,
        },
        !editingId
      );
      requireAuthToast(
        editingId
          ? 'تم تعديل البنر وحفظه ونشره لجميع العملاء فوراً!'
          : 'تمت إضافة البنر ونشره بالواجهة لجميع الأجهزة!'
      );
      resetForm();
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر حفظ البنر');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllBanners = async () => {
    setDeletingAll(true);
    try {
      await deleteAllBanners();
      setConfirmDeleteAll(false);
      requireAuthToast('تم حذف جميع البنرات نهائياً من قاعدة البيانات والموقع!');
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر حذف البنرات');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              {editingId ? 'تعديل بنر الواجهة' : 'إدارة صور وبنرات الواجهة الرئيسية'}
            </h3>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="اسم تعريفي للبنر داخل اللوحة فقط (اختياري — لن يظهر نص فوق الصورة)"
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
        />

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://... رابط صورة البنر أو ارفع صورة من الجهاز"
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2.5 text-xs font-bold cursor-pointer shrink-0">
            <Upload className="w-4 h-4" />
            <span>رفع صورة من الجهاز</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {imageUrl && (
          <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
            <img
              src={imageUrl}
              alt="معاينة البنر"
              referrerPolicy="no-referrer"
              className="w-full h-auto block"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as BannerActionType)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="none">للعرض فقط (غير قابل للضغط)</option>
            <option value="whatsapp">الانتقال إلى مراسلة واتساب</option>
            <option value="category">الانتقال إلى قسم معين</option>
            <option value="color_studio">فتح استوديو كمبيوتر الألوان</option>
          </select>

          {actionType === 'category' && (
            <select
              value={actionTarget}
              onChange={(e) => setActionTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
            >
              <option value="">اختر القسم المستهدف...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded"
          />
          <span>تفعيل ظهور هذا البنر في الواجهة فوراً</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{saving ? 'جاري النشر...' : editingId ? 'حفظ تعديلات البنر' : 'إضافة بنر جديد'}</span>
        </button>
      </form>

      {/* Banners List Toolbar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
          البنرات الحالية بالمتجر ({banners.length})
        </h3>
        {banners.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setConfirmDeleteAll(true);
            }}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 text-xs font-bold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف جميع البنرات</span>
          </button>
        )}
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center space-y-2 text-slate-500">
          <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">لا توجد بنرات معروضة حالياً</p>
          <p className="text-xs text-slate-500">
            يمكنك رفع أو إضافة بنر جديد من النموذج أعلاه ليظهر مباشرة للعملاء.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="bg-slate-900 w-full overflow-hidden relative">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block"
                />
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={b.active ? 'font-bold text-emerald-700' : 'font-bold text-slate-400'}>
                      {b.active ? 'ظاهر بالواجهة' : 'مخفي'}
                    </span>
                    <span className="text-slate-500">
                      {b.actionType === 'none'
                        ? 'للعرض فقط'
                        : b.actionType === 'whatsapp'
                          ? 'مراسلة واتساب'
                          : b.actionType === 'color_studio'
                            ? 'كمبيوتر الألوان'
                            : 'انتقال لقسم'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await upsertBanner({ ...b, active: !b.active }, false);
                        requireAuthToast(b.active ? 'تم إخفاء البنر من الواجهة.' : 'تم تفعيل ظهور البنر بالواجهة.');
                      } catch (err) {
                        requireAuthToast(err instanceof Error ? err.message : 'تعذر التحديث');
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {b.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{b.active ? 'تعطيل الظهور' : 'تفعيل الظهور'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(b.id);
                      setTitle(b.title);
                      setImageUrl(b.imageUrl);
                      setActionType(b.actionType);
                      setActionTarget(b.actionTarget);
                      setActive(b.active);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                    aria-label="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteBanner(b.id);
                        requireAuthToast('تم حذف البنر نهائياً من الموقع.');
                      } catch (err) {
                        requireAuthToast(err instanceof Error ? err.message : 'تعذر الحذف');
                      }
                    }}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmActionModal
        isOpen={confirmDeleteAll}
        title="حذف جميع البنرات نهائياً"
        description={`هل أنت متأكد من حذف جميع البنرات (${banners.length} بنر) نهائياً من قاعدة البيانات؟ سيختفي كل البنرات فوراً عند جميع العملاء على جميع الأجهزة.`}
        confirmLabel="نعم، احذف جميع البنرات"
        loading={deletingAll}
        onConfirm={handleDeleteAllBanners}
        onClose={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
};

export const OwnerCategoriesTab: React.FC<{
  requireAuthToast: (msg: string) => void;
}> = ({ requireAuthToast }) => {
  const {
    categories,
    subpages,
    products,
    upsertCategory,
    deleteCategory,
    upsertSubpage,
    deleteSubpage,
  } = useStore();

  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [savingCat, setSavingCat] = useState(false);

  const [subParentId, setSubParentId] = useState(categories[0]?.id || '');
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subImg, setSubImg] = useState('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [savingSub, setSavingSub] = useState(false);

  const resetCatForm = () => {
    setEditingCatId(null);
    setCatName('');
    setCatDesc('');
    setCatImg('');
  };

  const resetSubForm = () => {
    setEditingSubId(null);
    setSubName('');
    setSubDesc('');
    setSubImg('');
  };

  const handleImgUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    folder: 'categories' | 'subpages' = 'categories'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setter(await uploadImageAsset(file, folder, 720, 0.8));
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر رفع الصورة');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      requireAuthToast('يرجى إدخال اسم القسم.');
      return;
    }
    setSavingCat(true);
    try {
      const id = editingCatId || sanitizeId(`cat_${Date.now().toString(36)}`);
      await upsertCategory(
        {
          id,
          name: catName.trim(),
          description: catDesc.trim(),
          imageUrl: catImg.trim(),
          sortOrder: editingCatId
            ? categories.find((c) => c.id === editingCatId)?.sortOrder ?? 1
            : categories.length + 1,
        },
        !editingCatId
      );
      requireAuthToast(editingCatId ? 'تم حفظ تعديلات القسم بنجاح!' : 'تمت إضافة القسم بنجاح!');
      resetCatForm();
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر حفظ القسم');
    } finally {
      setSavingCat(false);
    }
  };

  const handleSaveSubpage = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCatId = subParentId || categories[0]?.id;
    if (!targetCatId || !subName.trim()) {
      requireAuthToast('يرجى اختيار القسم الرئيسي وإدخال اسم الصفحة الفرعية.');
      return;
    }
    setSavingSub(true);
    try {
      const id = editingSubId || sanitizeId(`sub_${Date.now().toString(36)}`);
      await upsertSubpage(
        {
          id,
          categoryId: targetCatId,
          name: subName.trim(),
          description: subDesc.trim(),
          imageUrl: subImg.trim(),
        },
        !editingSubId
      );
      requireAuthToast(
        editingSubId ? 'تم حفظ تعديلات الصفحة الفرعية بنجاح!' : 'تمت إضافة الصفحة الفرعية بنجاح!'
      );
      resetSubForm();
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر حفظ الصفحة الفرعية');
    } finally {
      setSavingSub(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Category */}
      <form
        onSubmit={handleSaveCategory}
        className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-slate-900">
            {editingCatId ? 'تعديل قسم رئيسي' : 'إضافة قسم رئيسي جديد'}
          </h3>
          {editingCatId && (
            <button
              type="button"
              onClick={resetCatForm}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="اسم القسم * (مثال: دهانات، حدايد، عدد يدوية)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
            placeholder="وصف مختصر (اختياري)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <div className="sm:col-span-2 flex gap-2">
            <input
              type="text"
              value={catImg}
              onChange={(e) => setCatImg(e.target.value)}
              placeholder="https://... رابط صورة القسم أو ارفع من جهازك"
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
            />
            <label className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-700 px-4 py-2.5 text-xs font-bold cursor-pointer shrink-0">
              <Upload className="w-4 h-4" />
              <span>رفع صورة</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImgUpload(e, setCatImg)}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={savingCat}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 text-sm font-bold cursor-pointer"
        >
          {savingCat ? 'جاري الحفظ...' : editingCatId ? 'حفظ تعديل القسم' : 'إضافة القسم الآن'}
        </button>
      </form>

      {/* Active Categories */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">
          الأقسام الرئيسية المفعلة حالياً ({categories.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((c) => {
            const pCount = products.filter((p) => p.categoryId === c.id).length;
            const sCount = subpages.filter((s) => s.categoryId === c.id).length;
            return (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{c.name}</h4>
                    <p className="text-xs text-blue-700 font-mono-nums">
                      {pCount} منتج · {sCount} صفحة فرعية
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(c.id);
                      setCatName(c.name);
                      setCatDesc(c.description);
                      setCatImg(c.imageUrl);
                    }}
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteCategory(c.id);
                        if (editingCatId === c.id) resetCatForm();
                        requireAuthToast(`تم حذف قسم "${c.name}" نهائياً.`);
                      } catch (err) {
                        requireAuthToast(err instanceof Error ? err.message : 'تعذر حذف القسم');
                      }
                    }}
                    className="p-2 rounded-lg bg-red-50 text-red-600 cursor-pointer"
                    aria-label="حذف القسم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Subpage */}
      <form
        onSubmit={handleSaveSubpage}
        className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              {editingSubId ? 'تعديل صفحة فرعية' : 'إضافة صفحة فرعية داخل قسم'}
            </h3>
          </div>
          {editingSubId && (
            <button
              type="button"
              onClick={resetSubForm}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={subParentId || categories[0]?.id || ''}
            onChange={(e) => setSubParentId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            placeholder="اسم الصفحة الفرعية * (مثال: بويات بلاستك ولاكية)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            value={subDesc}
            onChange={(e) => setSubDesc(e.target.value)}
            placeholder="وصف الصفحة الفرعية (اختياري)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={subImg}
              onChange={(e) => setSubImg(e.target.value)}
              placeholder="رابط صورة (اختياري)"
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
            />
            <label className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-700 px-3.5 py-2.5 text-xs font-bold cursor-pointer shrink-0">
              <Upload className="w-4 h-4" />
              <span>رفع</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImgUpload(e, setSubImg, 'subpages')}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={savingSub}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 text-sm font-bold cursor-pointer"
        >
          {savingSub ? 'جاري الحفظ...' : editingSubId ? 'حفظ تعديل الصفحة الفرعية' : 'إضافة الصفحة الفرعية الآن'}
        </button>
      </form>

      {/* Subpages List */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">
          الصفحات الفرعية المسجلة ({subpages.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subpages.map((s) => {
            const parentName = categories.find((c) => c.id === s.categoryId)?.name || s.categoryId;
            return (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">{parentName}</div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{s.name}</h4>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubId(s.id);
                      setSubParentId(s.categoryId);
                      setSubName(s.name);
                      setSubDesc(s.description);
                      setSubImg(s.imageUrl);
                    }}
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteSubpage(s.id);
                        if (editingSubId === s.id) resetSubForm();
                        requireAuthToast(`تم حذف الصفحة الفرعية "${s.name}" نهائياً.`);
                      } catch (err) {
                        requireAuthToast(err instanceof Error ? err.message : 'تعذر حذف الصفحة الفرعية');
                      }
                    }}
                    className="p-2 rounded-lg bg-red-50 text-red-600 cursor-pointer"
                    aria-label="حذف الصفحة الفرعية"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const OwnerCatalogsTab: React.FC<{
  requireAuthToast: (msg: string) => void;
}> = ({ requireAuthToast }) => {
  const { catalogs, upsertCatalog, deleteCatalog } = useStore();
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [attachments, setAttachments] = useState<CatalogAttachment[]>([]);
  const [pendingLinkType, setPendingLinkType] = useState<'image' | 'pdf'>('image');
  const [pendingLinkUrl, setPendingLinkUrl] = useState('');
  const [pendingLinkName, setPendingLinkName] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setBrand('');
    setAttachments([]);
    setPendingLinkUrl('');
    setPendingLinkName('');
    setNotes('');
  };

  const makeAttId = () =>
    sanitizeId(`att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`);

  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length === 0) return;

    const remaining = Math.max(0, 12 - attachments.length);
    if (remaining === 0) {
      requireAuthToast('تم الوصول للحد الأقصى (12 مرفقاً لكل كتالوج/منتج).');
      return;
    }

    const nextItems: CatalogAttachment[] = [];
    for (const file of files.slice(0, remaining)) {
      try {
        const uploadedUrl = await uploadImageAsset(file, 'catalogs', 1080, 0.78);
        nextItems.push({
          id: makeAttId(),
          type: 'image',
          url: uploadedUrl,
          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 80) || 'صورة ألوان',
        });
      } catch (err) {
        requireAuthToast(err instanceof Error ? err.message : 'تعذر رفع إحدى الصور');
      }
    }

    if (nextItems.length > 0) {
      setAttachments((prev) => [...prev, ...nextItems].slice(0, 12));
    }
  };

  const handleMultiPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length === 0) return;

    const remaining = Math.max(0, 12 - attachments.length);
    if (remaining === 0) {
      requireAuthToast('تم الوصول للحد الأقصى (12 مرفقاً لكل كتالوج/منتج).');
      return;
    }

    const nextItems: CatalogAttachment[] = [];
    for (const file of files.slice(0, remaining)) {
      try {
        const uploadedUrl = await uploadPdfAsset(file, 'catalogs');
        nextItems.push({
          id: makeAttId(),
          type: 'pdf',
          url: uploadedUrl,
          name: file.name.replace(/\.pdf$/i, '').slice(0, 80) || 'ملف PDF',
        });
      } catch (err) {
        requireAuthToast(err instanceof Error ? err.message : 'تعذر رفع ملف PDF');
      }
    }

    if (nextItems.length > 0) {
      setAttachments((prev) => [...prev, ...nextItems].slice(0, 12));
    }
  };

  const handleAddLinkAttachment = () => {
    const cleanUrl = pendingLinkUrl.trim();
    if (!cleanUrl) return;
    if (attachments.length >= 12) {
      requireAuthToast('تم الوصول للحد الأقصى (12 مرفقاً لكل كتالوج/منتج).');
      return;
    }
    const countSame = attachments.filter((a) => a.type === pendingLinkType).length + 1;
    setAttachments((prev) => [
      ...prev,
      {
        id: makeAttId(),
        type: pendingLinkType,
        url: cleanUrl,
        name:
          pendingLinkName.trim() ||
          (pendingLinkType === 'pdf' ? `ملف PDF (${countSame})` : `صورة (${countSame})`),
      },
    ]);
    setPendingLinkUrl('');
    setPendingLinkName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || attachments.length === 0) {
      requireAuthToast('يرجى إدخال اسم المنتج/الكتالوج وإضافة صورة واحدة أو ملف PDF على الأقل.');
      return;
    }

    setSaving(true);
    try {
      const id = editingId || sanitizeId(`catlg_${Date.now().toString(36)}`);
      await upsertCatalog(
        {
          id,
          title: title.trim(),
          brand: brand.trim(),
          fileType: attachments[0].type,
          fileUrl: attachments[0].url,
          attachments,
          notes: notes.trim(),
        },
        !editingId
      );
      resetForm();
      setSavedNotice('تم نشر الكتالوج وجميع مرفقاته في كمبيوتر الألوان بنجاح');
      window.setTimeout(() => setSavedNotice(''), 3500);
    } catch (err) {
      requireAuthToast(err instanceof Error ? err.message : 'تعذر حفظ الكتالوج');
    } finally {
      setSaving(false);
    }
  };

  const imageCount = attachments.filter((a) => a.type === 'image').length;
  const pdfCount = attachments.filter((a) => a.type === 'pdf').length;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              {editingId
                ? 'تعديل منتج / كتالوج كمبيوتر الألوان'
                : 'إضافة منتج أو كتالوج ألوان (صور متعددة أو ملفات PDF متعددة)'}
            </h3>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="اسم الكتالوج / المنتج * (مثال: فينوماستيك جوتن 2026)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="الشركة / الماركة (JOTUN, GLC, PACHIN...)"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
          />
        </div>

        {/* Multi-Image & Multi-PDF Uploader */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-800">
              مرفقات المنتج ({attachments.length}/12){' '}
              <span className="text-slate-500 font-normal">
                — {imageCount} صورة · {pdfCount} ملف PDF
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                <span>إضافة صور (متعددة)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultiImageUpload}
                  className="hidden"
                />
              </label>

              <label className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-950 px-3.5 py-2 text-xs font-bold cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>إضافة ملفات PDF (متعددة)</span>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleMultiPdfUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Add External URL Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-slate-200">
            <select
              value={pendingLinkType}
              onChange={(e) => setPendingLinkType(e.target.value as 'image' | 'pdf')}
              className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="image">رابط صورة</option>
              <option value="pdf">رابط PDF</option>
            </select>
            <input
              type="text"
              value={pendingLinkName}
              onChange={(e) => setPendingLinkName(e.target.value)}
              placeholder="اسم الملف (اختياري)"
              className="sm:col-span-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={pendingLinkUrl}
              onChange={(e) => setPendingLinkUrl(e.target.value)}
              placeholder="https://... رابط صورة أو ملف PDF (Google Drive...)"
              className="sm:col-span-5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            />
            <button
              type="button"
              onClick={handleAddLinkAttachment}
              className="sm:col-span-2 min-h-[38px] rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 text-xs font-bold cursor-pointer"
            >
              + إضافة رابط
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            يمكنك اختيار أكثر من صورة أو أكثر من ملف PDF معاً في نفس المنتج (حتى 15 ميجابايت للملف عند الربط بسحابة Supabase أو عبر رابط خارجي).
          </p>

          {/* Attached Files Preview & Management */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {attachments.map((att, idx) => (
                <div
                  key={att.id}
                  className="rounded-xl bg-white border border-slate-200 p-2.5 flex items-center gap-2.5"
                >
                  {att.type === 'image' ? (
                    <img
                      src={att.url}
                      alt={att.name || `صورة ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-900 text-amber-400 flex flex-col items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                      <span className="text-[9px] font-bold text-white">PDF</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[11px] font-semibold text-blue-700">
                      {att.type === 'pdf' ? 'ملف PDF' : 'صورة'} · #{idx + 1}
                    </div>
                    <input
                      type="text"
                      value={att.name || ''}
                      onChange={(e) => {
                        const nextName = e.target.value;
                        setAttachments((prev) =>
                          prev.map((item) =>
                            item.id === att.id ? { ...item, name: nextName } : item
                          )
                        );
                      }}
                      placeholder="اسم/تسمية هذا الملف..."
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((item) => item.id !== att.id))
                    }
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer shrink-0"
                    aria-label="حذف المرفق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="وصف أو ملاحظات للعملاء (اختياري)..."
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
        />

        {savedNotice && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <Check className="w-4 h-4" />
            <span>{savedNotice}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 text-sm font-bold cursor-pointer"
        >
          {saving
            ? 'جاري الحفظ والنشر...'
            : editingId
              ? 'حفظ تعديلات المنتج وجميع مرفقاته'
              : 'نشر المنتج والمرفقات في قسم كمبيوتر الألوان'}
        </button>
      </form>

      {catalogs.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center space-y-2 text-slate-500">
          <FileText className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">لا توجد كتالوجات مرفقة حالياً</p>
          <p className="text-xs text-slate-500">
            أضف كتالوجات الألوان (صور متعددة أو ملفات PDF متعددة) من النموذج أعلاه لتظهر للعملاء في كمبيوتر الألوان.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {catalogs.map((catlg) => {
            const items = getCatalogAttachments(catlg);
            const imgs = items.filter((i) => i.type === 'image');
            const pdfs = items.filter((i) => i.type === 'pdf');
            const coverImg = imgs[0];

            return (
              <div
                key={catlg.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col"
              >
                {coverImg ? (
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    <img
                      src={coverImg.url}
                      alt={catlg.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-slate-900 text-amber-400 flex flex-col items-center justify-center gap-2">
                    <FileText className="w-10 h-10" />
                    <span className="text-xs font-bold text-white">
                      {pdfs.length > 1 ? `${pdfs.length} ملفات PDF` : 'كتالوج PDF'}
                    </span>
                  </div>
                )}

                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-blue-700">
                      {imgs.length > 0 && `${imgs.length} صورة`}
                      {imgs.length > 0 && pdfs.length > 0 && ' · '}
                      {pdfs.length > 0 && `${pdfs.length} PDF`}
                      {catlg.brand ? ` · ${catlg.brand}` : ''}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{catlg.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(catlg.id);
                        setTitle(catlg.title);
                        setBrand(catlg.brand);
                        setAttachments(getCatalogAttachments(catlg));
                        setNotes(catlg.notes);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 rounded-lg bg-blue-50 text-blue-700 cursor-pointer"
                      aria-label="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await deleteCatalog(catlg.id);
                          if (editingId === catlg.id) resetForm();
                          requireAuthToast(`تم حذف "${catlg.title}" نهائياً.`);
                        } catch (err) {
                          requireAuthToast(err instanceof Error ? err.message : 'تعذر حذف الكتالوج');
                        }
                      }}
                      className="p-2 rounded-lg bg-red-50 text-red-600 cursor-pointer"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
