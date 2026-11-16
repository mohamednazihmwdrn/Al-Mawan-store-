import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  loading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs"
          onClick={() => !loading && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-rose-600 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
                <h3 className="text-base font-extrabold">{title}</h3>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-rose-100 hover:text-white hover:bg-rose-700 cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <p className="text-sm text-slate-700 leading-relaxed">{description}</p>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="flex-1 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors cursor-pointer"
                >
                  تراجع وإلغاء
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={onConfirm}
                  className="flex-1 min-h-[44px] mowan-btn-bevel bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-sm font-extrabold transition-colors cursor-pointer"
                >
                  {loading ? 'جاري التنفيذ النهائي...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
