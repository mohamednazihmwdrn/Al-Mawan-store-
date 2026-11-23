import { GraffiatoTextureGrade } from './sipesColors';

export type SavetoColorFamilyId =
  | 'all'
  | 'whites'
  | 'creams'
  | 'sand_terracotta'
  | 'greys'
  | 'olive_earth';

export interface SavetoColorSwatch {
  code: string;
  nameAr: string;
  nameEn: string;
  hex: string;
  familyId: Exclude<SavetoColorFamilyId, 'all'>;
  textureGrade: GraffiatoTextureGrade;
  productLine: 'سافياتو خشن 3مم' | 'فيتوتاتش تيكستورا 2مم' | 'سموث رندر ناعم 1مم';
}

export interface SavetoColorFamily {
  id: SavetoColorFamilyId;
  nameAr: string;
  sampleHex: string;
}

export interface SavetoTextureGradeFilter {
  id: 'all' | GraffiatoTextureGrade;
  nameAr: string;
  detailAr: string;
}

export const SAVETO_GRAFFIATO_GRADES: SavetoTextureGradeFilter[] = [
  { id: 'all', nameAr: 'جميع درجات الخشونة', detailAr: 'خشن · متوسط · ناعم' },
  {
    id: 'coarse',
    nameAr: 'خشن (3–4 مم · سافياتو)',
    detailAr: 'بروز عميق وأخاديد طولية/دائرية كلاسيكية للواجهات الكبيرة والأسوار',
  },
  {
    id: 'medium',
    nameAr: 'متوسط (2 مم · تيكستورا)',
    detailAr: 'حبيبات متوسطة متوازنة بين البروز المعماري وسهولة الغسيل',
  },
  {
    id: 'fine',
    nameAr: 'ناعم (1–1.5 مم · سموث رندر)',
    detailAr: 'تشطيب رمل ناعم أو ممشط عصري للفلل والواجهات المودرن',
  },
];

export const SAVETO_COLOR_FAMILIES: SavetoColorFamily[] = [
  { id: 'all', nameAr: 'كل الدرجات', sampleHex: '#E5DEC9' },
  { id: 'whites', nameAr: 'أبيض وأوف وايت معدني', sampleHex: '#F2EFE9' },
  { id: 'creams', nameAr: 'كريمي وبيج دافئ', sampleHex: '#E6D6BC' },
  { id: 'sand_terracotta', nameAr: 'رملي وتيراكوتا وأصفر', sampleHex: '#CE9F73' },
  { id: 'greys', nameAr: 'رمادي وأسمنتي مودرن', sampleHex: '#9A9D9C' },
  { id: 'olive_earth', nameAr: 'زيتوني وترابي وأخضر حجري', sampleHex: '#8E937B' },
];

export const SAVETO_PRODUCT_BASES = [
  {
    id: 'saveto_saviatto_coarse',
    productId: 'saveto_saviatto_coarse',
    nameAr: 'سافيتو سافياتو جرافيـاتو خشن للواجهات (Saviatto 3mm)',
    finish: 'matt' as const,
    finishLabelAr: 'خشن أخاديد 3مم',
  },
  {
    id: 'saveto_vetotouch_textura',
    productId: 'saveto_vetotouch_textura',
    nameAr: 'سافيتو فيتوتاتش تيكستورا متوسط الخشونة (Textura 2mm)',
    finish: 'matt' as const,
    finishLabelAr: 'متوسط 2مم',
  },
  {
    id: 'saveto_vetotouch_graviatto',
    productId: 'saveto_vetotouch_graviatto',
    nameAr: 'سافيتو فيتوتاتش جرافيـاتو جاهز بالكمبيوتر (Graviatto AC)',
    finish: 'matt' as const,
    finishLabelAr: 'أكريليك جاهز 1.5-3مم',
  },
  {
    id: 'saveto_smooth_render',
    productId: 'saveto_smooth_render',
    nameAr: 'سافيتو سموث رندر ناعم ملون (Smooth Render 1mm)',
    finish: 'matt' as const,
    finishLabelAr: 'ناعم حبة دقيقة 1مم',
  },
];

