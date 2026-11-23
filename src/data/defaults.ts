import productSealerImg from '../assets/images/product_glc_sealer_1794817424003.jpg';
import productDrillImg from '../assets/images/product_ingco_drill_1794817424731.jpg';
import productJotunImg from '../assets/images/product_jotun_fenomastic_1794818520635.jpg';
import productGrinderImg from '../assets/images/product_angle_grinder_1794818520973.jpg';
import productRollerKitImg from '../assets/images/product_paint_roller_kit_1794818521444.jpg';
import productLockImg from '../assets/images/product_ahram_mortise_lock_1794818522987.jpg';
import productWaterproofImg from '../assets/images/product_cmb_waterproof_1794818522808.jpg';
import { MULTI_BRAND_CATEGORIES, MULTI_BRAND_SUBPAGES } from './brandCatalogs';
import { GLC_SUBPAGES } from './glcCatalog';
import {
  Banner,
  Category,
  ColorCatalog,
  Product,
  StoreConfig,
  Subpage,
} from '../types/store';

export const DEMO_BANNER_IDS = ['ban_hero_main', 'ban_tools_pro', 'ban_putty_offer'];
export const DEMO_PRODUCT_IDS = [
  'prod_glc_daytone100',
  'prod_glc_sealer007',
  'prod_jotun_fenomastic',
  'prod_ingco_drill20v',
  'prod_ingco_grinder900',
  'prod_painter_kit_pro',
  'prod_ahram_lockset',
  'prod_cmb_waterproof',
  'prod_pachin_sipes_satin',
];
export const DEMO_CATALOG_IDS = ['catlg_facades_2026'];

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: 'الموان للحدايد والبويات ولوازم المعمار',
  headerBrandName: 'الموان للحدايد والبويات ولوازم المعمار',
  subtitle: 'مركز متكامل للعدد الأصلية، الدهانات، مستلزمات البناء',
  announcementBar: '',
  phonePrimary: '01008377405',
  phoneSecondary: '01029190615',
  whatsappNumber: '201029190615',
  workingHours: 'يومياً من 8:00 صباحاً حتى 11:00 مساءً',
  address: 'الهضبة الوسطى المقطم شارع الحي الثاني امام اسماك المحروسه',
  shippingFee: 50,
  freeShippingMin: 1000,
  facebookUrl: 'https://facebook.com',
  mapsUrl: 'https://maps.google.com',
  sectionsTitleCategories: 'تصفح أقسام المحل الرئيسية',
  sectionsSubtitleCategories: 'عدد أصلية، دهانات كمبيوتر، كوالين وأدوات معمار',
  sectionsTitleProducts: 'تشكيلة المنتجات الاحترافية ولوازم المعمار',
  sectionsTitleBrands: 'علاماتنا التجارية وشركاء النجاح',
  sectionsSubtitleBrands: 'وكلاء وموزعون معتمدون لأفضل العلامات العالمية والمحلية',
  contactBadge: 'خدمة العملاء واستشارات المعمار',
  contactTitle: 'تواصل مع الموان للحدايد والبويات ولوازم المعمار',
  contactDescription:
    'هل تبحث عن معدة معينة، تسعير جملة لمشروع مقاولات، أو كود لون بالكمبيوتر؟ أرسل استفسارك وسيصل مباشرة لإدارة المتجر أو تواصل فوراً عبر واتساب.',
  footerBio:
    'نوفر لعملائنا نخب أول من العدد اليدوية والكهربائية ومستلزمات الهواء والدهانات الأصلية مع خلط ألوان دقيق بالكمبيوتر.',
  visibility: {
    hero: true,
    features: true,
    quickFilters: true,
    categories: true,
    brands: true,
    contact: true,
    colorStudio: true,
  },
  features: [
    {
      id: 'feat_payment',
      title: 'ادفع بالطريقة اللي تناسبك',
      description: 'كاش عند الاستلام، إنستاباي، أو فودافون كاش بكل مرونة',
      icon: 'credit-card',
      color: 'blue',
    },
    {
      id: 'feat_shipping',
      title: 'توصيل لكل مصر',
      description: 'شحن سريع وآمن حتى باب موقعك أو ورشتك بأفضل تكلفة',
      icon: 'truck',
      color: 'amber',
    },
    {
      id: 'feat_consult',
      title: 'استشارة فنية مجانية',
      description: 'خبراء لاختيار نوع البويات والعدد ولوازم التشطيب المناسبة',
      icon: 'headphones',
      color: 'emerald',
    },
    {
      id: 'feat_original',
      title: 'منتجات أصلية 100%',
      description: 'ضمان الوكلاء المعتمدين وأعلى جودة في خامات البناء والعدد',
      icon: 'shield',
      color: 'slate',
    },
  ],
  brands: [
    { id: 'br_jotun', code: 'JOTUN', nameAr: 'دهانات جوتن', color: 'navy', logoUrl: '' },
    { id: 'br_sipes', code: 'SIPES', nameAr: 'بويات سايبس', color: 'red', logoUrl: '' },
    { id: 'br_glc', code: 'GLC', nameAr: 'جي إل سي للدهانات', color: 'red', logoUrl: '' },
    { id: 'br_cmb', code: 'CMB', nameAr: 'كيماويات البناء الحديث CMB', color: 'blue', logoUrl: '' },
    { id: 'br_mido', code: 'MIDO', nameAr: 'ميدو للدهانات', color: 'navy', logoUrl: '' },
    { id: 'br_ingco', code: 'INGCO', nameAr: 'إنجكو للعدد والمعدات', color: 'amber', logoUrl: '' },
    { id: 'br_gyproc', code: 'GYPROC', nameAr: 'جيبروك سان جوبان', color: 'blue', logoUrl: '' },
    { id: 'br_ahram', code: 'AHRAM', nameAr: 'الأهرام للأقفال والكوالين', color: 'amber', logoUrl: '' },
    { id: 'br_apt', code: 'APT', nameAr: 'إيه بي تي للعدد', color: 'red', logoUrl: '' },
    { id: 'br_mohandes', code: 'EL-MOHANDES', nameAr: 'المهندس للكيماويات', color: 'blue', logoUrl: '' },
    { id: 'br_ilock', code: 'iLOCK', nameAr: 'آي لوك لأدوات الكهرباء', color: 'amber', logoUrl: '' },
    { id: 'br_saveto', code: 'SAVETO', nameAr: 'سافيتو', color: 'slate', logoUrl: '' },
    { id: 'br_scib', code: 'SCIB', nameAr: 'دهانات سكيب', color: 'blue', logoUrl: '' },
    { id: 'br_swedish', code: 'SWEDISH CO.', nameAr: 'الشركة السويدية', color: 'red', logoUrl: '' },
  ],
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_glc',
    name: 'منتجات GLC',
    description: 'معجون، سيلر، دهانات بلاستيك ولاكية عالية الجودة',
    imageUrl: productSealerImg,
    sortOrder: 1,
  },
  ...MULTI_BRAND_CATEGORIES,
  {
    id: 'cat_paints',
    name: 'دهانات وكمبيوتر الألوان',
    description: 'جوتن، سايبس، سكيب وميدو بتلوين كمبيوتر فوري',
    imageUrl: productJotunImg,
    sortOrder: 7,
  },
  {
    id: 'cat_tools',
    name: 'العدد اليدوية والكهربائية',
    description: 'شنيور، صاروخ، مفاتيح، ورولات دهان أصلية للورش',
    imageUrl: productDrillImg,
    sortOrder: 8,
  },
  {
    id: 'cat_locks',
    name: 'الأقفال والكوالين ولوازم النجارة',
    description: 'كوالين أمان، سلندرات نحاس ومقابض استانلس أصلية',
    imageUrl: productLockImg,
    sortOrder: 9,
  },
  {
    id: 'cat_construction',
    name: 'كيماويات البناء والمعمار',
    description: 'عزل أسمنتي، سافيتو، كيماويات CMB وأدوات التشطيب',
    imageUrl: productWaterproofImg,
    sortOrder: 10,
  },
];

