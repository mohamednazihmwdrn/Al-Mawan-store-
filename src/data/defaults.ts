import productSealerImg from '../assets/images/product_glc_sealer_1794817424003.jpg';
import productDrillImg from '../assets/images/product_ingco_drill_1794817424731.jpg';
import productJotunImg from '../assets/images/product_jotun_fenomastic_1794818520635.jpg';
import productGrinderImg from '../assets/images/product_angle_grinder_1794818520973.jpg';
import productRollerKitImg from '../assets/images/product_paint_roller_kit_1794818521444.jpg';
import productLockImg from '../assets/images/product_ahram_mortise_lock_1794818522987.jpg';
import productWaterproofImg from '../assets/images/product_cmb_waterproof_1794818522808.jpg';
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
    { id: 'br_pachin', code: 'PACHIN', nameAr: 'باكين للدهانات', color: 'blue', logoUrl: '' },
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
  {
    id: 'cat_paints',
    name: 'دهانات وكمبيوتر الألوان',
    description: 'جوتن، باكين، سايبس وميدو بتلوين كمبيوتر فوري',
    imageUrl: productJotunImg,
    sortOrder: 2,
  },
  {
    id: 'cat_tools',
    name: 'العدد اليدوية والكهربائية',
    description: 'شنيور، صاروخ، مفاتيح، ورولات دهان أصلية للورش',
    imageUrl: productDrillImg,
    sortOrder: 3,
  },
  {
    id: 'cat_locks',
    name: 'الأقفال والكوالين ولوازم النجارة',
    description: 'كوالين أمان، سلندرات نحاس ومقابض استانلس أصلية',
    imageUrl: productLockImg,
    sortOrder: 4,
  },
  {
    id: 'cat_construction',
    name: 'كيماويات البناء والمعمار',
    description: 'عزل أسمنتي، سافيتو، كيماويات CMB وأدوات التشطيب',
    imageUrl: productWaterproofImg,
    sortOrder: 5,
  },
];

export const DEFAULT_SUBPAGES: Subpage[] = [
  ...GLC_SUBPAGES,
  {
    id: 'sub_paints_interior',
    categoryId: 'cat_paints',
    name: 'دهانات داخلية فاخرة',
    description: 'درجات جوتن فينوماستيك وباكين المطفي ونصف اللامع',
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
  { code: 'JOTUN 12078', name: 'Comfort Grey — كمفرت غراي', hex: '#BEB9AF', brand: 'JOTUN' },
  { code: 'JOTUN 4477', name: 'Deco Blue — دكو بلو', hex: '#525C64', brand: 'JOTUN' },
  { code: 'SIPES S089', name: 'سايبس بلاستيك S089', hex: '#FEEFCB', brand: 'SIPES' },
  { code: 'SIPES 952', name: 'Turquoise — تركواز سايبس', hex: '#B3D5C3', brand: 'SIPES' },
];
