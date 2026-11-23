import { GraffiatoTextureGrade } from './sipesColors';

export type CmbSectionId =
  | 'marmix'
  | 'alwany'
  | 'interior_acrylic'
  | 'graviato'
  | 'decorative'
  | 'epoxy'
  | 'wood';

export interface CmbColorSection {
  id: CmbSectionId;
  nameAr: string;
  shortAr: string;
  subtitleAr: string;
  pdfUrl: string;
  pdfName: string;
  swatchHex: string;
}

export interface CmbColorShade {
  code: string;
  nameAr: string;
  nameEn: string;
  hex: string;
  sectionId: CmbSectionId;
  pageNumber?: number;
  textureGrade?: GraffiatoTextureGrade;
}

export interface CmbProductBase {
  id: string;
  sectionId: CmbSectionId;
  productId?: string;
  nameAr: string;
  finish: 'matt' | 'silk' | 'semigloss';
  finishLabelAr: string;
}

export const CMB_CATALOGS_URL = 'https://cmbegypt.com/cmb/ar/catalogs/';

export const CMB_COLOR_SECTIONS: CmbColorSection[] = [
  {
    id: 'marmix',
    nameAr: 'لاكيه وألكيد مارمكس S40 وكيم لوكس',
    shortAr: 'مارمكس S40 وكيم لوكس',
    subtitleAr:
      'الدرجات المعتمدة لدهان اللاكيه المط واللامع (مارمكس S40، كيم لوكس 999 و333، وكيم برايم) — كتالوج الدهانات الإنشائية ص13',
    pdfUrl: '/assets/catalogs/cmb/CMB_Construction_Paints_Catalog.pdf',
    pdfName: 'CMB_Construction_Paints_Catalog.pdf',
    swatchHex: '#A95F2B',
  },
  {
    id: 'alwany',
    nameAr: 'ملونات ألواني اليونيفرسال (CMB 01–12)',
    shortAr: 'ملونات ألواني',
    subtitleAr:
      'ملونات ألواني المركزة للدهانات المائية والزيتية لتلوين كيماتون وزيناتون وكيماكوت ومارمكس — ص14 بالكتالوج',
    pdfUrl: '/assets/catalogs/cmb/CMB_Construction_Paints_Catalog.pdf',
    pdfName: 'CMB_Construction_Paints_Catalog.pdf',
    swatchHex: '#F2672C',
  },
  {
    id: 'interior_acrylic',
    nameAr: 'دهانات البلاستيك (كيماتون · زيناتون · كيماكوت · رولتون)',
    shortAr: 'بلاستيك كيماتون وكيماكوت',
    subtitleAr:
      'أبيض ناصع وقواعد تلوين الكمبيوتر وCMB Plus لمنتجات كيماتون مط وسيلك، بيو كيماتون، زيناتون 700، كيماكوت 700/400 ورولتون',
    pdfUrl: '/assets/catalogs/cmb/CMB_Construction_Paints_Catalog.pdf',
    pdfName: 'CMB_Construction_Paints_Catalog.pdf',
    swatchHex: '#F4F3EE',
  },
  {
    id: 'graviato',
    nameAr: 'كيما جرافياتو وتكسيات الواجهات (خشن ومتوسط وناعم)',
    shortAr: 'كيما جرافياتو والواجهات',
    subtitleAr:
      'كيما جرافياتو، كيم بليكو (ناعم 700 / متوسط 800 / خشن 900)، داري لايف، سمنتون، كيم ستون، كيما جرانو وكالزيل للواجهات الخارجية',
    pdfUrl: '/assets/catalogs/cmb/CMB_Construction_Paints_Catalog.pdf',
    pdfName: 'CMB_Construction_Paints_Catalog.pdf',
    swatchHex: '#D5BE9A',
  },
  {
    id: 'decorative',
    nameAr: 'الدهانات الديكورية الخاصة (كاشو · فلفت · مارميتون)',
    shortAr: 'الديكورية CMB',
    subtitleAr:
      'تشطيبات CMB الديكورية: كاشو، فلفت المخملي، فلاور، كراكليه، سيناوي، سواحيلي، مارمي تون، وديكوراتيف بلس — ص18–20',
    pdfUrl: '/assets/catalogs/cmb/CMB_Construction_Paints_Catalog.pdf',
    pdfName: 'CMB_Construction_Paints_Catalog.pdf',
    swatchHex: '#C29B4E',
  },
  {
    id: 'epoxy',
    nameAr: 'الإيبوكسي والأرضيات الصناعية (كيمابوكسي 150/151/166W)',
    shortAr: 'كيمابوكسي',
    subtitleAr:
      'درجات وأنظمة كيمابوكسي للأرضيات الصناعية، خزانات مياه الشرب 166W، المسابح، وبرايمر الحديد 131 — كتالوج الإيبوكسي',
    pdfUrl: '/assets/catalogs/cmb/CMB_Epoxy_Catalog.pdf',
    pdfName: 'CMB_Epoxy_Catalog.pdf',
    swatchHex: '#2D85B8',
  },
  {
    id: 'wood',
    nameAr: 'ورنيش وسيلر الأخشاب فيرونا (Verona Wood)',
    shortAr: 'أخشاب فيرونا',
    subtitleAr:
      'بولي يوريثان وبوليستر ونيتروسيلولوز وألكيد فيرونا للأخشاب والأثاث والمراكب — كتالوج الأخشاب الرسمي',
    pdfUrl: '/assets/catalogs/cmb/CMB_Wood_Paints_Catalog.pdf',
    pdfName: 'CMB_Wood_Paints_Catalog.pdf',
    swatchHex: '#B67B3E',
  },
];

