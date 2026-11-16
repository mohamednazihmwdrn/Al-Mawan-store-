import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, Minus, Plus, ShoppingCart, X, Check } from 'lucide-react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { categories, config, addToCart } = useStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setSelectedImage(null);
    setQuantity(1);
    setAddedFeedback(false);
  }, [product?.id]);

  const images = product ? [product.imageUrl, ...(product.galleryImages || [])].filter(Boolean) : [];
  const activeImg = selectedImage && images.includes(selectedImage) ? selectedImage : images[0];
  const categoryName = product
    ? categories.find((c) => c.id === product.categoryId)?.name || 'منتجات المتجر'
    : 'منتجات المتجر';

  const handleAdd = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1400);
  };

  const whatsappText = product
    ? encodeURIComponent(
        `مرحباً، أرغب في الاستفسار وطلب المنتج:\n${product.name}\nالكمية: ${quantity}${
          product.price ? `\nالسعر المعروض: ${product.price} جنيه` : ''
        }`
      )
    : '';
  const whatsappUrl = `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${whatsappText}`;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 p-0 sm:p-6 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-slate-200 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5 py-3.5 bg-white border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0 truncate">
                <span className="truncate">{categoryName}</span>
                {product.brandName && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-700 shrink-0">{product.brandName}</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
              {/* Gallery */}
              <div className="space-y-3">
                <div className="mowan-product-media aspect-[4/3] w-full overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      src={activeImg}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      initial={{ opacity: 0.4, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.4 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                </div>
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                      activeImg === img ? 'border-blue-600' : 'border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Module */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              {product.badge && (
                <p className="text-xs font-bold text-amber-700">{product.badge}</p>
              )}
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>
              <p className="text-xs font-medium text-emerald-700">
                {product.available
                  ? product.stock !== null
                    ? `متوفر بالمخزن (${product.stock} قطعة)`
                    : 'متوفر للطلب الفوري'
                  : 'غير متوفر حالياً'}
              </p>
            </div>

            <div className="flex items-baseline gap-3 py-2 border-y border-slate-100">
              {product.price !== null ? (
                <>
                  <span className="font-mono-nums text-2xl font-bold text-slate-900">
                    {product.price.toFixed(2)} <span className="text-sm font-semibold">ج.م</span>
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="font-mono-nums text-sm text-slate-400 line-through">
                      {product.oldPrice.toFixed(2)} ج.م
                    </span>
                  )}
                </>
              ) : (
                <span className="text-base font-bold text-blue-700">السعر عند التواصل</span>
              )}
              {product.unit && (
                <span className="text-xs text-slate-500">/ {product.unit}</span>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {(product.sizes || product.specs) && (
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2 text-xs text-slate-700">
                {product.sizes && (
                  <div>
                    <span className="font-bold text-slate-900">المقاسات / الأوزان: </span>
                    <span>{product.sizes}</span>
                  </div>
                )}
                {product.specs && (
                  <div>
                    <span className="font-bold text-slate-900">المواصفات الفنية: </span>
                    <span>{product.specs}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 min-h-[44px]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                    aria-label="تقليل الكمية"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-9 text-center font-mono-nums text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                    aria-label="زيادة الكمية"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!product.available}
                  onClick={handleAdd}
                  className="flex-1 min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 py-3 px-4 text-sm font-bold text-white transition-colors cursor-pointer"
                >
                  {addedFeedback ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  <span>{addedFeedback ? 'تمت الإضافة للسلة' : 'أضف إلى السلة'}</span>
                </button>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-2 border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 py-2.5 px-4 text-sm font-bold text-emerald-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>طلب أو استفسار مباشر عبر واتساب</span>
              </a>
            </div>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