export const DEFAULT_SUBPAGES: Subpage[] = [
  ...GLC_SUBPAGES,
  ...MULTI_BRAND_SUBPAGES,
  {
    id: 'sub_paints_interior',
    categoryId: 'cat_paints',
    name: 'دهانات داخلية فاخرة',
    description: 'درجات جوتن فينوماستيك وسكيب وسايبس المطفي ونصف اللامع',
    imageUrl: productJotunImg,
  },
  {
    id: 'sub_tools_power',
    categoryId: 'cat_tools',
    name: 'عدد كهربائية وشنيورات',
    description: 'شنيورات دقاق وصواريخ قطع بضمان الوكيل المعتمد',
    imageUrl: productGrinderImg,
  },
  {
    id: 'sub_tools_painting',
    categoryId: 'cat_tools',
    name: 'أطقم الرولات والفرش',
    description: 'رولات مايكروفايبر وفرش تشطيب احترافية للنقاشين',
    imageUrl: productRollerKitImg,
  },
  {
    id: 'sub_construction_waterproof',
    categoryId: 'cat_construction',
    name: 'مواد العزل ولصق السيراميك',
    description: 'كيماويات البناء الحديث CMB وسافيتو والمهندس',
    imageUrl: productWaterproofImg,
  },
];

export const DEFAULT_BANNERS: Banner[] = [];

