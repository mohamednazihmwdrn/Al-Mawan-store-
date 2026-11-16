import type { CatalogAttachment } from '../types/store';

export async function compressImageToBlob(
  file: File,
  maxWidth = 1080,
  quality = 0.78
): Promise<{ blob: Blob; ext: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ملف الصورة غير صالح.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('تعذر تجهيز الصورة للرفع.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (webpBlob) => {
            if (webpBlob) {
              resolve({ blob: webpBlob, ext: 'webp', contentType: 'image/webp' });
              return;
            }
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) {
                  reject(new Error('تعذر ضغط الصورة.'));
                  return;
                }
                resolve({ blob: jpegBlob, ext: 'jpg', contentType: 'image/jpeg' });
              },
              'image/jpeg',
              quality
            );
          },
          'image/webp',
          quality
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function compressImageToDataUrl(
  file: File,
  maxWidth = 900,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ملف الصورة غير صالح.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('تعذر تجهيز الصورة للضغط.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (dataUrl.length > 240000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        }
        if (dataUrl.length > 245000) {
          reject(new Error('حجم الصورة كبير جداً بعد الضغط، يرجى اختيار صورة أصغر أو رابط مباشر.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function readPdfToDataUrl(file: File, maxBytes = 520 * 1024): Promise<string> {
  if (file.size > maxBytes) {
    throw new Error('حجم ملف PDF يتجاوز الحد المسموح للرفع المباشر (520 كيلوبايت). استخدم رابط Google Drive المباشر للملفات الكبيرة.');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف PDF.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function sanitizeId(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9_-]/g, '');
  if (cleaned.length > 0) return cleaned.slice(0, 120);
  return `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getCatalogAttachments(catlg: {
  title: string;
  fileType: 'pdf' | 'image';
  fileUrl: string;
  attachments?: CatalogAttachment[];
}): CatalogAttachment[] {
  if (Array.isArray(catlg.attachments) && catlg.attachments.length > 0) {
    return catlg.attachments
      .map((att, idx) => ({
        id: att.id || `att_${idx}`,
        type: att.type === 'pdf' ? ('pdf' as const) : ('image' as const),
        url: att.url === '@primary' ? catlg.fileUrl : att.url,
        name: att.name || '',
      }))
      .filter((att) => Boolean(att.url));
  }
  if (catlg.fileUrl) {
    return [
      {
        id: 'primary',
        type: catlg.fileType === 'pdf' ? 'pdf' : 'image',
        url: catlg.fileUrl,
        name: catlg.title,
      },
    ];
  }
  return [];
}
