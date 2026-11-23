import { Category, Product, Subpage } from '../types/store';
import { CMB_PRODUCTS, CMB_SUBPAGES } from './cmbCatalog';
import { JOTUN_PRODUCTS, JOTUN_SUBPAGES } from './jotunCatalog';
import { SAVETO_PRODUCTS, SAVETO_SUBPAGES } from './savetoCatalog';
import { SCIB_PRODUCTS, SCIB_SUBPAGES } from './scibCatalog';
import { SIPES_PRODUCTS, SIPES_SUBPAGES } from './sipesCatalog';

export const MULTI_BRAND_CATEGORIES: Category[] = [
  {
    id: 'cat_jotun',
    name: 'منتجات وكيماويات جوتن (JOTUN)',
    description:
      'فينوماستيك الأبيض والملون، معجون ستوكو، سيلر إيسنس، ليدي ديزاين، وجوتاشيلد للواجهات بالكمبيوتر',
    imageUrl: '/assets/products/jotun/fenomastic_wonderwall_lux.png',
    sortOrder: 2,
  },
  {
    id: 'cat_sipes',
    name: 'منتجات سايبس (SIPES)',
    description:
      'سايتون، ديورا كريل، سايبس بوند، سي ستون، سي تكس جرافيـاتو، واللاكيهات وورنيش الأخشاب',
    imageUrl: '/assets/products/sipes/sipes_bond_5000.jpg',
    sortOrder: 3,
  },
  {
    id: 'cat_cmb',
    name: 'منتجات كيماويات البناء الحديث (CMB)',
    description:
      'أديبوند 65 (1 لتر و5 لتر و20 لتر) و69، نانو سيلر، كيمابوكسي 150 و166W، كيماكوت وكيما فيل والعوازل',
    imageUrl: '/assets/products/cmb/cmb_addibond_65.jpg',
    sortOrder: 4,
  },
  {
    id: 'cat_scib',
    name: 'منتجات دهانات سكيب (SCIB)',
    description:
      'رويال هيلث شيلد، نوفي سيلك، أكريكوت، ويذر كوت للواجهات، دامبلوك 2K وسمارت كير للعزل وتاتش وود',
    imageUrl: '/assets/products/scib/scib_royale_health_shield.png',
    sortOrder: 5,
  },
  {
    id: 'cat_saveto',
    name: 'منتجات سافيتو (SAVETO)',
    description:
      'سافياتو خشن 3مم، فيتوتاتش تيكستورا متوسط 2مم، سموث رندر ناعم 1مم، ولواصق السيراميك والبورسلين والعزل',
    imageUrl: '/assets/products/saveto/saviatto_coarse.png',
    sortOrder: 6,
  },
];

export const MULTI_BRAND_SUBPAGES: Subpage[] = [
  ...JOTUN_SUBPAGES,
  ...SIPES_SUBPAGES,
  ...CMB_SUBPAGES,
  ...SCIB_SUBPAGES,
  ...SAVETO_SUBPAGES,
];

export const MULTI_BRAND_PRODUCTS: Product[] = [
  ...JOTUN_PRODUCTS,
  ...SIPES_PRODUCTS,
  ...CMB_PRODUCTS,
  ...SCIB_PRODUCTS,
  ...SAVETO_PRODUCTS,
];

export const MULTI_BRAND_PRODUCT_IDS: string[] = MULTI_BRAND_PRODUCTS.map((p) => p.id);

export const MULTI_BRAND_V2_NEW_PRODUCT_IDS: string[] = [
  'jotun_fenomastic_pure_white_pail',
  'jotun_fenomastic_hygiene_silk_pail',
  'jotun_stucco_putty',
  'jotun_jotashield_filler',
  'jotun_essence_easy_primer',
  'jotun_pva_sealer_pail',
  'cmb_addibond_65_5l',
  'cmb_addibond_65_20l',
  'cmb_kemacoat_100',
  'cmb_kemagrout_waterproof',
];

const V2_ID_SET = new Set(MULTI_BRAND_V2_NEW_PRODUCT_IDS);
export const MULTI_BRAND_V2_PRODUCTS: Product[] = MULTI_BRAND_PRODUCTS.filter((p) =>
  V2_ID_SET.has(p.id)
);
