import { useCallback, useEffect, useRef, useState } from 'react';
import { cleanVoiceTranscript } from '../lib/searchUtils';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstanceLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionInstanceLike, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstanceLike, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognitionInstanceLike, ev: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((this: SpeechRecognitionInstanceLike, ev: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstanceLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

function mapSpeechErrorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'يرجى السماح بصلاحية الميكروفون من المتصفح للبحث بالصوت.';
    case 'no-speech':
      return 'لم يتم سماع صوت واضح، اضغط على الميكروفون وتكلّم مرة أخرى.';
    case 'audio-capture':
      return 'تعذر الوصول إلى الميكروفون، تأكد من توصيله أو تشغيله.';
    case 'network':
      return 'تعذر الاتصال بخدمة التعرف الصوتي، تحقق من اتصال الإنترنت.';
    default:
      return 'حدث خطأ أثناء البحث الصوتي، حاول مرة أخرى أو اكتب اسم المنتج.';
  }
}

export interface UseVoiceSearchOptions {
  lang?: string;
  onResult: (transcript: string) => void;
}

export function useVoiceSearch({ lang = 'ar-EG', onResult }: UseVoiceSearchOptions) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null);
  const errorTimerRef = useRef<number | null>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const isSupported = typeof window !== 'undefined' && getSpeechRecognitionCtor() !== null;

  const clearError = useCallback(() => {
    setError(null);
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const showTimedError = useCallback((msg: string) => {
    setError(msg);
    if (errorTimerRef.current !== null) {
      window.clearTimeout(errorTimerRef.current);
    }
    errorTimerRef.current = window.setTimeout(() => {
      setError(null);
      errorTimerRef.current = null;
    }, 5000);
  }, []);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // Ignore stop errors when already inactive
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(() => {
    clearError();
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      showTimedError('البحث الصوتي غير مدعوم في هذا المتصفح، يمكنك استخدام الكتابة.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore abort cleanup error
      }
      recognitionRef.current = null;
    }

    try {
      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            finalText += ` ${text}`;
          } else {
            interim += ` ${text}`;
          }
        }

        const cleanedInterim = cleanVoiceTranscript(interim);
        if (cleanedInterim) {
          setInterimTranscript(cleanedInterim);
        }

        const cleanedFinal = cleanVoiceTranscript(finalText);
        if (cleanedFinal) {
          setInterimTranscript('');
          onResultRef.current(cleanedFinal);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'aborted') {
          setIsListening(false);
          setInterimTranscript('');
          return;
        }
        setIsListening(false);
        setInterimTranscript('');
        showTimedError(mapSpeechErrorMessage(event.error));
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setInterimTranscript('');
      showTimedError('تعذر بدء الميكروفون، يرجى المحاولة مرة أخرى.');
    }
  }, [clearError, lang, showTimedError]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) {
        window.clearTimeout(errorTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearError,
  };
}
