import { GraffiatoTextureGrade } from './sipesColors';

export interface GraffiatoBoardImage {
  id: string;
  pageNumber: number;
  titleAr: string;
  codeRange: string;
  url: string;
  isLaser: boolean;
}

export interface GraffiatoCatalogFamily {
  id: string;
  nameAr: string;
  swatchHex: string;
  pageNumber?: number;
}

export interface GraffiatoCatalogColor {
  code: string;
  hex: string;
  familyId: string;
  pageNumber: number;
  boardImage: string;
  textureGrade: GraffiatoTextureGrade;
  isLaser: boolean;
  isLaserWide?: boolean;
  nameAr?: string;
}

export interface GraffiatoCatalogBase {
  id: string;
  nameAr: string;
  finish: 'matt' | 'silk' | 'semigloss';
  finishLabelAr: string;
  grade: GraffiatoTextureGrade;
}

// ===================== 1) جرافيـاتو ليزر (6 لوحات · 110 كود: 1002 – 1220) =====================

export const GRAFFIATO_LASER_BOARD_IMAGES: GraffiatoBoardImage[] = [
  {
    id: 'laser_b1',
    pageNumber: 1,
    titleAr: 'لوحة 1 — شرائح الليزر والجرانيت (1002 – 1030)',
    codeRange: '1002 – 1030',
    url: '/assets/aistudio/IMG-20261123-WA0000_005ab66e.jpg',
    isLaser: true,
  },
  {
    id: 'laser_b2',
    pageNumber: 2,
    titleAr: 'لوحة 2 — شرائح الليزر الميتاليك (1032 – 1060)',
    codeRange: '1032 – 1060',
    url: '/assets/aistudio/IMG-20261123-WA0004_ad851d76.jpg',
    isLaser: true,
  },
  {
    id: 'laser_b3',
    pageNumber: 3,
    titleAr: 'لوحة 3 — الكيماستون المرن (1062 – 1100)',
    codeRange: '1062 – 1100',
    url: '/assets/aistudio/IMG-20261123-WA0006_dec831a2.jpg',
    isLaser: true,
  },
  {
    id: 'laser_b4',
    pageNumber: 4,
    titleAr: 'لوحة 4 — الطوبي والأخضر والتركواز (1102 – 1140)',
    codeRange: '1102 – 1140',
    url: '/assets/aistudio/IMG-20261123-WA0002_9b1c2be6.jpg',
    isLaser: true,
  },
  {
    id: 'laser_b5',
    pageNumber: 5,
    titleAr: 'لوحة 5 — الدرجات القوية والفاخرة (1142 – 1180)',
    codeRange: '1142 – 1180',
    url: '/assets/aistudio/IMG-20261123-WA0003_abc9f93d.jpg',
    isLaser: true,
  },
  {
    id: 'laser_b6',
    pageNumber: 6,
    titleAr: 'لوحة 6 — النيفي والزيتوني والداكن (1182 – 1220)',
    codeRange: '1182 – 1220',
    url: '/assets/aistudio/IMG-20261123-WA0005_d5bdc02e.jpg',
    isLaser: true,
  },
];

export const GRAFFIATO_LASER_FAMILIES: GraffiatoCatalogFamily[] = [
  { id: 'laser_b1', nameAr: 'لوحة 1: ليزر 1002–1030', swatchHex: '#BDBAB0', pageNumber: 1 },
  { id: 'laser_b2', nameAr: 'لوحة 2: ليزر 1032–1060', swatchHex: '#B5A576', pageNumber: 2 },
  { id: 'laser_b3', nameAr: 'لوحة 3: 1062–1100', swatchHex: '#C97864', pageNumber: 3 },
  { id: 'laser_b4', nameAr: 'لوحة 4: 1102–1140', swatchHex: '#1D7D9E', pageNumber: 4 },
  { id: 'laser_b5', nameAr: 'لوحة 5: 1142–1180', swatchHex: '#1A69A6', pageNumber: 5 },
  { id: 'laser_b6', nameAr: 'لوحة 6: 1182–1220', swatchHex: '#172C59', pageNumber: 6 },
];