export const CMB_PRODUCT_BASES: CmbProductBase[] = [
  {
    id: 'cmb_biokematon_silk',
    sectionId: 'interior_acrylic',
    productId: 'cmb_biokematon_silk',
    nameAr: 'بيو كيماتون سيلك (مضاد للبكتيريا وربع لامع)',
    finish: 'silk',
    finishLabelAr: 'ربع لامع حريري قابل للغسيل',
  },
  {
    id: 'cmb_zenatone_700',
    sectionId: 'interior_acrylic',
    productId: 'cmb_zenatone_700',
    nameAr: 'زيناتون 700 (أكريليك فائق داخلي وخارجي)',
    finish: 'silk',
    finishLabelAr: 'نصف لامع / سيلك واجهات وحوائط',
  },
  {
    id: 'cmb_kemacoat_700',
    sectionId: 'interior_acrylic',
    productId: 'cmb_kemacoat_700',
    nameAr: 'كيماكوت 700 (بلاستيك أكريليك فائق مطفي)',
    finish: 'matt',
    finishLabelAr: 'مطفي فائق التغطية',
  },
  {
    id: 'cmb_kemacoat_400',
    sectionId: 'interior_acrylic',
    productId: 'cmb_kemacoat_400',
    nameAr: 'كيماكوت 400 (بلاستيك مطفي للحوائط الداخلية)',
    finish: 'matt',
    finishLabelAr: 'مطفي داخلي ناعم',
  },
  {
    id: 'cmb_kema_graviato_coarse',
    sectionId: 'graviato',
    productId: 'cmb_kema_graviato',
    nameAr: 'كيما جرافياتو خشن (أخاديد واجهات خارجية)',
    finish: 'matt',
    finishLabelAr: 'خشن جرافياتو خارجي',
  },
  {
    id: 'cmb_kema_graviato_medium',
    sectionId: 'graviato',
    productId: 'cmb_kema_graviato',
    nameAr: 'كيما جرافياتو / كيم بليكو 800 (متوسط)',
    finish: 'matt',
    finishLabelAr: 'ملمس متوسط للواجهات',
  },
  {
    id: 'cmb_kema_graviato_fine',
    sectionId: 'graviato',
    productId: 'cmb_kema_graviato',
    nameAr: 'كيما جرافياتو / كيم بليكو 700 (ناعم)',
    finish: 'matt',
    finishLabelAr: 'ملمس ناعم محبب',
  },
  {
    id: 'cmb_marmix_s40_matt',
    sectionId: 'marmix',
    nameAr: 'مارمكس S40 مط / كيم لوكس 333 (لاكيه مط)',
    finish: 'matt',
    finishLabelAr: 'لاكيه ألكيدي مط',
  },
  {
    id: 'cmb_marmix_s40_gloss',
    sectionId: 'marmix',
    nameAr: 'مارمكس S40 لامع / كيم لوكس 999 (لاكيه لامع)',
    finish: 'semigloss',
    finishLabelAr: 'لاكيه ألكيدي لامع',
  },
  {
    id: 'cmb_alwany_tinter',
    sectionId: 'alwany',
    nameAr: 'ملونات ألواني مع قواعد كيماتون / مارمكس',
    finish: 'silk',
    finishLabelAr: 'مركز تلوين يونيفرسال',
  },
  {
    id: 'cmb_decorative_base',
    sectionId: 'decorative',
    nameAr: 'دهانات CMB الديكورية (كاشو / فلفت / مارميتون)',
    finish: 'silk',
    finishLabelAr: 'تشطيب ديكوري لؤلؤي / مخملي',
  },
  {
    id: 'cmb_kemapoxy_150',
    sectionId: 'epoxy',
    productId: 'cmb_kemapoxy_150',
    nameAr: 'كيمابوكسي 150 / 151 (إيبوكسي أرضيات وحوائط)',
    finish: 'semigloss',
    finishLabelAr: 'إيبوكسي مقاوم للكيماويات',
  },
  {
    id: 'cmb_kemapoxy_166w',
    sectionId: 'epoxy',
    productId: 'cmb_kemapoxy_166w',
    nameAr: 'كيمابوكسي 166W (معتمد لخزانات مياه الشرب)',
    finish: 'semigloss',
    finishLabelAr: 'إيبوكسي غذائي آمن',
  },
  {
    id: 'cmb_verona_wood',
    sectionId: 'wood',
    nameAr: 'ورنيش وسيلر فيرونا للأخشاب (بولي يوريثان / ألكيد)',
    finish: 'semigloss',
    finishLabelAr: 'ورنيش أخشاب شفاف / مظهر طبيعي',
  },
];

