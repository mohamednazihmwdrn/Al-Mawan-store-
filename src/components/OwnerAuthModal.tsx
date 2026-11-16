import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeOff, KeyRound, Lock, X, ArrowLeft } from 'lucide-react';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OWNER_PASSCODE = '1272000';

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === OWNER_PASSCODE) {
      setError('');
      setPasscode('');
      onSuccess();
    } else {
      setError('الرمز السري غير صحيح، يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-full max-w-md overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-slate-200 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">دخول الإدارة</h2>
                  <p className="text-xs text-slate-300">أدخل الرمز السري للمتابعة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">أدخل رمز الدخول السري</h3>
                <p className="text-sm text-slate-500">مخصص لإدارة المتجر فقط.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="owner-passcode" className="block text-sm font-semibold text-slate-700">
                  الرمز السري:
                </label>
                <div className="relative">
                  <input
                    id="owner-passcode"
                    type={showPass ? 'text' : 'password'}
                    inputMode="numeric"
                    autoFocus
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="أدخل الرمز السري..."
                    className="w-full min-h-[48px] rounded-xl border-2 border-blue-600/80 bg-white px-4 py-3 text-center font-mono-nums text-lg tracking-widest text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showPass ? 'إخفاء الرمز' : 'إظهار الرمز'}
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {error && <p className="text-xs font-semibold text-red-600 text-center">{error}</p>}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-3 px-4 text-sm font-bold text-white transition-colors cursor-pointer"
                >
                  <span>تأكيد ودخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 py-3 px-6 text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