export const GRAFFIATO_LASER_BASES: GraffiatoCatalogBase[] = [
  {
    id: 'gl_coarse',
    nameAr: 'كيماستون جرافيـاتو ليزر — خشن',
    finish: 'matt',
    finishLabelAr: 'خشن (أخاديد بارزة + ليزر)',
    grade: 'coarse',
  },
  {
    id: 'gl_medium',
    nameAr: 'كيماستون جرافيـاتو ليزر — وسط',
    finish: 'matt',
    finishLabelAr: 'وسط (حبيبات متوسطة + ليزر)',
    grade: 'medium',
  },
  {
    id: 'gl_fine',
    nameAr: 'كيماستون جرافيـاتو ليزر — ناعم',
    finish: 'silk',
    finishLabelAr: 'ناعم (ملمس دقيق + ليزر)',
    grade: 'fine',
  },
];

const B1_IMG = GRAFFIATO_LASER_BOARD_IMAGES[0].url;
const B2_IMG = GRAFFIATO_LASER_BOARD_IMAGES[1].url;
const B3_IMG = GRAFFIATO_LASER_BOARD_IMAGES[2].url;
const B4_IMG = GRAFFIATO_LASER_BOARD_IMAGES[3].url;
const B5_IMG = GRAFFIATO_LASER_BOARD_IMAGES[4].url;
const B6_IMG = GRAFFIATO_LASER_BOARD_IMAGES[5].url;

