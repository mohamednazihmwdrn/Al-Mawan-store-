import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod } from '../types/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, config, updateCartQty, removeFromCart, clearCart, submitOrder } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null);
  const [lastOrderSummary, setLastOrderSummary] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  const hasFreeShipping = subtotal >= config.freeShippingMin && subtotal > 0;
  const shippingFee = cart.length === 0 ? 0 : hasFreeShipping ? 0 : config.shippingFee;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (customerName.trim().length < 2 || phone.trim().length < 6 || address.trim().length < 3) {
      setErrorMsg('يرجى استكمال الاسم ورقم الهاتف والعنوان بشكل صحيح.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      const items = cart.map((c) => ({
        productId: c.product.id,
        name: c.product.name,
        price: c.product.price || 0,
        quantity: c.quantity,
        unit: c.product.unit || '',
      }));

      const orderNum = await submitOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
        paymentMethod,
        items,
        subtotal,
        shippingFee,
        total,
      });

      const itemsLines = items
        .map((i) => `- ${i.name} × ${i.quantity} (${(i.price * i.quantity).toFixed(2)} ج.م)`)
        .join('\n');

      setLastOrderSummary(
        `طلب جديد رقم #${orderNum}\nالعميل: ${customerName.trim()}\nالهاتف: ${phone.trim()}\nالعنوان: ${address.trim()}\nطريقة الدفع: ${
          paymentMethod === 'cod'
            ? 'كاش عند الاستلام'
            : paymentMethod === 'instapay'
              ? 'إنستاباي'
              : 'فودافون كاش'
        }\nالمنتجات:\n${itemsLines}\nالإجمالي: ${total.toFixed(2)} ج.م`
      );

      setConfirmedOrderNumber(orderNum);
      clearCart();
      setCustomerName('');
      setPhone('');
      setAddress('');
      setNotes('');
    } catch {
      setErrorMsg('تعذر حفظ الطلب حالياً، يمكنك إرسال الطلب عبر واتساب مباشرة.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-r border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold">سلة المشتريات وإتمام الطلب</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrderNumber(null);
                  onClose();
                }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="إغلاق السلة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {confirmedOrderNumber ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">تم استلام طلبك بنجاح!</h3>
                <p className="font-mono-nums text-sm font-bold text-emerald-800">
                  رقم الطلب: #{confirmedOrderNumber}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ظهر طلبك الآن في لوحة تحكم إدارة المتجر وسنتواصل معك لتأكيد التوصيل.
                </p>
              </div>
              <a
                href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                  lastOrderSummary
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 px-4 text-sm font-bold text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال نسخة عبر واتساب المتجر</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrderNumber(null);
                  onClose();
                }}
                className="w-full rounded-xl bg-white border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                العودة للتسوق
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">سلة المشتريات فارغة حالياً</p>
              <p className="text-xs text-slate-400">
                أضف منتجات من المتجر لإتمام الطلب أونلاين أو عبر واتساب
              </p>
            </div>
          ) : (
            <>
              {/* Free shipping progress */}
              {config.freeShippingMin > 0 && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                  {hasFreeShipping ? (
                    <span className="font-bold text-emerald-700">
                      مبروك! حصلت على شحن مجاني بالكامل لهذا الطلب.
                    </span>
                  ) : (
                    <span>
                      أضف منتجات بقيمة{' '}
                      <strong className="font-mono-nums text-slate-900">
                        {(config.freeShippingMin - subtotal).toFixed(0)} ج.م
                      </strong>{' '}
                      للحصول على شحن مجاني.
                    </span>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="py-3 flex gap-3 items-center">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-14 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                      <p className="font-mono-nums text-xs font-semibold text-blue-700">
                        {product.price !== null ? `${product.price.toFixed(2)} ج.م` : 'عند التواصل'}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, quantity - 1)}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                            aria-label="إنقاص"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 font-mono-nums text-xs font-bold">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(product.id, quantity + 1)}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                            aria-label="زيادة"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono-nums font-semibold text-slate-900">
                    {subtotal.toFixed(2)} ج.م
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>رسوم التوصيل:</span>
                  <span className="font-mono-nums font-semibold text-slate-900">
                    {shippingFee === 0 ? 'مجاني' : `${shippingFee.toFixed(2)} ج.م`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-base">
                  <span>الإجمالي النهائي:</span>
                  <span className="font-mono-nums text-blue-700">{total.toFixed(2)} ج.م</span>
                </div>
              </div>

              {/* Checkout Form */}
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-900">بيانات العميل والتوصيل</h3>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="الاسم بالكامل *"
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الموبايل / واتساب *"
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 font-mono-nums focus:outline-none focus:border-blue-600"
                />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="العنوان بالتفصيل (المنطقة / الشارع / الدور) *"
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 bg-white"
                >
                  <option value="cod">كاش عند الاستلام</option>
                  <option value="instapay">تحويل إنستاباي (InstaPay)</option>
                  <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
                </select>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات إضافية أو كود لون (اختياري)..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
                {errorMsg && <p className="text-xs font-semibold text-red-600">{errorMsg}</p>}
              </form>
            </>
          )}
        </div>

        {cart.length > 0 && !confirmedOrderNumber && (
          <div className="p-4 pb-safe border-t border-slate-200 bg-white shrink-0">
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full min-h-[48px] mowan-btn-bevel bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 py-3 px-4 text-sm font-bold text-white shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? 'جاري تأكيد الطلب...' : `تأكيد الطلب (${total.toFixed(2)} ج.م)`}
            </button>
          </div>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
