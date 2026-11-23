import { RoomSceneType } from '../components/GlcWallPreview';

export type MouldingBrandId = 'futec_newtec' | 'ps_mlkawy';

export type MouldingCategoryId =
  | 'corniches'
  | 'light_corniches'
  | 'panels'
  | 'skirtings'
  | 'angles'
  | 'wood_panels'
  | 'panels_3d'
  | 'medallions'
  | 'consoles_columns'
  | 'exterior';

export type MouldingPatternKind =
  | 'corniche_plain'
  | 'corniche_ornate'
  | 'corniche_light'
  | 'panel_classic'
  | 'panel_ornate'
  | 'panel_arch'
  | 'door_frame'
  | 'skirting'
  | 'skirting_led'
  | 'angle'
  | 'wood_slat_wide'
  | 'wood_slat_fine'
  | 'wood_wave'
  | 'wall_3d_diamond'
  | 'wall_3d_wave'
  | 'wall_3d_rock'
  | 'wall_3d_brick'
  | 'wall_3d_circle'
  | 'wall_3d_tufted'
  | 'wall_3d_origami'
  | 'wall_3d_strips'
  | 'medallion'
  | 'console'
  | 'column'
  | 'exterior_corniche';

export interface MouldingCategoryMeta {
  id: MouldingCategoryId;
  nameAr: string;
  swatchHex: string;
}

export interface MouldingProfileItem {
  id: string;
  brand: MouldingBrandId;
  code: string;
  categoryId: MouldingCategoryId;
  nameAr: string;
  dimensionsAr: string;
  lengthAr: string;
  patternKind: MouldingPatternKind;
  widthTier: 'slim' | 'medium' | 'wide';
  catalogPage: number;
  recommendedScene?: RoomSceneType;
  notesAr?: string;
}

export const FUTEC_NEWTEC_PDF_URL =
  '/assets/aistudio/______________NEWTEC_2025_e43e98c0.pdf';
export const PS_MLKAWY_PDF_URL =
  '/assets/aistudio/____________________________PS_ac066f9d.pdf';

export const MOULDING_WALL_BACKDROPS = [
  { id: 'warm_greige', nameAr: 'جريج دافئ', hex: '#D8CFC2' },
  { id: 'ivory_cream', nameAr: 'أوف وايت كريمي', hex: '#EDE7DB' },
  { id: 'sage_olive', nameAr: 'زيتوني هادئ', hex: '#8FA08E' },
  { id: 'petrol_slate', nameAr: 'بترولي داكن', hex: '#375362' },
  { id: 'mocha_taupe', nameAr: 'كافيه مودرن', hex: '#A6907E' },
  { id: 'charcoal', nameAr: 'فحمي أنيق', hex: '#383E46' },
] as const;

export const MOULDING_FINISH_TINTS = [
  { id: 'pure_white', nameAr: 'أبيض فيوتك ناصع', hex: '#FFFFFF' },
  { id: 'off_white', nameAr: 'أبيض مطفي هادئ', hex: '#F4F1EA' },
  { id: 'champagne_gold', nameAr: 'شامبين ذهبي', hex: '#D9C08C' },
  { id: 'walnut_wood', nameAr: 'خشبي دافئ', hex: '#9D7553' },
  { id: 'anthracite_trim', nameAr: 'فحمي مودرن', hex: '#2B3036' },
] as const;

export const PS_MLKAWY_CATEGORIES: MouldingCategoryMeta[] = [
  { id: 'panels', nameAr: 'بانوهات PS', swatchHex: '#CBD5E1' },
  { id: 'corniches', nameAr: 'كرانيش PS', swatchHex: '#94A3B8' },
  { id: 'light_corniches', nameAr: 'كرانيش بيت النور PS', swatchHex: '#FCD34D' },
  { id: 'skirtings', nameAr: 'وزر أرضيات PS', swatchHex: '#64748B' },
  { id: 'angles', nameAr: 'زوايا الحوائط PS', swatchHex: '#475569' },
];

export const FUTEC_NEWTEC_CATEGORIES: MouldingCategoryMeta[] = [
  { id: 'corniches', nameAr: 'كرانيش أسقف', swatchHex: '#CBD5E1' },
  { id: 'light_corniches', nameAr: 'كرانيش بيت النور', swatchHex: '#FCD34D' },
  { id: 'panels', nameAr: 'بانوهات وبراويز وأبواب', swatchHex: '#94A3B8' },
  { id: 'skirtings', nameAr: 'وزر أرضيات', swatchHex: '#64748B' },
  { id: 'angles', nameAr: 'زوايا الحوائط', swatchHex: '#475569' },
  { id: 'wood_panels', nameAr: 'بديل الخشب (WP)', swatchHex: '#B48A64' },
  { id: 'panels_3d', nameAr: 'ألواح 3D ثري دي', swatchHex: '#D6B88C' },
  { id: 'medallions', nameAr: 'صرر أسقف (R)', swatchHex: '#E2E8F0' },
  { id: 'consoles_columns', nameAr: 'كابولي وأعمدة', swatchHex: '#B69567' },
  { id: 'exterior', nameAr: 'كرانيش واجهات خارجية', swatchHex: '#A8A29E' },
];

