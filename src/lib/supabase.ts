import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { compressImageToBlob, compressImageToDataUrl, readPdfToDataUrl, sanitizeId } from './imageUtils';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const ADMIN_EMAIL = (import.meta.env.VITE_OWNER_EMAIL || 'mnazih298@gmail.com').trim();
export const ADMIN_EMAILS = Array.from(
  new Set(
    [ADMIN_EMAIL, 'mnazih298@gmail.com', 'mohamednazih240@gmail.com']
      .flatMap((v) => v.split(','))
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
  )
);
export const MEDIA_BUCKET = 'mowan-media';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('YOUR_SUPABASE')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export type MediaFolder = 'products' | 'banners' | 'categories' | 'subpages' | 'catalogs' | 'brands';

export async function uploadImageAsset(
  file: File,
  folder: MediaFolder,
  maxWidth = 1080,
  quality = 0.78
): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    return compressImageToDataUrl(file, Math.min(maxWidth, 900), Math.min(quality, 0.75));
  }

  const { blob, ext, contentType } = await compressImageToBlob(file, maxWidth, quality);
  const fileName = `${sanitizeId(folder)}/${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, blob, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    throw new Error(`تعذر رفع الصورة إلى خادم الملفات: ${error.message}`);
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadPdfAsset(file: File, folder: MediaFolder = 'catalogs'): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    return readPdfToDataUrl(file);
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('حجم ملف PDF يتجاوز الحد المسموح (15 ميجابايت للملف الواحد).');
  }

  const fileName = `${sanitizeId(folder)}/${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}.pdf`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, file, {
    contentType: 'application/pdf',
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    throw new Error(`تعذر رفع ملف PDF إلى خادم الملفات: ${error.message}`);
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
