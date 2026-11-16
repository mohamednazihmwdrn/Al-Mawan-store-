import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`min-h-[44px] inline-flex items-center justify-center gap-2 mowan-btn-bevel font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          compact
            ? 'px-3.5 py-2 text-xs bg-amber-500 text-slate-950 hover:bg-amber-400'
            : 'px-4 py-2.5 text-xs sm:text-sm bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
        }`}
        aria-label="تثبيت التطبيق"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>تثبيت التطبيق</span>
      </button>

      <AnimatePresence>
        {showGuideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 p-0 sm:p-4 backdrop-blur-xs"
            onClick={() => setShowGuideModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 text-right pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src="/app-logo.png"
                    alt="شعار تطبيق الموان"
                    className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 border-amber-400/70 shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">تثبيت تطبيق الموان على جهازك</h3>
                    <p className="text-xs text-slate-500">يظهر بأيقونة الموان الرسمية على شاشتك الرئيسية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isIOS ? (
                <div className="mt-4 space-y-3 text-sm text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900">لتثبيت التطبيق على iPhone / iPad:</p>
                  <ol className="space-y-2 list-decimal list-inside text-slate-600">
                    <li className="flex items-center gap-2">
                      <span>1. اضغط على زر المشاركة</span>
                      <Share className="w-4 h-4 text-blue-600 inline" />
                      <span>في شريط Safari بالأسفل.</span>
                    </li>
                    <li>2. مرر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</li>
                    <li>3. اضغط <strong>إضافة</strong> ليظهر شعار الموان كتطبيق أصلي.</li>
                  </ol>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900">لتثبيت التطبيق على أندرويد أو الكمبيوتر:</p>
                  <ol className="space-y-2 text-slate-600">
                    <li>1. افتح رابط المتجر مباشرة في متصفح <strong>Google Chrome</strong> أو <strong>Edge</strong>.</li>
                    <li>2. اضغط على قائمة المتصفح (⋮) ثم اختر <strong>تثبيت التطبيق / Install app</strong> أو <strong>الإضافة إلى الشاشة الرئيسية</strong>.</li>
                    <li>3. سيعمل التطبيق بأيقونة الموان المستقلة وبسرعة كاملة مع تحديث فوري للأسعار والمنتجات.</li>
                  </ol>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="mt-6 w-full min-h-[44px] rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                فهمت
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