// ===================== 1) كتالوج ملكاوي جروب 2026 — خامات PS (RT ARTEC) =====================
export const PS_MLKAWY_PROFILES: MouldingProfileItem[] = [
  // Page 2: بانوهات PS
  {
    id: 'ps_rt02',
    brand: 'ps_mlkawy',
    code: 'RT02',
    categoryId: 'panels',
    nameAr: 'بانوه PS رفيع كلاسيك',
    dimensionsAr: 'عرض 2 سم',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'panel_classic',
    widthTier: 'slim',
    catalogPage: 2,
  },
  {
    id: 'ps_rt41',
    brand: 'ps_mlkawy',
    code: 'RT41',
    categoryId: 'panels',
    nameAr: 'بانوه PS مدرج ناعم',
    dimensionsAr: 'عرض 2 سم',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'panel_classic',
    widthTier: 'slim',
    catalogPage: 2,
  },
  {
    id: 'ps_rt04',
    brand: 'ps_mlkawy',
    code: 'RT04',
    categoryId: 'panels',
    nameAr: 'بانوه PS وسط كلاسيك',
    dimensionsAr: 'عرض 4 سم',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'panel_classic',
    widthTier: 'medium',
    catalogPage: 2,
  },
  {
    id: 'ps_rt42',
    brand: 'ps_mlkawy',
    code: 'RT42',
    categoryId: 'panels',
    nameAr: 'بانوه PS مقوس وسط',
    dimensionsAr: 'عرض 4 سم',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'panel_classic',
    widthTier: 'medium',
    catalogPage: 2,
  },
  {
    id: 'ps_rt38',
    brand: 'ps_mlkawy',
    code: 'RT38',
    categoryId: 'panels',
    nameAr: 'بانوه PS عريض فاخر',
    dimensionsAr: 'عرض 6 سم',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'panel_classic',
    widthTier: 'wide',
    catalogPage: 2,
  },

  // Page 3: كرانيش PS
  {
    id: 'ps_rt09',
    brand: 'ps_mlkawy',
    code: 'RT09',
    categoryId: 'corniches',
    nameAr: 'كرنيشة PS ناعمة',
    dimensionsAr: '4×4 سم (وتر 6 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_plain',
    widthTier: 'slim',
    catalogPage: 3,
  },
  {
    id: 'ps_rt101',
    brand: 'ps_mlkawy',
    code: 'RT101',
    categoryId: 'corniches',
    nameAr: 'كرنيشة PS مودرن ستيب',
    dimensionsAr: '4.5×4.5 سم (وتر 6.5 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_plain',
    widthTier: 'slim',
    catalogPage: 3,
  },
  {
    id: 'ps_rt18',
    brand: 'ps_mlkawy',
    code: 'RT18',
    categoryId: 'corniches',
    nameAr: 'كرنيشة PS مدرجة وسط',
    dimensionsAr: '5×5.5 سم (وتر 7 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_plain',
    widthTier: 'medium',
    catalogPage: 3,
  },
  {
    id: 'ps_rt102',
    brand: 'ps_mlkawy',
    code: 'RT102',
    categoryId: 'corniches',
    nameAr: 'كرنيشة PS كبيرة متدرجة',
    dimensionsAr: '7.8×7.6 سم (وتر 10.5 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_plain',
    widthTier: 'wide',
    catalogPage: 3,
  },
  {
    id: 'ps_rt57',
    brand: 'ps_mlkawy',
    code: 'RT57',
    categoryId: 'corniches',
    nameAr: 'كرنيشة PS أنيقة 4.3 سم',
    dimensionsAr: '4.3×4.3 سم (وتر 7 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_plain',
    widthTier: 'slim',
    catalogPage: 3,
  },
  {
    id: 'ps_rt16',
    brand: 'ps_mlkawy',
    code: 'RT16',
    categoryId: 'corniches',
    nameAr: 'كرنيشة PS طولية سقوط 7.5',
    dimensionsAr: '5×7.5 سم (وتر 9 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_plain',
    widthTier: 'medium',
    catalogPage: 3,
  },
  {
    id: 'ps_rt19',
    brand: 'ps_mlkawy',
    code: 'RT19',
    categoryId: 'corniches',
    nameAr: 'كرنيشة PS عريضة كلاسيك',
    dimensionsAr: '8×8 سم (وتر 11 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_plain',
    widthTier: 'wide',
    catalogPage: 3,
  },
  {
    id: 'ps_rt58',
    brand: 'ps_mlkawy',
    code: 'RT58',
    categoryId: 'corniches',
    nameAr: 'كرنيشة PS جامبو للصالات',
    dimensionsAr: '9.5×9.5 سم (وتر 13 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_plain',
    widthTier: 'wide',
    catalogPage: 3,
  },
  {
    id: 'ps_rt121',
    brand: 'ps_mlkawy',
    code: 'RT121',
    categoryId: 'corniches',
    nameAr: 'كرنيشة PS فلات مودرن 13 سم',
    dimensionsAr: '9×8 سم (وتر 13 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_plain',
    widthTier: 'wide',
    catalogPage: 3,
  },

  // Page 4: كرانيش بيت النور PS
  {
    id: 'ps_rt020',
    brand: 'ps_mlkawy',
    code: 'RT020',
    categoryId: 'light_corniches',
    nameAr: 'كرنيشة بيت نور LED وسط',
    dimensionsAr: '6.5×5 سم (وتر 8 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_light',
    widthTier: 'medium',
    catalogPage: 4,
    notesAr: 'مجهزة لإخفاء شريط الليد وإضاءة السقف غير المباشرة',
  },
  {
    id: 'ps_rt050',
    brand: 'ps_mlkawy',
    code: 'RT050',
    categoryId: 'light_corniches',
    nameAr: 'كرنيشة بيت نور LED عريضة',
    dimensionsAr: '6×9.5 سم (وتر 11.3 سم)',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'corniche_light',
    widthTier: 'wide',
    catalogPage: 4,
    notesAr: 'ارتفاع 9.5 سم لإضاءة سقف قوية ومميزة',
  },

  // Page 5: وزر أرضيات PS
  {
    id: 'ps_rt07',
    brand: 'ps_mlkawy',
    code: 'RT07',
    categoryId: 'skirtings',
    nameAr: 'وزرة أرضيات PS بإضاءة ليد سفلية',
    dimensionsAr: 'ارتفاع 10 سم',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'skirting_led',
    widthTier: 'medium',
    catalogPage: 5,
    notesAr: 'تحتوي على مجرى سفلي لإخفاء شريط إضاءة LED للأرضية',
  },
  {
    id: 'ps_rt15',
    brand: 'ps_mlkawy',
    code: 'RT15',
    categoryId: 'skirtings',
    nameAr: 'وزرة أرضيات PS فاخرة 15 سم',
    dimensionsAr: 'ارتفاع 15 سم',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'skirting',
    widthTier: 'wide',
    catalogPage: 5,
  },
  {
    id: 'ps_rt33',
    brand: 'ps_mlkawy',
    code: 'RT33',
    categoryId: 'skirtings',
    nameAr: 'وزرة أرضيات PS كلاسيك 10 سم',
    dimensionsAr: 'ارتفاع 10 سم',
    lengthAr: 'طول العود 2.40م',
    patternKind: 'skirting',
    widthTier: 'medium',
    catalogPage: 5,
  },

  // Page 6: زوايا الحوائط PS
  {
    id: 'ps_rt32',
    brand: 'ps_mlkawy',
    code: 'RT32',
    categoryId: 'angles',
    nameAr: 'زاوية حماية أركان الحوائط PS',
    dimensionsAr: '2.5×2.5 سم',
    lengthAr: 'طول العود 2.80م',
    patternKind: 'angle',
    widthTier: 'medium',
    catalogPage: 6,
  },
];

// ===================== 2) كتالوج نيوتك 2025 (Newtec 2025) — فيوتك وفوم =====================
type CompactNewtecRow = [
  code: string,
  categoryId: MouldingCategoryId,
  nameAr: string,
  dimensionsAr: string,
  lengthAr: string,
  patternKind: MouldingPatternKind,
  widthTier: 'slim' | 'medium' | 'wide',
  page: number,
  recommendedScene?: RoomSceneType,
];

