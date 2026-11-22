export interface GlcColorFamily {
  id: string;
  nameAr: string;
  pageNumber: number;
}

export interface GlcColorShade {
  code: string;
  hex: string;
  familyId: string;
  pageNumber: number;
}

export interface GlcPlatineProductBase {
  id: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  finish: 'matt' | 'silk' | 'semigloss';
  finishLabelAr: string;
  usageAr: string;
}

export const GLC_PLATINE_PDF_URL = '/assets/aistudio/GLC_Platine_Color_Card_b12cf5c6.pdf';

export const GLC_COLOR_FAMILIES: GlcColorFamily[] = [
  { id: 'neutrals', nameAr: 'أبيض ورماديات محايدة', pageNumber: 2 },
  { id: 'greige', nameAr: 'جريج وترابي دافئ', pageNumber: 3 },
  { id: 'yellows', nameAr: 'كريمي وأصفر مشرق', pageNumber: 4 },
  { id: 'ochre', nameAr: 'رملي وذهبي هادئ', pageNumber: 5 },
  { id: 'caramel', nameAr: 'بيج عسلي وكراميل', pageNumber: 6 },
  { id: 'mocha', nameAr: 'كشمير وموكا وبني', pageNumber: 7 },
  { id: 'coral', nameAr: 'خوخي ومشمشي وتيراكوتا', pageNumber: 8 },
  { id: 'rose', nameAr: 'وردي وروز وأحمر دافئ', pageNumber: 9 },
  { id: 'plum', nameAr: 'باستيل لافندر وبرقوقي', pageNumber: 10 },
  { id: 'blue', nameAr: 'سماوي وأزرق وتركواز', pageNumber: 11 },
  { id: 'green', nameAr: 'أخضر نعناعي وزيتوني', pageNumber: 12 },
];

/**
 * All 132 official colors extracted directly from GLC_Platine_Color_Card_b12cf5c6.pdf (pages 2–12).
 */