export const SAVETO_COLORS: SavetoColorSwatch[] = [
  // خشن 3-4 مم (سافياتو Saviatto Coarse)
  {
    code: 'SAV-C01 White',
    nameAr: 'أبيض سافياتو نقي',
    nameEn: 'Pure Saviatto White',
    hex: '#F3F1EC',
    familyId: 'whites',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C02 Alabaster',
    nameAr: 'أوف وايت رخامي خشن',
    nameEn: 'Alabaster Coarse',
    hex: '#ECE6DA',
    familyId: 'whites',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C03 Sandstone',
    nameAr: 'حجر رملي خشن',
    nameEn: 'Coarse Sandstone',
    hex: '#DFCFAF',
    familyId: 'creams',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C04 Classic Cream',
    nameAr: 'كريمي واجهات كلاسيك خشن',
    nameEn: 'Classic Facade Cream',
    hex: '#EBDAC1',
    familyId: 'creams',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C05 Limestone',
    nameAr: 'جيري حجر جير خشن',
    nameEn: 'Warm Limestone',
    hex: '#D4C3A3',
    familyId: 'creams',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C06 Desert Gold',
    nameAr: 'ذهبي صحراوي خشن',
    nameEn: 'Desert Gold',
    hex: '#D5AE78',
    familyId: 'sand_terracotta',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C07 Terracotta',
    nameAr: 'تيراكوتا طوب محروق خشن',
    nameEn: 'Deep Terracotta',
    hex: '#B4694C',
    familyId: 'sand_terracotta',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C08 Sienna Earth',
    nameAr: 'سيينا ترابي دافئ خشن',
    nameEn: 'Sienna Earth',
    hex: '#C48A62',
    familyId: 'sand_terracotta',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C09 Rose Clay',
    nameAr: 'وردي فخاري خشن',
    nameEn: 'Rose Clay',
    hex: '#D2A18D',
    familyId: 'sand_terracotta',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C10 Concrete Grey',
    nameAr: 'رمادي أسمنتي خشن',
    nameEn: 'Concrete Grey',
    hex: '#A5A8A7',
    familyId: 'greys',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C11 Basalt Dark',
    nameAr: 'رمادي بازلتي داكن خشن',
    nameEn: 'Dark Basalt',
    hex: '#676B6D',
    familyId: 'greys',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },
  {
    code: 'SAV-C12 Olive Stone',
    nameAr: 'زيتوني حجري خشن',
    nameEn: 'Olive Stone',
    hex: '#898F76',
    familyId: 'olive_earth',
    textureGrade: 'coarse',
    productLine: 'سافياتو خشن 3مم',
  },

  // متوسط 2 مم (فيتوتاتش تيكستورا / جرافيـاتو متوسط)
  {
    code: 'SAV-M01 Chalk White',
    nameAr: 'أبيض طباشيري متوسط',
    nameEn: 'Chalk White Medium',
    hex: '#F0EDE7',
    familyId: 'whites',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M02 Warm Chalk',
    nameAr: 'أوف وايت دافئ متوسط',
    nameEn: 'Warm Chalk',
    hex: '#E9E0D2',
    familyId: 'whites',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M03 Biscuit Beige',
    nameAr: 'بيج بسكويت متوسط',
    nameEn: 'Biscuit Beige',
    hex: '#DEC9AA',
    familyId: 'creams',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M04 Ivory Dune',
    nameAr: 'عاجي كثبان متوسط',
    nameEn: 'Ivory Dune',
    hex: '#E6D8BF',
    familyId: 'creams',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M05 Almond Stone',
    nameAr: 'لوزي حجري متوسط',
    nameEn: 'Almond Stone',
    hex: '#CFBFA5',
    familyId: 'creams',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M06 Sahara Ochre',
    nameAr: 'مغرة صحراوية متوسط',
    nameEn: 'Sahara Ochre',
    hex: '#CEA06B',
    familyId: 'sand_terracotta',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M07 Roasted Umber',
    nameAr: 'بني آمبر محمص متوسط',
    nameEn: 'Roasted Umber',
    hex: '#8C6E56',
    familyId: 'sand_terracotta',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M08 Peach Sand',
    nameAr: 'رملي خوخي متوسط',
    nameEn: 'Peach Sand',
    hex: '#DFB195',
    familyId: 'sand_terracotta',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M09 Silver Frost',
    nameAr: 'رمادي فضي متوسط',
    nameEn: 'Silver Frost',
    hex: '#BFC2C2',
    familyId: 'greys',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M10 Slate Smoke',
    nameAr: 'رمادي أردوازي متوسط',
    nameEn: 'Slate Smoke',
    hex: '#818688',
    familyId: 'greys',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M11 Sage Clay',
    nameAr: 'أخضر مريمية متوسط',
    nameEn: 'Sage Clay',
    hex: '#A7AE9A',
    familyId: 'olive_earth',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },
  {
    code: 'SAV-M12 Khaki Drift',
    nameAr: 'كاكي ترابي متوسط',
    nameEn: 'Khaki Drift',
    hex: '#9D967E',
    familyId: 'olive_earth',
    textureGrade: 'medium',
    productLine: 'فيتوتاتش تيكستورا 2مم',
  },

  // ناعم 1–1.5 مم (سموث رندر / جرافيـاتو ناعم)
  {
    code: 'SAV-F01 Pearl White',
    nameAr: 'أبيض لؤلؤي ناعم',
    nameEn: 'Pearl White Fine',
    hex: '#F6F5F0',
    familyId: 'whites',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F02 Soft Cotton',
    nameAr: 'أوف وايت قطني ناعم',
    nameEn: 'Soft Cotton Fine',
    hex: '#EFECE3',
    familyId: 'whites',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F03 Vanilla Silk',
    nameAr: 'فانيليا ناعم للواجهات',
    nameEn: 'Vanilla Silk Fine',
    hex: '#EDE1CA',
    familyId: 'creams',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F04 Champagne Linen',
    nameAr: 'بيج كتان شامبانيا ناعم',
    nameEn: 'Champagne Linen',
    hex: '#E3D4BC',
    familyId: 'creams',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F05 Taupe Sand',
    nameAr: 'توب رملي مودرن ناعم',
    nameEn: 'Taupe Sand Fine',
    hex: '#BBAE9C',
    familyId: 'creams',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F06 Apricot Glow',
    nameAr: 'مشمشي هادئ ناعم',
    nameEn: 'Apricot Glow',
    hex: '#E4B899',
    familyId: 'sand_terracotta',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F07 Amber Sunset',
    nameAr: 'كهرماني دافئ ناعم',
    nameEn: 'Amber Sunset',
    hex: '#D4986B',
    familyId: 'sand_terracotta',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F08 Mocha Mist',
    nameAr: 'موكا ضبابي ناعم',
    nameEn: 'Mocha Mist',
    hex: '#9D8978',
    familyId: 'sand_terracotta',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F09 Mist Grey',
    nameAr: 'رمادي ضبابي فاتح ناعم',
    nameEn: 'Mist Grey Fine',
    hex: '#CED1D0',
    familyId: 'greys',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F10 Titanium Grey',
    nameAr: 'رمادي تيتانيوم مودرن ناعم',
    nameEn: 'Titanium Grey',
    hex: '#939799',
    familyId: 'greys',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F11 Charcoal Ash',
    nameAr: 'رمادي فحمي واجهات ناعم',
    nameEn: 'Charcoal Ash',
    hex: '#575B5E',
    familyId: 'greys',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
  {
    code: 'SAV-F12 Moss Green',
    nameAr: 'أخضر طحلبي ناعم',
    nameEn: 'Moss Green Fine',
    hex: '#8B947E',
    familyId: 'olive_earth',
    textureGrade: 'fine',
    productLine: 'سموث رندر ناعم 1مم',
  },
];