export const DEFAULT_PRODUCTS: Product[] = [];

export const DEFAULT_CATALOGS: ColorCatalog[] = [
  {
    id: 'catlg_glc_platine',
    title: 'كتالوج GLC سوبر بلاتين — 132 لون بالكمبيوتر',
    brand: 'GLC',
    fileType: 'pdf',
    fileUrl: '/assets/aistudio/GLC_Platine_Color_Card_b12cf5c6.pdf',
    attachments: [
      {
        id: 'att_glc_platine_pdf',
        type: 'pdf',
        url: '/assets/aistudio/GLC_Platine_Color_Card_b12cf5c6.pdf',
        name: 'GLC Platine Color Card (132 Colors).pdf',
      },
    ],
    notes:
      'كارتيلا ألوان سوبر بلاتين الرسمية من GLC (132 درجة لونية معتمدة بالكمبيوتر لدهانات لاكشري مط 7000، داي ستون 7070، جلتكس 15000 و20000 و25000).',
  },
  {
    id: 'catlg_cmb_catalogs',
    title: 'كتالوجات ألوان ومنتجات CMB الرسمية (إنشائي · إيبوكسي · أخشاب)',
    brand: 'CMB',
    fileType: 'pdf',
    fileUrl: '/assets/catalogs/cmb/CMB_Construction_Paints_Catalog.pdf',
    attachments: [
      {
        id: 'att_cmb_construction_pdf',
        type: 'pdf',
        url: '/assets/catalogs/cmb/CMB_Construction_Paints_Catalog.pdf',
        name: 'CMB Construction Paints Catalog (Marmix · Alwany · Graviato · Deco).pdf',
      },
      {
        id: 'att_cmb_epoxy_pdf',
        type: 'pdf',
        url: '/assets/catalogs/cmb/CMB_Epoxy_Catalog.pdf',
        name: 'CMB Kemapoxy Industrial & Tanks Catalog.pdf',
      },
      {
        id: 'att_cmb_wood_pdf',
        type: 'pdf',
        url: '/assets/catalogs/cmb/CMB_Wood_Paints_Catalog.pdf',
        name: 'CMB Verona Wood Paints & Varnishes Catalog.pdf',
      },
    ],
    notes:
      'الكتالوجات الرسمية لشركة كيماويات البناء الحديث (CMB): درجات مارمكس S40، ملونات ألواني (CMB 01–12)، كيما جرافياتو وكيم بليكو، كاشو وفلفت ومارميتون، وأنظمة كيمابوكسي وأخشاب فيرونا.',
  },
  {
    id: 'catlg_graffiato_laser_6',
    title: 'كتالوج جرافيـاتو ليزر (6 صور · كود 1002 – 1220)',
    brand: 'جرافيـاتو ليزر',
    fileType: 'image',
    fileUrl: '/assets/aistudio/IMG-20261123-WA0000_005ab66e.jpg',
    attachments: [
      {
        id: 'att_glaser_1',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0000_005ab66e.jpg',
        name: 'لوحة 1 ليزر: 1002 – 1030',
      },
      {
        id: 'att_glaser_2',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0004_ad851d76.jpg',
        name: 'لوحة 2 ليزر: 1032 – 1060',
      },
      {
        id: 'att_glaser_3',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0006_dec831a2.jpg',
        name: 'لوحة 3 ليزر: 1062 – 1100',
      },
      {
        id: 'att_glaser_4',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0002_9b1c2be6.jpg',
        name: 'لوحة 4 ليزر: 1102 – 1140',
      },
      {
        id: 'att_glaser_5',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0003_abc9f93d.jpg',
        name: 'لوحة 5 ليزر: 1142 – 1180',
      },
      {
        id: 'att_glaser_6',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0005_d5bdc02e.jpg',
        name: 'لوحة 6 ليزر: 1182 – 1220',
      },
    ],
    notes:
      'الـ 6 لوحات الأصلية لكتالوج جرافيـاتو كيماستون بالليزر (110 كود: 1002 إلى 1220) شاملة شرائح الليزر اللامعة.',
  },
  {
    id: 'catlg_graffiato_classic_6',
    title: 'كتالوج جرافيـاتو وزخرفي بدون ليزر (6 صور · 90 كود)',
    brand: 'جرافيـاتو بدون ليزر',
    fileType: 'image',
    fileUrl: '/assets/aistudio/IMG-20261123-WA0012_c3329536.jpg',
    attachments: [
      {
        id: 'att_gclassic_1',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0012_c3329536.jpg',
        name: 'لوحة 1: جوتاشيلد 6050 – 6078',
      },
      {
        id: 'att_gclassic_2',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0011_f5285068.jpg',
        name: 'لوحة 2: جوتاشيلد 6080 – 6108',
      },
      {
        id: 'att_gclassic_3',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0009_0477aa1d.jpg',
        name: 'لوحة 3: مارفكس R50 – R64',
      },
      {
        id: 'att_gclassic_4',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0007_3bfadf15.jpg',
        name: 'لوحة 4: جيماتكس X11 – X25',
      },
      {
        id: 'att_gclassic_5',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0008_04ce3587.jpg',
        name: 'لوحة 5: ماربل 5001 – 5029',
      },
      {
        id: 'att_gclassic_6',
        type: 'image',
        url: '/assets/aistudio/IMG-20261123-WA0010_8dbae9d4.jpg',
        name: 'لوحة 6: ماربل 5031 – 5059',
      },
    ],
    notes:
      'الـ 6 لوحات الأصلية بدون ليزر: جوتاشيلد للواجهات (6050–6108)، مارفكس (R50–R64)، جيماتكس (X11–X25)، وماربل (5001–5059).',
  },
];