/**
 * Official CMB Egypt color palettes & finish systems extracted from cmbegypt.com/cmb/ar/catalogs/
 * (enshaai.pdf Construction Paints Catalog, epoxy-catalog.pdf, wood.pdf, productsCatalogue2025.pdf).
 */
export const CMB_COLORS: CmbColorShade[] = [
  // === 1. MARMIX S40 & KEM LUX Alkyd Enamel (enshaai.pdf page 13) ===
  { code: '347', nameAr: 'بني كراميل دافئ — مارمكس S40', nameEn: 'Caramel Brown 347', hex: '#A95F2B', sectionId: 'marmix', pageNumber: 13 },
  { code: '642', nameAr: 'برتقالي حيوي — مارمكس S40', nameEn: 'Vibrant Orange 642', hex: '#F36F21', sectionId: 'marmix', pageNumber: 13 },
  { code: '022', nameAr: 'أصفر أوكر / خردلي — مارمكس S40', nameEn: 'Ochre Gold 022', hex: '#C69024', sectionId: 'marmix', pageNumber: 13 },
  { code: '033', nameAr: 'أصفر كروم — مارمكس S40', nameEn: 'Chrome Yellow 033', hex: '#DFC822', sectionId: 'marmix', pageNumber: 13 },
  { code: '421', nameAr: 'أحمر صيني زاهي — مارمكس S40', nameEn: 'Signal Red 421', hex: '#DA2128', sectionId: 'marmix', pageNumber: 13 },
  { code: '430', nameAr: 'نبيتي عنابي داكن — مارمكس S40', nameEn: 'Deep Maroon 430', hex: '#6F0000', sectionId: 'marmix', pageNumber: 13 },
  { code: '011', nameAr: 'كريمي عاجي — مارمكس S40', nameEn: 'Ivory Cream 011', hex: '#E9E2D5', sectionId: 'marmix', pageNumber: 13 },
  { code: '630', nameAr: 'بني شوكولاتة — مارمكس S40', nameEn: 'Chocolate Brown 630', hex: '#604314', sectionId: 'marmix', pageNumber: 13 },
  { code: '009', nameAr: 'أسود فحمي — مارمكس S40', nameEn: 'Jet Black 009', hex: '#130C0E', sectionId: 'marmix', pageNumber: 13 },
  { code: '036', nameAr: 'أخضر غابات داكن — مارمكس S40', nameEn: 'Forest Green 036', hex: '#005A2F', sectionId: 'marmix', pageNumber: 13 },
  { code: '447', nameAr: 'بنفسجي ملكي — مارمكس S40', nameEn: 'Royal Violet 447', hex: '#645FAA', sectionId: 'marmix', pageNumber: 13 },
  { code: '466', nameAr: 'أزرق يخت / رويال بلو — مارمكس S40', nameEn: 'Royal Yacht Blue 466', hex: '#023F88', sectionId: 'marmix', pageNumber: 13 },
  { code: 'KEMLUX-W', nameAr: 'كيم لوكس 999 / 333 أبيض ناصع', nameEn: 'Kem Lux White', hex: '#F6F6F3', sectionId: 'marmix', pageNumber: 10 },
  { code: 'KP-ET', nameAr: 'كيم برايم ET — برايمر معادن رمادي', nameEn: 'Kemprime ET Grey', hex: '#8F969C', sectionId: 'marmix', pageNumber: 23 },
  { code: 'KP-RED', nameAr: 'كيم برايم ET — أحمر أكسيد للمعادن', nameEn: 'Kemprime Red Oxide', hex: '#8A3024', sectionId: 'marmix', pageNumber: 23 },
  { code: 'HAMMER-SL', nameAr: 'هامر فينيش فضي ميتاليك مطروق', nameEn: 'Hammer Finish Silver', hex: '#8C9298', sectionId: 'marmix', pageNumber: 23 },

  // === 2. ALWANY Universal Colorants (enshaai.pdf page 14) ===
  { code: 'CMB 06', nameAr: 'ملون ألواني أصفر كناري', nameEn: 'Alwany Canary Yellow', hex: '#FFE81E', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 05', nameAr: 'ملون ألواني أصفر جملي / أوكر', nameEn: 'Alwany Yellow Ochre', hex: '#FCB543', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 10', nameAr: 'ملون ألواني أخضر غامق', nameEn: 'Alwany Dark Green', hex: '#004E21', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 02', nameAr: 'ملون ألواني بني محروق', nameEn: 'Alwany Burnt Umber', hex: '#642C1B', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 09', nameAr: 'ملون ألواني برتقالي مركز', nameEn: 'Alwany Orange', hex: '#F2672C', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 01', nameAr: 'ملون ألواني أحمر زاهي', nameEn: 'Alwany Signal Red', hex: '#D83227', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 07', nameAr: 'ملون ألواني بنفسجي عميق', nameEn: 'Alwany Deep Violet', hex: '#422656', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 12', nameAr: 'ملون ألواني أزرق نيلي', nameEn: 'Alwany Indigo Blue', hex: '#262268', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 03', nameAr: 'ملون ألواني أحمر أكسيد', nameEn: 'Alwany Red Oxide', hex: '#9E201E', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 11', nameAr: 'ملون ألواني أخضر زمردي', nameEn: 'Alwany Emerald Green', hex: '#009D46', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 08', nameAr: 'ملون ألواني أسود مركز', nameEn: 'Alwany Carbon Black', hex: '#231F20', sectionId: 'alwany', pageNumber: 14 },
  { code: 'CMB 04', nameAr: 'ملون ألواني بني أكسيد', nameEn: 'Alwany Brown Oxide', hex: '#6B3F10', sectionId: 'alwany', pageNumber: 14 },

  // === 3. Interior & Exterior Acrylics (Kematone · Bio Kematone · Zenatone 700 · Kemacoat · Rolltone) ===
  { code: 'BIO-W01', nameAr: 'بيو كيماتون سيلك — أبيض صحي ناصع', nameEn: 'Bio Kematone Pure White', hex: '#F7F7F4', sectionId: 'interior_acrylic', pageNumber: 20 },
  { code: 'ZEN-700-W', nameAr: 'زيناتون 700 — أبيض ناصع للواجهات والحوائط', nameEn: 'Zenatone 700 White', hex: '#F4F3EE', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'KC-700-W', nameAr: 'كيماكوت 700 — أبيض مطفي فائق التغطية', nameEn: 'Kemacoat 700 White', hex: '#F5F4F0', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'KT-SILK-W', nameAr: 'كيماتون سيلك — أبيض حريري ناصع', nameEn: 'Kematone Silk White', hex: '#F6F5F1', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'KT-MATT-W', nameAr: 'كيماتون مط — أبيض مطفي ناصع', nameEn: 'Kematone Matt White', hex: '#F3F2EC', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'KC-400-W', nameAr: 'كيماكوت 400 — أبيض داخلي مطفي', nameEn: 'Kemacoat 400 White', hex: '#F2F0EA', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'RT-50-W', nameAr: 'رولتون 50 / 20 — أبيض اقتصادي', nameEn: 'Rolltone 50 White', hex: '#F0EFE9', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'CMB-MIX-01', nameAr: 'تدرج كريمي فانيليا (تلوين ألواني CMB 05)', nameEn: 'Soft Vanilla Tint', hex: '#F3EAD8', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'CMB-MIX-02', nameAr: 'بيج كشمير ناعم (تلوين ألواني CMB 04)', nameEn: 'Soft Cashmere Beige', hex: '#E6DBC8', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'CMB-MIX-03', nameAr: 'جراي مودرن هادئ (تلوين ألواني CMB 08)', nameEn: 'Modern Light Grey', hex: '#DADBD7', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'CMB-MIX-04', nameAr: 'رمادي لؤلؤي دافئ (تلوين ألواني CMB 08+04)', nameEn: 'Warm Greige Tint', hex: '#CFC9BF', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'CMB-MIX-05', nameAr: 'سماوي هادئ (تلوين ألواني CMB 12)', nameEn: 'Serene Sky Blue', hex: '#D8E6EE', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'CMB-MIX-06', nameAr: 'أخضر نعناعي هادئ (تلوين ألواني CMB 11)', nameEn: 'Mint Sage Tint', hex: '#D9E8DE', sectionId: 'interior_acrylic', pageNumber: 18 },
  { code: 'CMB-MIX-07', nameAr: 'روز ناعم (تلوين ألواني CMB 01)', nameEn: 'Blush Rose Tint', hex: '#EFE0DE', sectionId: 'interior_acrylic', pageNumber: 18 },

  // === 4. Kema Graviato & Exterior Textured Finishes (enshaai.pdf pp.15–17 + 2025 Catalog p.19) ===
  { code: 'KEMA-GR-WH', nameAr: 'كيما جرافياتو — أبيض عاجي خشن للواجهات', nameEn: 'Kema Graviato Ivory Coarse', hex: '#F0ECE1', sectionId: 'graviato', pageNumber: 19, textureGrade: 'coarse' },
  { code: 'KEMA-GR-SD', nameAr: 'كيما جرافياتو — رملي صحراوي خشن', nameEn: 'Kema Graviato Desert Sand', hex: '#DFCFAF', sectionId: 'graviato', pageNumber: 19, textureGrade: 'coarse' },
  { code: 'KEMA-GR-BG', nameAr: 'كيما جرافياتو — بيج دافئ خشن', nameEn: 'Kema Graviato Warm Beige', hex: '#D5BE9A', sectionId: 'graviato', pageNumber: 19, textureGrade: 'coarse' },
  { code: 'KEMA-GR-OC', nameAr: 'كيما جرافياتو — أصفر أوكر متوسط', nameEn: 'Kema Graviato Ochre Medium', hex: '#CE9F73', sectionId: 'graviato', pageNumber: 19, textureGrade: 'medium' },
  { code: 'KEMA-GR-TR', nameAr: 'كيما جرافياتو — تراكوتا طوبي خشن', nameEn: 'Kema Graviato Terracotta', hex: '#B86D4B', sectionId: 'graviato', pageNumber: 19, textureGrade: 'coarse' },
  { code: 'KEMA-GR-GR', nameAr: 'كيما جرافياتو — رمادي حجري متوسط', nameEn: 'Kema Graviato Stone Grey', hex: '#B8BCC0', sectionId: 'graviato', pageNumber: 19, textureGrade: 'medium' },
  { code: 'PLIKO-700', nameAr: 'كيم بليكو 700 — بياض واجهات ناعم (Fine)', nameEn: 'Kem Pliko Fine 700', hex: '#F1EFE8', sectionId: 'graviato', pageNumber: 17, textureGrade: 'fine' },
  { code: 'PLIKO-800', nameAr: 'كيم بليكو 800 — بياض واجهات متوسط (Medium)', nameEn: 'Kem Pliko Medium 800', hex: '#EAE4D6', sectionId: 'graviato', pageNumber: 17, textureGrade: 'medium' },
  { code: 'PLIKO-900', nameAr: 'كيم بليكو 900 — بياض واجهات خشن (Coarse)', nameEn: 'Kem Pliko Coarse 900', hex: '#E0D6C3', sectionId: 'graviato', pageNumber: 17, textureGrade: 'coarse' },
  { code: 'DARY-SAND', nameAr: 'داري لايف — تكسية أسمنتية ملونة للواجهات', nameEn: 'Dary Life Sandstone', hex: '#D7BE98', sectionId: 'graviato', pageNumber: 16, textureGrade: 'medium' },
  { code: 'CEM-WHITE', nameAr: 'سمنتون — طلاء أسمنتي أبيض للواجهات', nameEn: 'Cementone White', hex: '#F3F2ED', sectionId: 'graviato', pageNumber: 19, textureGrade: 'fine' },
  { code: 'CEM-GREY', nameAr: 'سمنتون — طلاء أسمنتي رمادي للواجهات', nameEn: 'Cementone Grey', hex: '#9DA3A8', sectionId: 'graviato', pageNumber: 19, textureGrade: 'medium' },
  { code: 'KEM-STONE', nameAr: 'كيم ستون — بياض جرانيت حبيبي متعدد الألوان', nameEn: 'Kem Stone Granite', hex: '#6A655F', sectionId: 'graviato', pageNumber: 15, textureGrade: 'coarse' },
  { code: 'KEM-GRANO', nameAr: 'كيما جرانو — جرانوليت واجهات أحمر طوبي', nameEn: 'Kemagrano Brick Red', hex: '#9C4A33', sectionId: 'graviato', pageNumber: 15, textureGrade: 'coarse' },
  { code: 'KALZIL-W', nameAr: 'كالزيل بيليكو — دهان سيليكاتي مقاوم للحريق', nameEn: 'Kalzil Pleko White', hex: '#F4F3EF', sectionId: 'graviato', pageNumber: 16, textureGrade: 'fine' },

  // === 5. Decorative Special Effects (enshaai.pdf pp.18–20 + 2025 Catalog p.19) ===
  { code: 'CASHO', nameAr: 'كاشو — دهان ديكوري لؤلؤي ذهبي', nameEn: 'Casho Golden Pearl', hex: '#C29B4E', sectionId: 'decorative', pageNumber: 18 },
  { code: 'FLOWER', nameAr: 'فلاور — دهان ديكوري بتأثير الزهور', nameEn: 'Flower Decorative', hex: '#A58376', sectionId: 'decorative', pageNumber: 18 },
  { code: 'VELVET', nameAr: 'فلفت — دهان ديكوري مخملي عميق', nameEn: 'Velvet Deep Crimson', hex: '#88372F', sectionId: 'decorative', pageNumber: 18 },
  { code: 'CRACKLE', nameAr: 'كراكليه — دهان ديكوري بتأثير التشققات', nameEn: 'Crackle Red Gold', hex: '#D8362A', sectionId: 'decorative', pageNumber: 19 },
  { code: 'SINAWY', nameAr: 'سيناوي — مخملي معدني بتأثير الرمال الذهبية', nameEn: 'Sinawy Metallic Velvet', hex: '#B0793C', sectionId: 'decorative', pageNumber: 19 },
  { code: 'SAWAHELLY', nameAr: 'سواحيلي — دهان رمال لؤلؤي ميتاليك', nameEn: 'Sawahelly Pearl Sand', hex: '#543789', sectionId: 'decorative', pageNumber: 19 },
  { code: 'MARMITONE', nameAr: 'مارمي تون — دهان ديكوري بمظهر رخامي', nameEn: 'Marmitone Marble', hex: '#BE8962', sectionId: 'decorative', pageNumber: 20 },
  { code: 'DECO-GOLD', nameAr: 'ديكوراتيف بلس — ميتاليك ذهبي', nameEn: 'Decorative Plus Gold', hex: '#C7A14A', sectionId: 'decorative', pageNumber: 19 },
  { code: 'DECO-SILVER', nameAr: 'ديكوراتيف بلس — ميتاليك فضي', nameEn: 'Decorative Plus Silver', hex: '#B7BDC4', sectionId: 'decorative', pageNumber: 19 },

  // === 6. Industrial Epoxy & Protective Coatings (epoxy-catalog.pdf) ===
  { code: 'KP-150-TR', nameAr: 'كيمابوكسي 150 شفاف لأرضيات الـ 3D والخرسانة', nameEn: 'Kemapoxy 150 Transparent', hex: '#DFECF2', sectionId: 'epoxy', pageNumber: 15 },
  { code: 'KP-151-GRY', nameAr: 'كيمابوكسي 151 / 165G رمادي أرضيات المصانع', nameEn: 'Kemapoxy 151 Industrial Grey', hex: '#8C939A', sectionId: 'epoxy', pageNumber: 14 },
  { code: 'KP-166W-WH', nameAr: 'كيمابوكسي 166W أبيض معتمد لخزانات مياه الشرب', nameEn: 'Kemapoxy 166W Potable White', hex: '#F2F4F2', sectionId: 'epoxy', pageNumber: 21 },
  { code: 'KP-166W-GY', nameAr: 'كيمابوكسي 166W رمادي فاتح للخزانات والمسابح', nameEn: 'Kemapoxy 166W Light Grey', hex: '#B5BCC0', sectionId: 'epoxy', pageNumber: 21 },
  { code: 'KP-151-BLU', nameAr: 'كيمابوكسي 151 / 152 أزرق سماوي للمسابح والأرضيات', nameEn: 'Kemapoxy 151 Pool Blue', hex: '#2D85B8', sectionId: 'epoxy', pageNumber: 14 },
  { code: 'KP-151-AQUA', nameAr: 'كيمابوكسي 152 تركواز لحمامات السباحة', nameEn: 'Kemapoxy 152 Aqua', hex: '#2EA39D', sectionId: 'epoxy', pageNumber: 14 },
  { code: 'KP-151-GRN', nameAr: 'كيمابوكسي 151 أخضر صناعي للمستشفيات والمصانع', nameEn: 'Kemapoxy 151 Hospital Green', hex: '#2E7A56', sectionId: 'epoxy', pageNumber: 14 },
  { code: 'KP-131-OX', nameAr: 'كيمابوكسي 131E بني محمر لخزانات البترول والمعادن', nameEn: 'Kemapoxy 131E Reddish Brown', hex: '#7B3328', sectionId: 'epoxy', pageNumber: 12 },
  { code: 'KP-168-YLW', nameAr: 'كيمابوكسي 168 / دهان طرق أصفر للممرات', nameEn: 'Kemapoxy Yellow Safety', hex: '#E2B73B', sectionId: 'epoxy', pageNumber: 16 },
  { code: 'CONC-151-BK', nameAr: 'كونكريتين 151 FMA أسود مقاوم للأحماض والصرف', nameEn: 'Concretin 151 Black', hex: '#232629', sectionId: 'epoxy', pageNumber: 24 },

  // === 7. Verona Wood Sealers & Varnishes (wood.pdf) ===
  { code: 'VER-CLEAR-GL', nameAr: 'ورنيش فيرونا شفاف لامع (بولي يوريثان / ألكيد)', nameEn: 'Verona Clear Gloss', hex: '#D9A760', sectionId: 'wood', pageNumber: 5 },
  { code: 'VER-CLEAR-MT', nameAr: 'ورنيش فيرونا مطفي / نصف لامع للأخشاب', nameEn: 'Verona Satin Matt', hex: '#C69153', sectionId: 'wood', pageNumber: 6 },
  { code: 'VER-MARINE', nameAr: 'ورنيش فيرونا البحري الشفاف الداكن للمراكب', nameEn: 'Verona Marine Dark Clear', hex: '#8F5A2B', sectionId: 'wood', pageNumber: 13 },
  { code: 'VER-POLY-W', nameAr: 'سيلر بوليستر فيرونا أبيض عالي الملء', nameEn: 'Verona Polyester White', hex: '#F4F1E8', sectionId: 'wood', pageNumber: 3 },
];
