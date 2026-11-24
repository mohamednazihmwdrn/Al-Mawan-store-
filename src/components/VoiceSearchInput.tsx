import React, { useState } from 'react';
import { Mic, MicOff, Search, X } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

interface VoiceSearchInputProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
  compact?: boolean;
}

export const VoiceSearchInput: React.FC<VoiceSearchInputProps> = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = '',
  inputClassName = '',
  compact = false,
}) => {
  const [voiceLang, setVoiceLang] = useState<'ar-EG' | 'en-US'>('ar-EG');

  const {
    isListening,
    interimTranscript,
    error,
    toggleListening,
    stopListening,
    clearError,
  } = useVoiceSearch({
    lang: voiceLang,
    onResult: (transcript) => {
      onChange(transcript);
    },
  });

  const hasText = value.trim().length > 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="relative flex items-center">
        <Search
          className={`w-4 h-4 text-slate-400 absolute pointer-events-none ${
            compact ? 'right-3' : 'right-3.5'
          }`}
        />

        <input
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={value}
          onChange={(e) => {
            if (error) clearError();
            onChange(e.target.value);
          }}
          placeholder={isListening ? 'تكلّم الآن...' : placeholder}
          aria-label={ariaLabel || placeholder}
          className={`w-full rounded-xl border transition-colors text-slate-900 focus:outline-none ${
            isListening
              ? 'border-rose-500 bg-rose-50/40 focus:border-rose-600'
              : 'border-slate-200 bg-slate-50 focus:border-blue-600 focus:bg-white'
          } ${
            compact
              ? 'min-h-[40px] pr-9 py-1.5 text-sm'
              : 'min-h-[44px] pr-10 py-2 text-base sm:text-sm'
          } ${hasText ? 'pl-[5.25rem]' : 'pl-12'} ${inputClassName}`}
        />

        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasText && (
            <button
              type="button"
              onClick={() => {
                clearError();
                onChange('');
              }}
              aria-label="مسح البحث"
              title="مسح البحث"
              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={toggleListening}
            aria-label={isListening ? 'إيقاف البحث الصوتي' : 'البحث بالصوت عبر الميكروفون'}
            title={isListening ? 'إيقاف الاستماع' : 'ابحث بصوتك عبر الميكروفون'}
            className={`relative w-9 h-9 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white shadow-sm hover:bg-rose-700'
                : 'text-slate-600 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            {isListening && (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-lg bg-rose-500/40 animate-ping pointer-events-none"
              />
            )}
            {isListening ? (
              <MicOff className="w-4 h-4 relative z-10" />
            ) : (
              <Mic className="w-4 h-4 relative z-10" />
            )}
          </button>
        </div>
      </div>

      {isListening && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs text-rose-800"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse shrink-0" />
            <span className="font-bold truncate">
              {interimTranscript
                ? `يتم التعرف: "${interimTranscript}"`
                : 'جاري الاستماع... تكلّم الآن باسم المنتج أو الكود'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextLang = voiceLang === 'ar-EG' ? 'en-US' : 'ar-EG';
                stopListening();
                setVoiceLang(nextLang);
              }}
              className="px-2 py-0.5 rounded bg-white border border-rose-200 text-[11px] font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
              title="تبديل لغة الميكروفون"
            >
              {voiceLang === 'ar-EG' ? 'عربي' : 'EN'}
            </button>
            <button
              type="button"
              onClick={stopListening}
              className="font-extrabold text-rose-700 hover:underline cursor-pointer"
            >
              إيقاف
            </button>
          </div>
        </div>
      )}

      {!isListening && error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-900"
        >
          <span className="font-semibold leading-snug">{error}</span>
          <button
            type="button"
            onClick={clearError}
            aria-label="إغلاق التنبيه"
            className="p-0.5 text-amber-700 hover:text-amber-950 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