const NEWTEC_RAW: CompactNewtecRow[] = [
  // ---- CORNICHE Page 4 (p.1) ----
  ['K 217', 'light_corniches', 'كرنيشة سقف بيت نور', '18×17 سم · وتر 24 سم', '240 سم', 'corniche_light', 'wide', 4],
  ['K 55', 'corniches', 'كرنيشة سقف عريضة مدرجة', '14.5×15.5 سم · وتر 21 سم', '240 سم', 'corniche_plain', 'wide', 4],
  ['K 200', 'light_corniches', 'كرنيشة بيت نور مزخرفة', '12.5×14.5 سم · وتر 18.5 سم', '200 سم', 'corniche_light', 'wide', 4],
  ['K 144', 'corniches', 'كرنيشة سقف متدرجة', '12.5×12.5 سم · وتر 18 سم', '240 سم', 'corniche_plain', 'wide', 4],
  ['K 250', 'light_corniches', 'كرنيشة بيت نور + سبوت ليد', '6×25 سم', '240 سم', 'corniche_light', 'wide', 4],
  ['K 99', 'corniches', 'كرنيشة سقف كلاسيك', '12×13 سم · وتر 18 سم', '240 سم', 'corniche_plain', 'wide', 4],
  ['K 150', 'light_corniches', 'كرنيشة بيت نور + سبوت', '5×16 سم', '240 سم', 'corniche_light', 'medium', 4],
  ['K 100', 'corniches', 'كرنيشة سقف عريضة 15 سم', '15×10 سم · وتر 17 سم', '240 سم', 'corniche_plain', 'wide', 4],

  // ---- CORNICHE Page 5 (p.2) ----
  ['K 7', 'corniches', 'كرنيشة سقف مزدوجة', '11×12 سم · وتر 16 سم', '244 سم', 'corniche_plain', 'wide', 5],
  ['K 171', 'corniches', 'كرنيشة سقف ناعمة', '9.5×9.5 سم · وتر 13 سم', '240 سم', 'corniche_plain', 'medium', 5],
  ['K 71', 'corniches', 'كرنيشة سقف مدرجة', '11×11.5 سم · وتر 15.5 سم', '240 سم', 'corniche_plain', 'wide', 5],
  ['K 39 / K 139', 'corniches', 'كرنيشة فلات مركبة', '7×10 سم · وتر 12 سم', '240 سم', 'corniche_plain', 'medium', 5],
  ['K 137', 'corniches', 'كرنيشة سقف متوازنة', '11×10.5 سم · وتر 15 سم', '240 سم', 'corniche_plain', 'wide', 5],
  ['K 39', 'corniches', 'كرنيشة سقف سيمبل', '8×10 سم · وتر 12 سم', '244 سم', 'corniche_plain', 'medium', 5],
  ['K 58', 'corniches', 'كرنيشة سقف مودرن 9.5 سم', '9.5×9.5 سم · وتر 13 سم', '244 سم', 'corniche_plain', 'medium', 5],
  ['K 139', 'corniches', 'وزرة سقف رأسية رفيعة', '1.5×12.5 سم', '240 سم', 'corniche_plain', 'slim', 5],

  // ---- CORNICHE Page 6 (p.3) ----
  ['K 152', 'corniches', 'كرنيشة سقف مقوسة', '10×7 سم · وتر 12.1 سم', '240 سم', 'corniche_plain', 'medium', 6],
  ['K 41', 'corniches', 'كرنيشة سقف ستيب مودرن', '9×6 سم · وتر 11 سم', '240 سم', 'corniche_plain', 'medium', 6],
  ['K 37', 'corniches', 'كرنيشة سقف متدرجة', '9×8 سم · وتر 12 سم', '200 سم', 'corniche_plain', 'medium', 6],
  ['K 3', 'corniches', 'كرنيشة سقف أنيقة', '8×8 سم · وتر 11 سم', '244 سم', 'corniche_plain', 'medium', 6],
  ['K 52', 'corniches', 'كرنيشة سقف ناعمة', '9.5×8 سم · وتر 11.5 سم', '240 سم', 'corniche_plain', 'medium', 6],
  ['K 216', 'corniches', 'كرنيشة سقف سقوط 9 سم', '7×9 سم · وتر 11 سم', '240 سم', 'corniche_plain', 'medium', 6],
  ['K 133', 'corniches', 'كرنيشة سقف سيمبل 8×8', '8×8 سم · وتر 11 سم', '244 سم', 'corniche_plain', 'medium', 6],
  ['K 136', 'corniches', 'كرنيشة سقف خطوط بارزة', '7×7 سم · وتر 10.5 سم', '240 سم', 'corniche_plain', 'medium', 6],

  // ---- CORNICHE Page 7 (p.4) ----
  ['K 102', 'corniches', 'كرنيشة سقف بخرز دقيق', '7.8×7.6 سم · وتر 10.5 سم', '240 سم', 'corniche_ornate', 'medium', 7],
  ['K 36', 'corniches', 'كرنيشة سقف ناعمة 9 سم', '4.5×7.5 سم · وتر 9 سم', '244 سم', 'corniche_plain', 'slim', 7],
  ['K 44', 'corniches', 'كرنيشة سقف وسط 8 سم', '8×7.5 سم · وتر 10.4 سم', '240 سم', 'corniche_plain', 'medium', 7],
  ['K 38', 'corniches', 'كرنيشة سقف مدرجة 5×8', '5×8 سم · وتر 9 سم', '240 سم', 'corniche_plain', 'medium', 7],
  ['K 31', 'corniches', 'كرنيشة سقف بنقش دقيق', '4.5×9 سم · وتر 10 سم', '240 سم', 'corniche_ornate', 'medium', 7],
  ['K 1', 'corniches', 'كرنيشة سقف كلاسيك 1', '5×7.5 سم · وتر 8.5 سم', '244 سم', 'corniche_plain', 'slim', 7],
  ['K 129', 'corniches', 'كرنيشة سقف مريحة للعين', '6.5×7 سم · وتر 9.5 سم', '240 سم', 'corniche_plain', 'slim', 7],
  ['K 116', 'corniches', 'كرنيشة سقف مودرن ناعمة', '6×6 سم · وتر 7.5 سم', '240 سم', 'corniche_plain', 'slim', 7],

  // ---- CORNICHE Page 8 (p.5) ----
  ['K 229', 'corniches', 'كرنيشة سقف طولية 4×8', '4×8 سم · وتر 8 سم', '240 سم', 'corniche_plain', 'slim', 8],
  ['K 101', 'corniches', 'كرنيشة سقف صغيرة ستيب', '4.5×4.5 سم · وتر 6.5 سم', '240 سم', 'corniche_plain', 'slim', 8],
  ['K 15', 'corniches', 'كرنيشة سقف غرف نوم', '5×5.5 سم · وتر 7 سم', '244 سم', 'corniche_plain', 'slim', 8],
  ['K 9', 'corniches', 'كرنيشة سقف رقيقة 4×4', '4×4 سم · وتر 6 سم', '244 سم', 'corniche_plain', 'slim', 8],
  ['K 30', 'corniches', 'كرنيشة سقف 4.5 سم', '4.5×4.5 سم · وتر 7 سم', '244 سم', 'corniche_plain', 'slim', 8],
  ['K 231', 'corniches', 'كرنيشة سقف مضيئة خطوط', '4.4×3.3 سم · وتر 5 سم', '240 سم', 'corniche_plain', 'slim', 8],
  ['K 40', 'corniches', 'كرنيشة سقف صغيرة انسيابية', '4.5×5.3 سم · وتر 6.6 سم', '240 سم', 'corniche_plain', 'slim', 8],
  ['K 25', 'corniches', 'كرنيشة رفيعة مطابخ وحمامات', '3×3.5 سم · وتر 4 سم', '200 سم', 'corniche_plain', 'slim', 8],
  ['K 56', 'corniches', 'كرنيشة صغيرة 3×3 سم', '3×3 سم · وتر 4 سم', '200 سم', 'corniche_plain', 'slim', 8],

  // ---- LIGHT CORNICHES Page 9 (p.6) ----
  ['KL 1', 'light_corniches', 'كرنيشة بيت نور KL1 مدمجة', '3.5×5 سم · وتر 6 سم', '240 سم', 'corniche_light', 'slim', 9],
  ['KL 2', 'light_corniches', 'كرنيشة بيت نور KL2 علوية', '6.5×5 سم · وتر 8 سم', '240 سم', 'corniche_light', 'medium', 9],
  ['KL 3', 'light_corniches', 'كرنيشة بيت نور KL3 منحنية', '4.5×7.5 سم · وتر 9 سم', '240 سم', 'corniche_light', 'medium', 9],
  ['KL 4', 'light_corniches', 'كرنيشة بيت نور KL4 فلات', '4.5×8 سم · وتر 9 سم', '240 سم', 'corniche_light', 'medium', 9],
  ['KL 5', 'light_corniches', 'كرنيشة بيت نور KL5 عريضة', '6×9.5 سم · وتر 11.5 سم', '240 سم', 'corniche_light', 'wide', 9],

  // ---- ORNATE CORNICHES Pages 10-12 (p.7-9) ----
  ['K 20', 'corniches', 'كرنيشة صالون مزخرفة ملكية', '16×17 سم · وتر 23 سم', '240 سم', 'corniche_ornate', 'wide', 10, 'salon'],
  ['K 14', 'corniches', 'كرنيشة سقف مزخرفة أوراق', '12.5×15 سم · وتر 18 سم', '240 سم', 'corniche_ornate', 'wide', 10, 'salon'],
  ['K 2', 'corniches', 'كرنيشة دانتيل كلاسيك فخمة', '15×15 سم · وتر 19 سم', '210 سم', 'corniche_ornate', 'wide', 10, 'salon'],
  ['K 17', 'corniches', 'كرنيشة سقف نقش عربي/أوروبي', '9×15 سم · وتر 17 سم', '240 سم', 'corniche_ornate', 'wide', 10, 'salon'],
  ['K 8', 'corniches', 'كرنيشة بصفوف منقوشة', '12.5×12.5 سم · وتر 19 سم', '240 سم', 'corniche_ornate', 'wide', 10, 'salon'],
  ['K 6', 'corniches', 'كرنيشة مزخرفة سقوط 15 سم', '6.5×15 سم · وتر 16 سم', '200 سم', 'corniche_ornate', 'wide', 10, 'salon'],
  ['K 27', 'corniches', 'كرنيشة نقشة جريك فرعوني', '6.5×15 سم · وتر 18 سم', '200 سم', 'corniche_ornate', 'wide', 10, 'salon'],
  ['K 26', 'corniches', 'كرنيشة زخارف زهور بارزة', '7.5×14.5 سم · وتر 16 سم', '200 سم', 'corniche_ornate', 'wide', 10, 'salon'],
  ['K 24', 'corniches', 'كرنيشة مزخرفة 13 سم', '10×13 سم · وتر 16.5 سم', '200 سم', 'corniche_ornate', 'wide', 11, 'salon'],
  ['K 12', 'corniches', 'كرنيشة بأسنان كلاسيك', '9.5×9.5 سم · وتر 13 سم', '210 سم', 'corniche_ornate', 'medium', 11, 'salon'],
  ['K 5', 'corniches', 'كرنيشة نقشة أوراق مزدوجة', '5×8 سم · وتر 15 سم', '200 سم', 'corniche_ornate', 'medium', 11],
  ['K 28', 'corniches', 'كرنيشة سقوط 11 سم مزخرفة', '5×11 سم · وتر 12 سم', '244 سم', 'corniche_ornate', 'medium', 11],
  ['K 50', 'corniches', 'كرنيشة دانتيل متوسط', '7.5×12 سم · وتر 13.5 سم', '244 سم', 'corniche_ornate', 'medium', 11],
  ['K 23', 'corniches', 'كرنيشة مزخرفة ناعمة 9.5', '9.5×9.5 سم · وتر 11.5 سم', '240 سم', 'corniche_ornate', 'medium', 11],
  ['K 13', 'corniches', 'كرنيشة مزخرفة متداخلة', '9×10.5 سم · وتر 13 سم', '205 سم', 'corniche_ornate', 'medium', 11],
  ['K 18', 'corniches', 'كرنيشة مزخرفة أنيقة 7×8', '7×8 سم · وتر 10 سم', '240 سم', 'corniche_ornate', 'medium', 11],
  ['K 59', 'corniches', 'كرنيشة مزخرفة سيمبل 7×8', '7×8 سم · وتر 10.5 سم', '240 سم', 'corniche_ornate', 'medium', 12],
  ['K 16', 'corniches', 'كرنيشة مزخرفة غرف 4×7.5', '4×7.5 سم · وتر 8.5 سم', '200 سم', 'corniche_ornate', 'slim', 12],
  ['K 32', 'corniches', 'كرنيشة نقشة لؤلؤ وأوراق', '6.6×7.4 سم · وتر 10 سم', '240 سم', 'corniche_ornate', 'medium', 12],
  ['K 21', 'corniches', 'كرنيشة صف زخارف صغير', '6.5×8.8 سم · وتر 8.5 سم', '240 سم', 'corniche_ornate', 'medium', 12],
  ['K 29', 'corniches', 'كرنيشة مزخرفة رفيعة 3×8.5', '3×8.5 سم · وتر 9 سم', '240 سم', 'corniche_ornate', 'slim', 12],
  ['K 19', 'corniches', 'كرنيشة مزخرفة خفيفة 3×6.5', '3×6.5 سم · وتر 7 سم', '200 سم', 'corniche_ornate', 'slim', 12],
  ['K 105', 'corniches', 'كرنيشة بخرز ناعم 6.5×6', '6.5×6 سم · وتر 8.8 سم', '240 سم', 'corniche_ornate', 'slim', 12],

  // ---- FRAMES & WALL PANELS Pages 14-20, 23-25 ----
  ['K 11', 'panels', 'طقم بانوه مزخرف وزوايا RB11.1–RB11.9', 'عرض 4 سم + 9 زوايا', '244 سم', 'panel_ornate', 'medium', 14, 'salon'],
  ['K 110', 'panels', 'طقم بانوه أكتاف مقوس RB110', 'عرض 4 سم + زاويتين', '240 سم', 'panel_arch', 'medium', 14],
  ['K 240', 'panels', 'طقم بانوه ملكي كامل RB240.1–RB240.14', 'عرض 4 سم + 14 حليه وتاج', '244 سم', 'panel_ornate', 'wide', 15, 'salon'],
  ['K 220', 'panels', 'بانوه بتاج علوي وزوايا RB220', 'عرض 2 سم + تاج', '244 سم', 'panel_ornate', 'slim', 16],
  ['K 320', 'panels', 'بانوه حائط سيمبل عريض', 'عرض 3 سم', '240 سم', 'panel_classic', 'medium', 16],
  ['K 120', 'panels', 'بانوه حائط رفيع أنيق', 'عرض 2.5 سم', '244 سم', 'panel_classic', 'slim', 16],
  ['K 35', 'panels', 'بانوه بأركان مزخرفة RB35.1–RB35.4', 'عرض 2.2 سم + 4 زوايا', '244 سم', 'panel_ornate', 'slim', 16],
  ['K 225', 'panels', 'بانوه حائط سيمبل 2.5 سم', 'عرض 2.5 سم', '244 سم', 'panel_classic', 'slim', 16],
  ['K 260', 'panels', 'بانوه عريض بزوايا RB260.1–RB260.2', 'عرض 6 سم', '244 سم', 'panel_arch', 'wide', 18],
  ['K 123', 'panels', 'بانوه جامبو 7 سم بزاوية RB123.1', 'عرض 7 سم', '240 سم', 'panel_arch', 'wide', 18],
  ['K 111', 'panels', 'فاصل حائط مزخرف كلاسيك', 'عرض 12 سم', '200 سم', 'panel_ornate', 'wide', 19, 'salon'],
  ['K 165', 'panels', 'فاصل حائط جريك فخم', 'عرض 7.5 سم', '240 سم', 'panel_classic', 'wide', 19],
  ['K 126', 'panels', 'فاصل حائط بنقشة زهور بارزة', 'عرض 11 سم', '200 سم', 'panel_ornate', 'wide', 19, 'salon'],
  ['K 125', 'panels', 'فاصل حائط مدرج 8 سم', 'عرض 8 سم', '200 سم', 'panel_classic', 'wide', 19],
  ['K 130', 'panels', 'برواز/فاصل حائط 6 سم', 'عرض 6 سم', '240 سم', 'panel_classic', 'medium', 19],
  ['K 221', 'panels', 'فاصل حائط مودرن فلات 7 سم', 'عرض 7 سم', '240 سم', 'panel_classic', 'wide', 19],
  ['K 33', 'panels', 'بانوه حبات اللؤلؤ وزوايا RB33', 'عرض 6 سم + زوايا', '240 سم', 'panel_ornate', 'wide', 20],
  ['K 34', 'panels', 'بانوه أوراق الشجر وزوايا RB34', 'عرض 5 سم + زوايا', '240 سم', 'panel_ornate', 'medium', 20],
  ['K 10', 'panels', 'بانوه مضفر وزاوية RB10.1', 'عرض 5 سم', '200 سم', 'panel_ornate', 'medium', 20],
  ['FD 19', 'panels', 'طقم أبليك زخرفي عمودي 5 قطع', 'مقاس كامل للتجميع', 'طقم 5 قطع', 'panel_ornate', 'wide', 23, 'salon'],
  ['FD 15', 'panels', 'طقم تيجان وأبليك كلاسيك 5 قطع', 'مقاس كامل للتجميع', 'طقم 5 قطع', 'panel_ornate', 'wide', 23, 'salon'],
  ['FD 2', 'panels', 'أبليك تاج زهور عرض 78 سم', '22×78 سم', 'قطعة', 'panel_ornate', 'wide', 24, 'salon'],
  ['FD 18', 'panels', 'أبليك تاج كلاسيك 60 سم', '19×60 سم', 'قطعة', 'panel_ornate', 'wide', 24, 'salon'],
  ['FD 1', 'panels', 'أبليك مروحة زخرفية', '20×45 سم', 'قطعة', 'panel_ornate', 'medium', 24],
  ['FD 4', 'panels', 'تاج هرمي مزخرف 80 سم', '35×80 سم', 'قطعة', 'panel_ornate', 'wide', 24, 'salon'],
  ['FD 17', 'panels', 'حلية أرابيسك متناظرة', '18×39 سم', 'قطعة', 'panel_ornate', 'medium', 24],
  ['FD 5', 'panels', 'أبليك تاج فاخر 90 سم', '32×90 سم', 'قطعة', 'panel_ornate', 'wide', 24, 'salon'],
  ['FD 7', 'panels', 'حلية بانوه أفقية رفيعة', '7×31 سم', 'قطعة', 'panel_ornate', 'slim', 24],
  ['FD 16', 'panels', 'تاج قصر مزخرف وسط', '22×40 سم', 'قطعة', 'panel_ornate', 'medium', 24],
  ['FD 8', 'panels', 'شريط وردة وزخرفة متدلية', '16×37 سم', 'قطعة', 'panel_ornate', 'medium', 24],
  ['FD 9', 'panels', 'أبليك وردة بارزة مع حليتين', '20×40 سم', 'قطعة', 'panel_ornate', 'medium', 24],
  ['FD 3', 'panels', 'حلية كلاسيك بوردة وسطى', '12×35 سم', 'قطعة', 'panel_ornate', 'slim', 24],
  ['FD 6', 'panels', 'حلية ورود رقيقة', '11×30 سم', 'قطعة', 'panel_ornate', 'slim', 24],
  ['DF 93', 'panels', 'طقم برواز وتاج باب كامل (DF93)', 'برواز باب متكامل بالتاج والقواعد', 'طقم كامل', 'door_frame', 'wide', 25, 'salon'],
  ['DF 12 / DF 9', 'panels', 'كتف برواز باب مضلع + تاج مربع', '200×9.5×2 سم', '200 سم', 'door_frame', 'medium', 25],
  ['DF 13 / DF 10', 'panels', 'كتف برواز باب ناعم + تاج وردة', '200×9.2×3 سم', '200 سم', 'door_frame', 'medium', 25],
  ['FD 75', 'panels', 'حشوة باب علوية مقوسة', '55×75 سم', 'لوح', 'door_frame', 'wide', 25],
  ['FD 22', 'panels', 'حشوة باب وسطى مستطيلة', '55×22 سم', 'لوح', 'door_frame', 'medium', 25],
  ['FD 90', 'panels', 'حشوة باب سفلية مربعة', '55×90 سم', 'لوح', 'door_frame', 'wide', 25],

  // ---- SKIRTINGS Page 21 (p.17) ----
  ['S 10', 'skirtings', 'وزرة أرضيات سيمبل 10 سم', 'ارتفاع 10 سم', '240 سم', 'skirting', 'medium', 21],
  ['M 9', 'skirtings', 'وزرة أرضيات مودرن 9 سم', 'ارتفاع 9 سم', '240 سم', 'skirting', 'slim', 21],
  ['S 11', 'skirtings', 'وزرة أرضيات خط مزدوج 9.8 سم', 'ارتفاع 9.8 سم', '200 سم', 'skirting', 'medium', 21],
  ['M 21', 'skirtings', 'وزرة أرضيات عالية فاخرة 15 سم', 'ارتفاع 15 سم', '240 سم', 'skirting', 'wide', 21],
  ['S 15', 'skirtings', 'وزرة أرضيات ناعمة 15 سم', 'ارتفاع 15 سم', '200 سم', 'skirting', 'wide', 21],
  ['S 20', 'skirtings', 'وزرة أرضيات ستيب 15 سم', 'ارتفاع 15 سم', '240 سم', 'skirting', 'wide', 21],

  // ---- ANGLES Page 22 (p.18) ----
  ['KB 21', 'angles', 'زاوية حماية أركان مضلعة 3×3', '3×3 سم', '270 / 200 سم', 'angle', 'slim', 22],
  ['KB 22', 'angles', 'زاوية حماية أركان ناعمة 4×4', '4×4 سم', '240 سم', 'angle', 'medium', 22],
  ['KB 23', 'angles', 'زاوية حماية أركان 3×3', '3×3 سم', '244 سم', 'angle', 'slim', 22],
  ['KB 24', 'angles', 'زاوية أركان عريضة 5×5', '5×5 سم', '240 سم', 'angle', 'wide', 22],
  ['KB 105', 'angles', 'زاوية أحجار متشابكة ديكورية', 'مقاس متشابك', '200 سم', 'angle', 'wide', 22],
  ['KB 115', 'angles', 'زاوية ركنية بلوكات بارزة', 'مقاس بلوك بارز', '200 سم', 'angle', 'wide', 22],

  // ---- WOOD PANELS Pages 26-29 (p.22-25) ----
  ['WP 1', 'wood_panels', 'شرائح بديل خشب عريضة كلاسيك', '280×20 سم', '280 سم', 'wood_slat_wide', 'wide', 26, 'living'],
  ['WP 2', 'wood_panels', 'شرائح بديل خشب مزدوجة', '280×20 سم', '280 سم', 'wood_slat_wide', 'medium', 27, 'living'],
  ['WP 3', 'wood_panels', 'شرائح بديل خشب رفيعة كثيفة', '280×20 سم', '280 سم', 'wood_slat_fine', 'slim', 28, 'bedroom'],
  ['WP 4', 'wood_panels', 'ألواح بديل خشب مموجة ناعمة', '280×18.5 سم', '280 سم', 'wood_wave', 'wide', 29, 'living'],

  // ---- 3D WALL PANELS Pages 31-50 (p.26-45) ----
  ['3D 200', 'panels_3d', 'ألواح حجر صخري طبيعي 3D', '120×60 سم', 'لوح', 'wall_3d_rock', 'wide', 31],
  ['3D 300', 'panels_3d', 'ألواح صخر رملي متموج 3D', '120×60 سم', 'لوح', 'wall_3d_rock', 'wide', 32],
  ['3D 400', 'panels_3d', 'ألواح صخور جبلية بارزة 3D', '120×60 سم', 'لوح', 'wall_3d_rock', 'wide', 33],
  ['3D 500', 'panels_3d', 'ألواح بلوكات حجرية مقسمة 3D', '60×120 سم', 'لوح', 'wall_3d_brick', 'wide', 34],
  ['3D 600', 'panels_3d', 'ألواح أمواج حريرية ناعمة 3D', '60×120 سم', 'لوح', 'wall_3d_wave', 'wide', 35],
  ['3D 1', 'panels_3d', 'بانوه 3D أهرامات ماسية 50×50', '50×50 سم', 'بلاطة', 'wall_3d_diamond', 'medium', 36],
  ['3D 2', 'panels_3d', 'بانوه 3D كابوتونيه وأقواس 40×40', '40×40 سم', 'بلاطة', 'wall_3d_tufted', 'medium', 36],
  ['3D 3', 'panels_3d', 'بانوه 3D كابوتونيه بأزرار 40×40', '40×40 سم', 'بلاطة', 'wall_3d_tufted', 'medium', 37],
  ['3D 4', 'panels_3d', 'بانوه 3D مبطن معينات 40×40', '40×40 سم', 'بلاطة', 'wall_3d_diamond', 'medium', 37],
  ['3D 5', 'panels_3d', 'بانوه 3D أوريغامي هندسي 50×50', '50×50 سم', 'بلاطة', 'wall_3d_origami', 'wide', 38],
  ['3D 6', 'panels_3d', 'بانوه 3D شرائط طوب متدرجة 50×50', '50×50 سم', 'بلاطة', 'wall_3d_brick', 'medium', 38],
  ['3D 7', 'panels_3d', 'بانوه 3D أقواس ودوائر هندسية', '50×50 سم', 'بلاطة', 'wall_3d_circle', 'medium', 39],
  ['3D 8', 'panels_3d', 'بانوه 3D حصى وأحجار ناعمة', '50×50 سم', 'بلاطة', 'wall_3d_rock', 'medium', 39],
  ['3D 9', 'panels_3d', 'ألواح تجاليد طولية لامبري 50×100', '50×100 سم', 'لوح', 'wood_slat_wide', 'wide', 40],
  ['3D 10', 'panels_3d', 'بانوه 3D مربعات متداخلة 50×50', '50×50 سم', 'بلاطة', 'wall_3d_diamond', 'medium', 40],
  ['3D 15', 'panels_3d', 'فوم حجري طوب أبيض 3D 15', '77.3×70.3 سم', 'لوح', 'wall_3d_brick', 'wide', 41],
  ['3D 20', 'panels_3d', 'بانوه 3D أمواج متصلة 50×50', '50×50 سم', 'بلاطة', 'wall_3d_wave', 'medium', 41],
  ['3D 23', 'panels_3d', 'لوح 3D أمواج طويلة 80×62', '80×62 سم', 'لوح', 'wall_3d_wave', 'wide', 42],
  ['3D 25', 'panels_3d', 'بانوه 3D 4 مربعات مبطنة 40×40', '40×40 سم', 'بلاطة', 'wall_3d_tufted', 'medium', 42],
  ['3D 28', 'panels_3d', 'بانوه 3D نجمة وزهرة هندسية', '50×50 سم', 'بلاطة', 'wall_3d_origami', 'wide', 43],
  ['3D 31', 'panels_3d', 'بانوه 3D خطوط متموجة عمودية', '50×50 سم', 'بلاطة', 'wall_3d_wave', 'medium', 43],
  ['3D 30', 'panels_3d', 'بانوه 3D ورد مبطن 40×40', '40×40 سم', 'بلاطة', 'wall_3d_tufted', 'medium', 44],
  ['3D 40', 'panels_3d', 'لوح 3D طوب بارز 80×62', '80×62 سم', 'لوح', 'wall_3d_brick', 'wide', 45],
  ['3D 45', 'panels_3d', 'بانوه 3D نجمية مقوسة 50×50', '50×50 سم', 'بلاطة', 'wall_3d_diamond', 'medium', 45],
  ['3D 50', 'panels_3d', 'بانوه 3D موجات وأصداف 50×50', '50×50 سم', 'بلاطة', 'wall_3d_wave', 'medium', 46],
  ['3D 55', 'panels_3d', 'بانوه 3D شرائط منحنية 50×50', '50×50 سم', 'بلاطة', 'wall_3d_strips', 'medium', 46],
  ['3D 60', 'panels_3d', 'بانوه 3D مكعبات 3D متفاوتة', '50×50 سم', 'بلاطة', 'wall_3d_brick', 'wide', 47],
  ['3D 70', 'panels_3d', 'لوح 3D أمواج خطوط دقيقة 80×60', '80×60 سم', 'لوح', 'wall_3d_wave', 'wide', 47],
  ['3D 80', 'panels_3d', 'بانوه 3D دوائر وفقاعات 50×50', '50×50 سم', 'بلاطة', 'wall_3d_circle', 'medium', 48],
  ['3D 90', 'panels_3d', 'بانوه 3D أرابيسك ومعينات 50×50', '50×50 سم', 'بلاطة', 'wall_3d_tufted', 'wide', 48],
  ['3D 100', 'panels_3d', 'بانوه 3D دوائر حلزونية 50×50', '50×50 سم', 'بلاطة', 'wall_3d_circle', 'wide', 49],
  ['FD 30', 'panels_3d', 'بانوه فايبر جاهز مستطيل 30×60', '30×60 سم', 'لوح جاهز', 'panel_classic', 'medium', 50],
  ['FD 50', 'panels_3d', 'بانوه فايبر جاهز مربع 50×60', '50×60 سم', 'لوح جاهز', 'panel_classic', 'wide', 50],

  // ---- MEDALLIONS Pages 52-55 (p.46-49) ----
  ['R 41', 'medallions', 'صرة سقف كبيرة مزخرفة 83 سم', 'قطر 83 سم', 'قطعة', 'medallion', 'wide', 52, 'salon'],
  ['R 12', 'medallions', 'صرة سقف نجمة وأشعة 76.5 سم', 'قطر 76.5 سم', 'قطعة', 'medallion', 'wide', 52, 'salon'],
  ['R 40', 'medallions', 'صرة سقف بيضاوية فاخرة', '76.5×61.5 سم', 'قطعة', 'medallion', 'wide', 52, 'salon'],
  ['R 13', 'medallions', 'صرة سقف زهور بارزة 66 سم', 'قطر 66 سم', 'قطعة', 'medallion', 'wide', 52, 'salon'],
  ['R 25', 'medallions', 'صرة سقف نقشة جريك فرعونية', 'قطر 65 سم', 'قطعة', 'medallion', 'wide', 52],
  ['R 33', 'medallions', 'صرة سقف زهور كلاسيك 64.5 سم', 'قطر 64.5 سم', 'قطعة', 'medallion', 'wide', 52],
  ['R 20', 'medallions', 'صرة سقف بيضاوية رقيقة', '61×31 سم', 'قطعة', 'medallion', 'medium', 52],
  ['R 100 / R 10', 'medallions', 'صرة سقف دائرية بزهور 60 / 40 سم', 'قطر 60 أو 40 سم', 'قطعة', 'medallion', 'medium', 52],
  ['R 27', 'medallions', 'صرة سقف أوراق نباتية 58 سم', 'قطر 58 سم', 'قطعة', 'medallion', 'medium', 53],
  ['R 26', 'medallions', 'صرة سقف شمس بارزة 55 سم', 'قطر 55 سم', 'قطعة', 'medallion', 'medium', 53],
  ['R 11', 'medallions', 'صرة سقف زهرية فاخرة 53 سم', 'قطر 53 سم', 'قطعة', 'medallion', 'medium', 53],
  ['R 1 / R 4 / R 44 / R 22', 'medallions', 'صرة سقف حلقات سيمبل مودرن', 'أقطار 30 / 40 / 50 / 60 سم', 'قطعة', 'medallion', 'medium', 53],
  ['R 35', 'medallions', 'صرة سقف وردة 50 سم', 'قطر 50 سم', 'قطعة', 'medallion', 'medium', 53],
  ['R 9', 'medallions', 'صرة سقف بتلات متداخلة 48 سم', 'قطر 48 سم', 'قطعة', 'medallion', 'medium', 53],
  ['R 7', 'medallions', 'صرة سقف زخارف وسط 47 سم', 'قطر 47 سم', 'قطعة', 'medallion', 'medium', 53],
  ['R 8', 'medallions', 'صرة سقف دائرية بأزهار 47 سم', 'قطر 47 سم', 'قطعة', 'medallion', 'medium', 53],
  ['R 30', 'medallions', 'صرة سقف بيضاوية 47×43 سم', '47×43 سم', 'قطعة', 'medallion', 'medium', 54],
  ['R 6', 'medallions', 'صرة سقف هندسية كلاسيك 45 سم', 'قطر 45 سم', 'قطعة', 'medallion', 'medium', 54],
  ['R 5', 'medallions', 'صرة سقف جريك متكاملة 45 سم', 'قطر 45 سم', 'قطعة', 'medallion', 'medium', 54],
  ['R 24', 'medallions', 'صرة سقف خرز وحلقات 40 سم', 'قطر 40 سم', 'قطعة', 'medallion', 'slim', 54],
  ['R 23', 'medallions', 'صرة سقف زهرة دوار الشمس 40 سم', 'قطر 40 سم', 'قطعة', 'medallion', 'slim', 54],
  ['R 3', 'medallions', 'صرة سقف سيمبل ناعمة 40 سم', 'قطر 40 سم', 'قطعة', 'medallion', 'slim', 54],
  ['R 21', 'medallions', 'صرة سقف أرابيسك دقيق 40 سم', 'قطر 40 سم', 'قطعة', 'medallion', 'slim', 54],
  ['R 16', 'medallions', 'صرة سقف حواف متعرجة 44 سم', 'قطر 44 سم', 'قطعة', 'medallion', 'medium', 54],
  ['R 2', 'medallions', 'صرة سقف زهور 40 سم', 'قطر 40 سم', 'قطعة', 'medallion', 'slim', 55],
  ['R 14', 'medallions', 'صرة سقف صغيرة غرف 31 سم', 'قطر 31 سم', 'قطعة', 'medallion', 'slim', 55],
  ['R 15', 'medallions', 'صرة سقف دوامة عصرية 31 سم', 'قطر 31 سم', 'قطعة', 'medallion', 'slim', 55],
  ['R 19', 'medallions', 'صرة سبوت/نجفة صغيرة 15.5 سم', 'قطر 15.5 سم', 'قطعة', 'medallion', 'slim', 55],
  ['R 17', 'medallions', 'حلقة سبوت سيمبل 15 سم', 'قطر 15 سم', 'قطعة', 'medallion', 'slim', 55],
  ['R 18', 'medallions', 'صرة سبوت مزخرفة 15 سم', 'قطر 15 سم', 'قطعة', 'medallion', 'slim', 55],

  // ---- CONSOLES & COLUMNS Pages 56-58 (p.50-52) ----
  ['N 6', 'consoles_columns', 'كابولي ديكوري كلاسيك N6', '18×8×28 سم', 'قطعة', 'console', 'medium', 56, 'salon'],
  ['N 5', 'consoles_columns', 'كابولي أوراق أكانتوس N5', '18.3×12×27.7 سم', 'قطعة', 'console', 'medium', 56, 'salon'],
  ['N 101', 'consoles_columns', 'كابولي ناعم كلاسيك N101', '16.5×14.5×32.5 سم', 'قطعة', 'console', 'wide', 56, 'salon'],
  ['N 9', 'consoles_columns', 'كابولي طويل فاخر 51 سم N9', '13×16×51.2 سم', 'قطعة', 'console', 'wide', 56, 'salon'],
  ['N 105', 'consoles_columns', 'كابولي مزخرف بالخرز N105', '17.2×14×33.2 سم', 'قطعة', 'console', 'wide', 56, 'salon'],
  ['N 103', 'consoles_columns', 'كابولي قصر بتاج سفلي N103', '16.5×14.5×32.5 سم', 'قطعة', 'console', 'wide', 56, 'salon'],
  ['N 11', 'consoles_columns', 'كابولي صغير للأركان N11', '10×8×16 سم', 'قطعة', 'console', 'slim', 57],
  ['N 104', 'consoles_columns', 'كابولي رشيق مزخرف N104', '18.2×9.5×22.3 سم', 'قطعة', 'console', 'medium', 57],
  ['N 4', 'consoles_columns', 'كابولي عريض 19 سم N4', '19×9.5×27.8 سم', 'قطعة', 'console', 'medium', 57],
  ['N 8', 'consoles_columns', 'كابولي طويل منحني 40 سم N8', '11×21.2×40.2 سم', 'قطعة', 'console', 'wide', 57, 'salon'],
  ['N 102', 'consoles_columns', 'كابولي نقشة كلاسيك N102', '17×12.5×22.3 سم', 'قطعة', 'console', 'medium', 57],
  ['N 144', 'consoles_columns', 'كابولي ميني 6.5 سم N144', '4×3×6.5 سم', 'قطعة', 'console', 'slim', 57],
  ['P21 / P22 / P23 / P24', 'consoles_columns', 'عمود ديكوري أيوني كامل (P21-P24)', 'ارتفاع كامل 233.5 سم × عرض 35 سم', 'طقم عمود', 'column', 'wide', 58, 'salon'],
  ['C21 / C22 / C23 / C24', 'consoles_columns', 'عمود كورنثي مزخرف كامل (C21-C24)', 'ارتفاع كامل 233.5 سم × عرض 35 سم', 'طقم عمود', 'column', 'wide', 58, 'salon'],
  ['A21 / A22 / A23', 'consoles_columns', 'عمود مودرن هندسي طويل (A21-A23)', 'ارتفاع كامل 255 سم × عرض 34 سم', 'طقم عمود', 'column', 'wide', 58, 'exterior'],

  // ---- EXTERIOR MOULDING Pages 60-61 (p.53-54) ----
  ['E 12', 'exterior', 'كرنيشة واجهات خارجية ستيب E12', '5×12 سم · طول 241 سم', '241 سم', 'exterior_corniche', 'slim', 60, 'exterior'],
  ['E 25', 'exterior', 'كرنيشة واجهات خارجية E25', '10×25 سم · طول 240 سم', '240 سم', 'exterior_corniche', 'medium', 60, 'exterior'],
  ['E 40', 'exterior', 'كرنيشة واجهة فيلا جامبو 40×40', '40×40 سم · طول 240 سم', '240 سم', 'exterior_corniche', 'wide', 60, 'exterior'],
  ['E 23', 'exterior', 'كرنيشة واجهة مقوسة E23', '19×24 سم · طول 245 سم', '245 سم', 'exterior_corniche', 'medium', 60, 'exterior'],
  ['E 33', 'exterior', 'كرنيشة واجهات ستيب E33', '20×33 سم · طول 240 سم', '240 سم', 'exterior_corniche', 'wide', 60, 'exterior'],
  ['040', 'exterior', 'كرنيشة واجهة منحنية 25×30', '25×30 سم · طول 240 سم', '240 سم', 'exterior_corniche', 'wide', 61, 'exterior'],
  ['025', 'exterior', 'إفريز واجهة خارجي 10×25', '10×25 سم · طول 240 سم', '240 سم', 'exterior_corniche', 'medium', 61, 'exterior'],
  ['030', 'exterior', 'إفريز واجهة بارز 15×30', '15×30 سم · طول 240 سم', '240 سم', 'exterior_corniche', 'wide', 61, 'exterior'],
  ['017', 'exterior', 'إفريز شباك وبلكونة 13×17', '13×17 سم · طول 240 سم', '240 سم', 'exterior_corniche', 'slim', 61, 'exterior'],
  ['060', 'exterior', 'كرنيشة واجهة قصر 40×60 جامبو', '40×60 سم · طول 240 سم', '240 سم', 'exterior_corniche', 'wide', 61, 'exterior'],
];

export const FUTEC_NEWTEC_PROFILES: MouldingProfileItem[] = NEWTEC_RAW.map((row, idx) => ({
  id: `nt_${idx + 1}_${row[0].toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  brand: 'futec_newtec',
  code: row[0],
  categoryId: row[1],
  nameAr: row[2],
  dimensionsAr: row[3],
  lengthAr: row[4],
  patternKind: row[5],
  widthTier: row[6],
  catalogPage: row[7],
  recommendedScene: row[8],
}));