export const GLC_PLATINE_COLORS: GlcColorShade[] = [
  // Page 2 — Neutrals & Cool/Warm Greys (12)
  { code: 'N03000', hex: '#F7F4F0', familyId: 'neutrals', pageNumber: 2 },
  { code: 'Y05020', hex: '#F6F0E4', familyId: 'neutrals', pageNumber: 2 },
  { code: 'N10000', hex: '#E1DFDD', familyId: 'neutrals', pageNumber: 2 },
  { code: 'Y10020', hex: '#E1DCD2', familyId: 'neutrals', pageNumber: 2 },
  { code: 'G03502', hex: '#9EA19F', familyId: 'neutrals', pageNumber: 2 },
  { code: 'Y01502', hex: '#D5D2C7', familyId: 'neutrals', pageNumber: 2 },
  { code: 'G45020', hex: '#8C8F8D', familyId: 'neutrals', pageNumber: 2 },
  { code: 'Y20020', hex: '#C7C3BB', familyId: 'neutrals', pageNumber: 2 },
  { code: 'G65020', hex: '#616865', familyId: 'neutrals', pageNumber: 2 },
  { code: 'Y03502', hex: '#A7A39A', familyId: 'neutrals', pageNumber: 2 },
  { code: 'G07502', hex: '#4C4E4D', familyId: 'neutrals', pageNumber: 2 },
  { code: 'Y05502', hex: '#7D7972', familyId: 'neutrals', pageNumber: 2 },

  // Page 3 — Warm Greige & Earthy Taupe (12)
  { code: 'N00500', hex: '#F0EDE9', familyId: 'greige', pageNumber: 3 },
  { code: 'Y50502', hex: '#F3EDE3', familyId: 'greige', pageNumber: 3 },
  { code: 'Y51002', hex: '#E5DED7', familyId: 'greige', pageNumber: 3 },
  { code: 'R01502', hex: '#D4CDCD', familyId: 'greige', pageNumber: 3 },
  { code: 'Y51502', hex: '#D4CFC6', familyId: 'greige', pageNumber: 3 },
  { code: 'R20020', hex: '#C7BFBE', familyId: 'greige', pageNumber: 3 },
  { code: 'Y22005', hex: '#CCC2B2', familyId: 'greige', pageNumber: 3 },
  { code: 'R03502', hex: '#A6A1A0', familyId: 'greige', pageNumber: 3 },
  { code: 'Y24005', hex: '#A09483', familyId: 'greige', pageNumber: 3 },
  { code: 'Y85005', hex: '#8C7E7A', familyId: 'greige', pageNumber: 3 },
  { code: 'Y26005', hex: '#766C5D', familyId: 'greige', pageNumber: 3 },
  { code: 'R06502', hex: '#6B6162', familyId: 'greige', pageNumber: 3 },

  // Page 4 — Soft Creams & Sunny Yellows (12)
  { code: 'Y05050', hex: '#EAE9D5', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y10100', hex: '#E6DCB9', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y05100', hex: '#F1E8C4', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y10200', hex: '#EAD8A1', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y05200', hex: '#F7E6AC', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y10300', hex: '#E6D086', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y05500', hex: '#FBD962', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y20200', hex: '#CDBD8C', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y05800', hex: '#FED304', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y20700', hex: '#C6A02D', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y10800', hex: '#EBBD1E', familyId: 'yellows', pageNumber: 4 },
  { code: 'Y14055', hex: '#A1762B', familyId: 'yellows', pageNumber: 4 },

  // Page 5 — Warm Sand, Ochre & Amber (12)
  { code: 'Y10510', hex: '#FDECC4', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y11015', hex: '#EFDAAE', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y11010', hex: '#E8D8B5', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y11510', hex: '#DDCEAC', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y11020', hex: '#E8D29E', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y12020', hex: '#CFB88A', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y11030', hex: '#F0CC86', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y12040', hex: '#D5AC5C', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y11040', hex: '#F8CA6E', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y12060', hex: '#D6A22D', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y11060', hex: '#F8BD36', familyId: 'ochre', pageNumber: 5 },
  { code: 'Y34550', hex: '#945A24', familyId: 'ochre', pageNumber: 5 },

  // Page 6 — Golden Beige, Caramel & Honey (12)
  { code: 'Y20510', hex: '#FAE8C3', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y21015', hex: '#F0D6A9', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y20515', hex: '#FFE4B5', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y21515', hex: '#E1C79D', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y21010', hex: '#E9D8B7', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y22020', hex: '#D6B689', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y21020', hex: '#F0D09D', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y22030', hex: '#D5AB73', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y21050', hex: '#F6B656', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y24020', hex: '#A88861', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y21080', hex: '#F49B1E', familyId: 'caramel', pageNumber: 6 },
  { code: 'Y24050', hex: '#A16C29', familyId: 'caramel', pageNumber: 6 },

  // Page 7 — Cashmere, Mocha & Deep Espresso (12)
  { code: 'Y30510', hex: '#FAE3C4', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y31010', hex: '#ECD6B9', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y31510', hex: '#DEC8AB', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y41010', hex: '#EDDBB6', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y41510', hex: '#E1C7AD', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y42020', hex: '#D5AB88', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y31515', hex: '#E2C39D', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y32030', hex: '#D5AC5C', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y32010', hex: '#D5C0A5', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y33020', hex: '#BE9973', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y44020', hex: '#A98062', familyId: 'mocha', pageNumber: 7 },
  { code: 'Y37020', hex: '#5F3F24', familyId: 'mocha', pageNumber: 7 },

  // Page 8 — Peach, Apricot, Coral & Terracotta (12)
  { code: 'Y20520', hex: '#FFDDA4', familyId: 'coral', pageNumber: 8 },
  { code: 'Y50510', hex: '#FDE3CC', familyId: 'coral', pageNumber: 8 },
  { code: 'Y40530', hex: '#FDC791', familyId: 'coral', pageNumber: 8 },
  { code: 'Y70510', hex: '#FDDDCE', familyId: 'coral', pageNumber: 8 },
  { code: 'Y31040', hex: '#FBB66F', familyId: 'coral', pageNumber: 8 },
  { code: 'Y70515', hex: '#FCD5C3', familyId: 'coral', pageNumber: 8 },
  { code: 'Y40570', hex: '#F79037', familyId: 'coral', pageNumber: 8 },
  { code: 'Y81515', hex: '#E0B8AC', familyId: 'coral', pageNumber: 8 },
  { code: 'Y52060', hex: '#D36F35', familyId: 'coral', pageNumber: 8 },
  { code: 'Y71040', hex: '#F2987D', familyId: 'coral', pageNumber: 8 },
  { code: 'Y72070', hex: '#C84929', familyId: 'coral', pageNumber: 8 },
  { code: 'Y81060', hex: '#EC6D5C', familyId: 'coral', pageNumber: 8 },

  // Page 9 — Blush Pink, Rose & Crimson (12)
  { code: 'Y61010', hex: '#EBCEBE', familyId: 'rose', pageNumber: 9 },
  { code: 'Y90510', hex: '#F9DFD7', familyId: 'rose', pageNumber: 9 },
  { code: 'Y71010', hex: '#EECEBE', familyId: 'rose', pageNumber: 9 },
  { code: 'R05200', hex: '#FAC8C5', familyId: 'rose', pageNumber: 9 },
  { code: 'Y81020', hex: '#ECB9AB', familyId: 'rose', pageNumber: 9 },
  { code: 'R10150', hex: '#E8C3BF', familyId: 'rose', pageNumber: 9 },
  { code: 'Y72020', hex: '#D5A594', familyId: 'rose', pageNumber: 9 },
  { code: 'R10300', hex: '#EDA9AB', familyId: 'rose', pageNumber: 9 },
  { code: 'Y82030', hex: '#D88F81', familyId: 'rose', pageNumber: 9 },
  { code: 'R11070', hex: '#D63F61', familyId: 'rose', pageNumber: 9 },
  { code: 'Y86030', hex: '#6C342C', familyId: 'rose', pageNumber: 9 },
  { code: 'R30600', hex: '#942333', familyId: 'rose', pageNumber: 9 },

  // Page 10 — Pastel Rose, Lavender & Plum (12)
  { code: 'R05100', hex: '#F7DCD7', familyId: 'plum', pageNumber: 10 },
  { code: 'R61010', hex: '#D6D4DD', familyId: 'plum', pageNumber: 10 },
  { code: 'R10200', hex: '#ECBAB9', familyId: 'plum', pageNumber: 10 },
  { code: 'R41015', hex: '#DECAD9', familyId: 'plum', pageNumber: 10 },
  { code: 'R10500', hex: '#E77D81', familyId: 'plum', pageNumber: 10 },
  { code: 'R31030', hex: '#E2ACC3', familyId: 'plum', pageNumber: 10 },
  { code: 'R20400', hex: '#D07A7D', familyId: 'plum', pageNumber: 10 },
  { code: 'R22020', hex: '#C9A1AB', familyId: 'plum', pageNumber: 10 },
  { code: 'Y91085', hex: '#D12028', familyId: 'plum', pageNumber: 10 },
  { code: 'R33020', hex: '#A98A9A', familyId: 'plum', pageNumber: 10 },
  { code: 'R15800', hex: '#AD1E2B', familyId: 'plum', pageNumber: 10 },
  { code: 'R37020', hex: '#461E33', familyId: 'plum', pageNumber: 10 },

  // Page 11 — Sky Blue, Aqua & Deep Teal (12)
  { code: 'B05100', hex: '#D2E3EA', familyId: 'blue', pageNumber: 11 },
  { code: 'B31010', hex: '#C5DCDD', familyId: 'blue', pageNumber: 11 },
  { code: 'R91020', hex: '#B2CEDF', familyId: 'blue', pageNumber: 11 },
  { code: 'B21515', hex: '#ABC9CD', familyId: 'blue', pageNumber: 11 },
  { code: 'B12020', hex: '#90B5BF', familyId: 'blue', pageNumber: 11 },
  { code: 'B32030', hex: '#6CAEB5', familyId: 'blue', pageNumber: 11 },
  { code: 'B20300', hex: '#7CACC5', familyId: 'blue', pageNumber: 11 },
  { code: 'B33030', hex: '#5F9BA2', familyId: 'blue', pageNumber: 11 },
  { code: 'B12040', hex: '#50A1BA', familyId: 'blue', pageNumber: 11 },
  { code: 'B22555', hex: '#038AA2', familyId: 'blue', pageNumber: 11 },
  { code: 'B50400', hex: '#025171', familyId: 'blue', pageNumber: 11 },
  { code: 'B24050', hex: '#026B7C', familyId: 'blue', pageNumber: 11 },

  // Page 12 — Sage, Mint, Olive & Forest Green (12)
  { code: 'G20510', hex: '#E2EEDC', familyId: 'green', pageNumber: 12 },
  { code: 'G61010', hex: '#DDDFC1', familyId: 'green', pageNumber: 12 },
  { code: 'G11010', hex: '#CCDBCA', familyId: 'green', pageNumber: 12 },
  { code: 'G51020', hex: '#D4DFAE', familyId: 'green', pageNumber: 12 },
  { code: 'G32020', hex: '#ACBF9C', familyId: 'green', pageNumber: 12 },
  { code: 'G62020', hex: '#BCBE91', familyId: 'green', pageNumber: 12 },
  { code: 'G33020', hex: '#94A684', familyId: 'green', pageNumber: 12 },
  { code: 'G13030', hex: '#70A17D', familyId: 'green', pageNumber: 12 },
  { code: 'G34030', hex: '#68875C', familyId: 'green', pageNumber: 12 },
  { code: 'G14550', hex: '#025D30', familyId: 'green', pageNumber: 12 },
  { code: 'G33560', hex: '#4A7A39', familyId: 'green', pageNumber: 12 },
  { code: 'G70200', hex: '#184332', familyId: 'green', pageNumber: 12 },
];

export const GLC_PLATINE_BASES: GlcPlatineProductBase[] = [
  {
    id: 'day_stone_7070',
    productId: 'glc_day_stone_7070',
    nameAr: 'سوبر بلاتين داي ستون 7070',
    nameEn: 'Super Platine Day Stone 7070',
    finish: 'matt',
    finishLabelAr: 'مط (مطفي)',
    usageAr: 'بلاستيك لاتكس داخلي وخارجي عالي التحمل',
  },
  {
    id: 'luxury_matt_7000',
    productId: 'glc_super_day_tone_3030',
    nameAr: 'سوبر بلاتين لاكشري مط 7000',
    nameEn: 'Super Platine Luxury Matt 7000',
    finish: 'matt',
    finishLabelAr: 'مط فاخر',
    usageAr: 'دهان بلاستيك 100% أكريليك نقي مطفي داخلي',
  },
  {
    id: 'geltex_silk_15000',
    productId: 'glc_geltex_15000',
    nameAr: 'سوبر بلاتين جلتكس حريري 15000',
    nameEn: 'Super Platine Geltex Silk 15000',
    finish: 'silk',
    finishLabelAr: 'حريري (سيلك / ربع لمعة)',
    usageAr: 'دهان أكريليك مائي داخلي ناعم وقابل للغسيل',
  },
  {
    id: 'hygiene_silk_8000',
    productId: 'glc_geltex_15000',
    nameAr: 'سوبر بلاتين هايجين سيلك 8000',
    nameEn: 'Super Platine Hygiene Silk 8000',
    finish: 'silk',
    finishLabelAr: 'حريري مضاد للبكتيريا',
    usageAr: 'دهان 100% أكريليك نقي مقاوم للبكتيريا والفطريات',
  },
  {
    id: 'geltex_semigloss_20000',
    productId: 'glc_geltex_20000',
    nameAr: 'سوبر بلاتين جلتكس نصف لامع 20000',
    nameEn: 'Super Platine Geltex Semi-Gloss 20000',
    finish: 'semigloss',
    finishLabelAr: 'نصف لامع',
    usageAr: 'دهان أكريليك مائي خارجي وداخلي فائق الثبات',
  },
  {
    id: 'geltex_gloss_25000',
    productId: 'glc_geltex_25000',
    nameAr: 'سوبر بلاتين جلتكس لامع 25000',
    nameEn: 'Super Platine Geltex Gloss 25000',
    finish: 'semigloss',
    finishLabelAr: 'لامع براق',
    usageAr: 'دهان أكريليك مائي فائق اللمعان ومقاوم للغسيل الشديد',
  },
];

export function isLightHex(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

export function getToneBrightnessLabel(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return 'متوسط';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum >= 0.82) return 'درجة فاتحة مضيئة';
  if (lum >= 0.58) return 'درجة متوسطة هادئة';
  if (lum >= 0.36) return 'درجة غنية دافئة';
  return 'درجة داكنة عميقة';
}