export const CURATED_PAINT_SHADES = [
  { code: 'JOTUN 7627', name: 'Refresh — ريفرش', hex: '#CACFC3', brand: 'JOTUN' },
  { code: 'JOTUN 1001', name: 'Egg White — إغّ وايت', hex: '#EFEDE3', brand: 'JOTUN' },
  { code: 'JOTUN 1622', name: 'Reflection — رفلكشن', hex: '#EBE9E2', brand: 'JOTUN' },
  { code: 'JOTUN 1024', name: 'Timeless — تايملس', hex: '#E0DDD3', brand: 'JOTUN' },
  { code: 'JOTUN 10679', name: 'Washed Linen — واشد لينن', hex: '#C9C3B6', brand: 'JOTUN' },
  { code: 'JOTUN 9918', name: 'Classic White — كلاسيك وايت', hex: '#F0EFEA', brand: 'JOTUN' },
  { code: 'GLC Y21010', name: 'بيج عسلي بلاتين', hex: '#E9D8B7', brand: 'GLC' },
  { code: 'GLC N03000', name: 'أوف وايت محايد بلاتين', hex: '#F7F4F0', brand: 'GLC' },
  { code: 'SCIB 9436', name: 'Air Breeze — إير بريز سكيب', hex: '#F3EDE8', brand: 'SCIB' },
  { code: 'SCIB 7300', name: 'Jet Stream — جت ستريم سكيب', hex: '#E2E8E5', brand: 'SCIB' },
  { code: 'CMB 347', name: 'بني كراميل — مارمكس S40', hex: '#A95F2B', brand: 'CMB' },
  { code: 'CMB 466', name: 'رويال بلو — مارمكس S40', hex: '#023F88', brand: 'CMB' },
  { code: 'SIPES S089', name: 'سايبس بلاستيك S089', hex: '#FEEFCB', brand: 'SIPES' },
  { code: 'SIPES 952', name: 'Turquoise — تركواز سايبس', hex: '#B3D5C3', brand: 'SIPES' },
  { code: 'SAV-C03 Sandstone', name: 'حجر رملي خشن سافيتو', hex: '#DFCFAF', brand: 'SAVETO' },
];