export const GRAFFIATO_LASER_COLORS: GraffiatoCatalogColor[] = [
  // ---- Board 1 (1002 – 1030, 15 codes) ----
  { code: '1002', hex: '#DCD6C6', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'عاجي جرانيت' },
  { code: '1004', hex: '#BDBAB0', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'coarse', isLaser: true, isLaserWide: true, nameAr: 'ليزر فضي أسود لامع' },
  { code: '1006', hex: '#9E9B95', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'medium', isLaser: true, nameAr: 'رمادي جرانيت مرقط' },
  { code: '1008', hex: '#9C9C98', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'fine', isLaser: true, nameAr: 'رمادي خرساني' },
  { code: '1010', hex: '#A8A9A5', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'medium', isLaser: true, isLaserWide: true, nameAr: 'ليزر كريستال رمادي' },
  { code: '1012', hex: '#9CA09F', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'fine', isLaser: true, nameAr: 'رمادي فضي رمادي' },
  { code: '1014', hex: '#CBB978', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'ذهبي قشي مرقط' },
  { code: '1016', hex: '#BFB690', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'medium', isLaser: true, isLaserWide: true, nameAr: 'ليزر شامبين ذهبي' },
  { code: '1018', hex: '#B3A05A', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'خردلي جرانيت' },
  { code: '1020', hex: '#CBC6B6', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'fine', isLaser: true, nameAr: 'رملي حجري فاتح' },
  { code: '1022', hex: '#B79C6D', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'medium', isLaser: true, isLaserWide: true, nameAr: 'ليزر ذهبي دافئ' },
  { code: '1024', hex: '#6D504E', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'كاكاو عنابي' },
  { code: '1026', hex: '#AE5E3C', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'طوبي تيراكوتا' },
  { code: '1028', hex: '#B6A69B', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'medium', isLaser: true, isLaserWide: true, nameAr: 'ليزر نحاسي وردي' },
  { code: '1030', hex: '#A66D49', familyId: 'laser_b1', pageNumber: 1, boardImage: B1_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'نحاسي جرانيت' },

  // ---- Board 2 (1032 – 1060, 15 codes) ----
  { code: '1032', hex: '#3B3E3F', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'فحمي جرانيت داكن' },
  { code: '1034', hex: '#B9BCB6', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'medium', isLaser: true, isLaserWide: true, nameAr: 'ليزر لؤلؤي أونيكس' },
  { code: '1036', hex: '#4B4E56', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'fine', isLaser: true, nameAr: 'جرافيت فضي ميتاليك' },
  { code: '1038', hex: '#7A7D7E', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'بازلت رمادي' },
  { code: '1040', hex: '#9A9D9F', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'medium', isLaser: true, isLaserWide: true, nameAr: 'ليزر بلاتينيوم لامع' },
  { code: '1042', hex: '#8E9091', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'fine', isLaser: true, nameAr: 'فولاذي ميتاليك' },
  { code: '1044', hex: '#C1A559', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'زعفراني ذهبي' },
  { code: '1046', hex: '#C4967E', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'medium', isLaser: true, isLaserWide: true, nameAr: 'ليزر مرجاني عنبري' },
  { code: '1048', hex: '#B5955E', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'نحاسي عتيق' },
  { code: '1050', hex: '#C4AE5D', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'fine', isLaser: true, nameAr: 'ذهبي ساطع' },
  { code: '1052', hex: '#B5A576', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'medium', isLaser: true, isLaserWide: true, nameAr: 'ليزر صحراوي ذهبي' },
  { code: '1054', hex: '#75534D', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'إسبريسو برونزي' },
  { code: '1056', hex: '#C35350', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'مرجاني قرمزي' },
  { code: '1058', hex: '#C8BEB2', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'medium', isLaser: true, isLaserWide: true, nameAr: 'ليزر شامبين ياقوتي' },
  { code: '1060', hex: '#B25646', familyId: 'laser_b2', pageNumber: 2, boardImage: B2_IMG, textureGrade: 'coarse', isLaser: true, nameAr: 'طوبي نحاسي' },

  // ---- Board 3 (1062 – 1100, 20 codes) ----
  { code: '1062', hex: '#C97864', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1064', hex: '#CBB2A8', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1066', hex: '#8A4535', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1068', hex: '#C5AC95', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1070', hex: '#52A544', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1072', hex: '#579641', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1074', hex: '#549E48', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1076', hex: '#BFC4A9', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1078', hex: '#CFCBC0', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1080', hex: '#BBB3AE', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1082', hex: '#2E708F', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1084', hex: '#97B2BA', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1086', hex: '#C47177', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1088', hex: '#BE9F96', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1090', hex: '#BE5B64', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1092', hex: '#CFC3B9', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1094', hex: '#BD515A', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1096', hex: '#C4B2A9', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1098', hex: '#8D5C62', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1100', hex: '#C9B3B2', familyId: 'laser_b3', pageNumber: 3, boardImage: B3_IMG, textureGrade: 'fine', isLaser: true },

  // ---- Board 4 (1102 – 1140, 20 codes) ----
  { code: '1102', hex: '#9E3E2C', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1104', hex: '#BCB083', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1106', hex: '#8E4332', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1108', hex: '#CFC0B5', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1110', hex: '#2B8F3B', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1112', hex: '#BA9B47', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1114', hex: '#387E3D', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1116', hex: '#6FB342', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1118', hex: '#1D7D9E', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1120', hex: '#B8A3A2', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1122', hex: '#327796', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1124', hex: '#C2C8C4', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1126', hex: '#8E7588', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1128', hex: '#BF9F9D', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1130', hex: '#9A6D7D', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1132', hex: '#CAC7BE', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1134', hex: '#A97565', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1136', hex: '#CCC5AB', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1138', hex: '#9A6648', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1140', hex: '#C4B6A9', familyId: 'laser_b4', pageNumber: 4, boardImage: B4_IMG, textureGrade: 'fine', isLaser: true },

  // ---- Board 5 (1142 – 1180, 20 codes) ----
  { code: '1142', hex: '#B52432', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1144', hex: '#BE9383', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1146', hex: '#A62B2E', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1148', hex: '#BFB6AC', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1150', hex: '#0F8B4C', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1152', hex: '#9DB895', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1154', hex: '#237D47', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1156', hex: '#C3C7BE', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1158', hex: '#1A69A6', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1160', hex: '#96AFC2', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1162', hex: '#275D8F', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1164', hex: '#C6C3B4', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1166', hex: '#584A69', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1168', hex: '#BEB89B', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1170', hex: '#6E4559', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1172', hex: '#C9C7BD', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1174', hex: '#A08A6C', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1176', hex: '#968077', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1178', hex: '#8E7357', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1180', hex: '#B0A399', familyId: 'laser_b5', pageNumber: 5, boardImage: B5_IMG, textureGrade: 'fine', isLaser: true },

  // ---- Board 6 (1182 – 1220, 20 codes) ----
  { code: '1182', hex: '#B41E30', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1184', hex: '#C2AEA8', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1186', hex: '#A12937', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1188', hex: '#D2C3BA', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1190', hex: '#3B5728', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1192', hex: '#B2B8AE', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1194', hex: '#5C6429', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1196', hex: '#CFD1C6', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1198', hex: '#172C59', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1200', hex: '#B19896', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1202', hex: '#2C3650', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1204', hex: '#C5C9C1', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1206', hex: '#574A68', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1208', hex: '#C3BFB6', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1210', hex: '#534B5D', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1212', hex: '#C6C4BC', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'fine', isLaser: true },
  { code: '1214', hex: '#5E3328', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1216', hex: '#B8ABA4', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'medium', isLaser: true },
  { code: '1218', hex: '#7A5448', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'coarse', isLaser: true },
  { code: '1220', hex: '#CCC8BE', familyId: 'laser_b6', pageNumber: 6, boardImage: B6_IMG, textureGrade: 'fine', isLaser: true },
];

// ===================== 2) جرافيـاتو وزخرفي بدون ليزر (6 لوحات · 90 كود) =====================

export const GRAFFIATO_CLASSIC_BOARD_IMAGES: GraffiatoBoardImage[] = [
  {
    id: 'classic_j1',
    pageNumber: 1,
    titleAr: 'لوحة 1 — جوتاشيلد زخرفي (6050 – 6078)',
    codeRange: '6050 – 6078',
    url: '/assets/aistudio/IMG-20261123-WA0012_c3329536.jpg',
    isLaser: false,
  },
  {
    id: 'classic_j2',
    pageNumber: 2,
    titleAr: 'لوحة 2 — جوتاشيلد زخرفي (6080 – 6108)',
    codeRange: '6080 – 6108',
    url: '/assets/aistudio/IMG-20261123-WA0011_f5285068.jpg',
    isLaser: false,
  },
  {
    id: 'classic_marvex',
    pageNumber: 3,
    titleAr: 'لوحة 3 — مارفكس Marvex (R 50 – R 64)',
    codeRange: 'R 50 – R 64',
    url: '/assets/aistudio/IMG-20261123-WA0009_0477aa1d.jpg',
    isLaser: false,
  },
  {
    id: 'classic_jematex',
    pageNumber: 4,
    titleAr: 'لوحة 4 — جيماتكس Jematex (X 11 – X 25)',
    codeRange: 'X 11 – X 25',
    url: '/assets/aistudio/IMG-20261123-WA0007_3bfadf15.jpg',
    isLaser: false,
  },
  {
    id: 'classic_m1',
    pageNumber: 5,
    titleAr: 'لوحة 5 — ماربل Marble (5001 – 5029)',
    codeRange: '5001 – 5029',
    url: '/assets/aistudio/IMG-20261123-WA0008_04ce3587.jpg',
    isLaser: false,
  },
  {
    id: 'classic_m2',
    pageNumber: 6,
    titleAr: 'لوحة 6 — ماربل Marble (5031 – 5059)',
    codeRange: '5031 – 5059',
    url: '/assets/aistudio/IMG-20261123-WA0010_8dbae9d4.jpg',
    isLaser: false,
  },
];

export const GRAFFIATO_CLASSIC_FAMILIES: GraffiatoCatalogFamily[] = [
  { id: 'jotashield_tex', nameAr: 'جوتاشيلد (6050–6108)', swatchHex: '#CAA76F' },
  { id: 'marvex', nameAr: 'مارفكس (R50–R64)', swatchHex: '#DFD6B9' },
  { id: 'jematex', nameAr: 'جيماتكس (X11–X25)', swatchHex: '#D4BF78' },
  { id: 'marble', nameAr: 'ماربل (5001–5059)', swatchHex: '#DDD0AE' },
];

export const GRAFFIATO_CLASSIC_BASES: GraffiatoCatalogBase[] = [
  {
    id: 'gc_coarse',
    nameAr: 'جرافيـاتو واجهات بدون ليزر — خشن (مارفكس / جيماتكس)',
    finish: 'matt',
    finishLabelAr: 'خشن (أخاديد بارزة بدون ليزر)',
    grade: 'coarse',
  },
  {
    id: 'gc_medium',
    nameAr: 'تشطيب واجهات بدون ليزر — وسط (جوتاشيلد متوسط)',
    finish: 'matt',
    finishLabelAr: 'وسط (محبب متوسط بدون ليزر)',
    grade: 'medium',
  },
  {
    id: 'gc_fine',
    nameAr: 'تشطيب واجهات بدون ليزر — ناعم (جوتاشيلد ناعم / ماربل)',
    finish: 'silk',
    finishLabelAr: 'ناعم (حبة ناعمة بدون ليزر)',
    grade: 'fine',
  },
];

const C_J1_IMG = GRAFFIATO_CLASSIC_BOARD_IMAGES[0].url;
const C_J2_IMG = GRAFFIATO_CLASSIC_BOARD_IMAGES[1].url;
const C_MV_IMG = GRAFFIATO_CLASSIC_BOARD_IMAGES[2].url;
const C_JM_IMG = GRAFFIATO_CLASSIC_BOARD_IMAGES[3].url;
const C_M1_IMG = GRAFFIATO_CLASSIC_BOARD_IMAGES[4].url;
const C_M2_IMG = GRAFFIATO_CLASSIC_BOARD_IMAGES[5].url;

export const GRAFFIATO_CLASSIC_COLORS: GraffiatoCatalogColor[] = [
  // ---- جوتاشيلد صفحة 1 (6050 – 6078, 15 codes) ----
  { code: '6050', hex: '#DBD7C4', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6050' },
  { code: '6052', hex: '#B0947E', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6052' },
  { code: '6054', hex: '#CAA76F', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6054' },
  { code: '6056', hex: '#DDC5A9', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6056' },
  { code: '6058', hex: '#CEAE98', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6058' },
  { code: '6060', hex: '#CFCBC7', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6060' },
  { code: '6062', hex: '#C9BEB4', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6062' },
  { code: '6064', hex: '#BD603A', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6064' },
  { code: '6066', hex: '#DCAD8C', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6066' },
  { code: '6068', hex: '#BC7F74', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6068' },
  { code: '6070', hex: '#E2E4DF', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6070' },
  { code: '6072', hex: '#DDD3C6', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6072' },
  { code: '6074', hex: '#AE9B89', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6074' },
  { code: '6076', hex: '#DAD0AC', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6076' },
  { code: '6078', hex: '#BC8A6E', familyId: 'jotashield_tex', pageNumber: 1, boardImage: C_J1_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6078' },

  // ---- جوتاشيلد صفحة 2 (6080 – 6108, 15 codes) ----
  { code: '6080', hex: '#CBB99F', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6080' },
  { code: '6082', hex: '#D9B768', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6082' },
  { code: '6084', hex: '#9B3F41', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6084' },
  { code: '6086', hex: '#CFC1B0', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6086' },
  { code: '6088', hex: '#DFD7BE', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6088' },
  { code: '6090', hex: '#DDD9CC', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6090' },
  { code: '6092', hex: '#E4E6E1', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6092' },
  { code: '6094', hex: '#C9A87B', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6094' },
  { code: '6096', hex: '#C5AE9B', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6096' },
  { code: '6098', hex: '#97726C', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6098' },
  { code: '6100', hex: '#9FA4A4', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6100' },
  { code: '6102', hex: '#5D605F', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6102' },
  { code: '6104', hex: '#CEBBA4', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6104' },
  { code: '6106', hex: '#E0CE95', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6106' },
  { code: '6108', hex: '#DCD4C8', familyId: 'jotashield_tex', pageNumber: 2, boardImage: C_J2_IMG, textureGrade: 'medium', isLaser: false, nameAr: 'جوتاشيلد 6108' },

  // ---- مارفكس Marvex صفحة 3 (R 50 – R 64, 15 codes) ----
  { code: 'R 50', hex: '#DFD6B9', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R50' },
  { code: 'R 51', hex: '#DFDFDC', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R51' },
  { code: 'R 52', hex: '#825144', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R52' },
  { code: 'R 53', hex: '#CFA982', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R53' },
  { code: 'R 54', hex: '#CD8359', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R54' },
  { code: 'R 55', hex: '#D7C389', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R55' },
  { code: 'R 56', hex: '#C9BCAB', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R56' },
  { code: 'R 57', hex: '#98362B', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R57' },
  { code: 'R 58', hex: '#DBCBBA', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R58' },
  { code: 'R 59', hex: '#7D5851', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R59' },
  { code: 'R 60', hex: '#B89D81', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R60' },
  { code: 'R 61', hex: '#CBB88A', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R61' },
  { code: 'R 62', hex: '#7E8083', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R62' },
  { code: 'R 63', hex: '#C0C3C5', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R63' },
  { code: 'R 64', hex: '#C08D7A', familyId: 'marvex', pageNumber: 3, boardImage: C_MV_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'مارفكس R64' },

  // ---- جيماتكس Jematex صفحة 4 (X 11 – X 25, 15 codes) ----
  { code: 'X 11', hex: '#D4BF78', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X11' },
  { code: 'X 12', hex: '#CBB26F', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X12' },
  { code: 'X 13', hex: '#8E5947', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X13' },
  { code: 'X 14', hex: '#D5C3A5', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X14' },
  { code: 'X 15', hex: '#C2A689', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X15' },
  { code: 'X 16', hex: '#DED8C8', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X16' },
  { code: 'X 17', hex: '#A86D57', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X17' },
  { code: 'X 18', hex: '#BA573B', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X18' },
  { code: 'X 19', hex: '#DBD095', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X19' },
  { code: 'X 20', hex: '#DFD29D', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X20' },
  { code: 'X 21', hex: '#D39467', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X21' },
  { code: 'X 22', hex: '#D8C3AE', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X22' },
  { code: 'X 23', hex: '#9C9FA2', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X23' },
  { code: 'X 24', hex: '#888E94', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X24' },
  { code: 'X 25', hex: '#DFDFDC', familyId: 'jematex', pageNumber: 4, boardImage: C_JM_IMG, textureGrade: 'coarse', isLaser: false, nameAr: 'جيماتكس X25' },

  // ---- ماربل Marble صفحة 5 (5001 – 5029, 15 codes) ----
  { code: '5001', hex: '#DDD0AE', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5001' },
  { code: '5003', hex: '#D2D6BD', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5003' },
  { code: '5005', hex: '#919C5F', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5005' },
  { code: '5007', hex: '#E4E6E5', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5007' },
  { code: '5009', hex: '#DED5CA', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5009' },
  { code: '5011', hex: '#BC9C83', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5011' },
  { code: '5013', hex: '#C28C6B', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5013' },
  { code: '5015', hex: '#DBDDD2', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5015' },
  { code: '5017', hex: '#DAC1AE', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5017' },
  { code: '5019', hex: '#DAC7A9', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5019' },
  { code: '5021', hex: '#7E986D', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5021' },
  { code: '5023', hex: '#DCE0DB', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5023' },
  { code: '5025', hex: '#D6BFB0', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5025' },
  { code: '5027', hex: '#D49AA8', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5027' },
  { code: '5029', hex: '#DCD4BE', familyId: 'marble', pageNumber: 5, boardImage: C_M1_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5029' },

  // ---- ماربل Marble صفحة 6 (5031 – 5059, 15 codes) ----
  { code: '5031', hex: '#DFD8C8', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5031' },
  { code: '5033', hex: '#C9B277', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5033' },
  { code: '5035', hex: '#D7D8CE', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5035' },
  { code: '5037', hex: '#CFB285', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5037' },
  { code: '5039', hex: '#DAD7CD', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5039' },
  { code: '5041', hex: '#A8846F', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5041' },
  { code: '5043', hex: '#DDD9D0', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5043' },
  { code: '5045', hex: '#C7AC95', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5045' },
  { code: '5047', hex: '#B5C9B4', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5047' },
  { code: '5049', hex: '#8E908E', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5049' },
  { code: '5051', hex: '#C7C8BC', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5051' },
  { code: '5053', hex: '#DFC4B3', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5053' },
  { code: '5055', hex: '#53AF55', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5055' },
  { code: '5057', hex: '#A8C45E', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5057' },
  { code: '5059', hex: '#B4846F', familyId: 'marble', pageNumber: 6, boardImage: C_M2_IMG, textureGrade: 'fine', isLaser: false, nameAr: 'ماربل 5059' },
];
