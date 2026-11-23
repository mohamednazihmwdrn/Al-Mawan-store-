import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns2,
  ExternalLink,
  FileText,
  Images,
  Lamp,
  Maximize2,
  MessageCircle,
  Paintbrush,
  Search,
  Send,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import {
  GLC_COLOR_FAMILIES,
  GLC_PLATINE_BASES,
  GLC_PLATINE_COLORS,
  GLC_PLATINE_PDF_URL,
  getToneBrightnessLabel,
} from '../data/glcColors';
import {
  JOTUN_CATALOG_URL,
  JOTUN_COLOR_FAMILIES,
  JOTUN_INTERIOR_BASES,
  JOTUN_INTERIOR_COLORS,
} from '../data/jotunColors';
import {
  SAVETO_COLORS,
  SAVETO_COLOR_FAMILIES,
  SAVETO_GRAFFIATO_GRADES,
  SAVETO_PRODUCT_BASES,
} from '../data/savetoColors';
import {
  SCIB_CATALOG_URL,
  SCIB_COLOR_FAMILIES,
  SCIB_COLORS,
  SCIB_PRODUCT_BASES,
} from '../data/scibColors';
import {
  CMB_CATALOGS_URL,
  CMB_COLOR_SECTIONS,
  CMB_COLORS,
  CMB_PRODUCT_BASES,
  CmbSectionId,
} from '../data/cmbColors';
import {
  GraffiatoTextureGrade,
  SIPES_COLORS,
  SIPES_COLOR_SECTIONS,
  SIPES_PRODUCT_BASES,
  SipesSectionId,
} from '../data/sipesColors';
import {
  GRAFFIATO_CLASSIC_BASES,
  GRAFFIATO_CLASSIC_BOARD_IMAGES,
  GRAFFIATO_CLASSIC_COLORS,
  GRAFFIATO_CLASSIC_FAMILIES,
  GRAFFIATO_LASER_BASES,
  GRAFFIATO_LASER_BOARD_IMAGES,
  GRAFFIATO_LASER_COLORS,
  GRAFFIATO_LASER_FAMILIES,
  GraffiatoBoardImage,
} from '../data/graffiatoCatalogColors';
import { useStore } from '../context/StoreContext';
import { Product } from '../types/store';
import { trackAnalyticsEvent } from '../lib/analytics';
import {
  GlcWallPreview,
  RoomSceneType,
  TEXTURE_GRADE_LABELS_AR,
  WallFinishType,
  WallLightingMode,
  WallTextureType,
} from './GlcWallPreview';

export type ColorStudioBrand =
  | 'glc'
  | 'jotun'
  | 'sipes'
  | 'saveto'
  | 'scib'
  | 'cmb'
  | 'graffiato_laser'
  | 'graffiato_classic';

interface GlcColorStudioPageProps {
  activeBrand: ColorStudioBrand;
  onChangeBrand: (brand: ColorStudioBrand) => void;
  onBackHome: () => void;
  onBrowseGlcProducts: () => void;
  onBrowseJotunProducts: () => void;
  onBrowseSipesProducts: () => void;
  onBrowseSavetoProducts: () => void;
  onBrowseScibProducts: () => void;
  onBrowseCmbProducts: () => void;
  onOpenProduct: (product: Product) => void;
}

interface NormalizedShade {
  code: string;
  hex: string;
  familyId: string;
  sectionShortAr?: string;
  textureGrade?: GraffiatoTextureGrade;
  isLaser?: boolean;
  isLaserWide?: boolean;
  boardImage?: string;
  nameAr?: string;
  nameEn?: string;
  pageNumber?: number;
  url?: string;
}

interface NormalizedBase {
  id: string;
  sectionId?: SipesSectionId | CmbSectionId;
  productId?: string;
  nameAr: string;
  finish: WallFinishType;
  finishLabelAr: string;
  grade?: GraffiatoTextureGrade;
}

const GLC_SIZE_OPTIONS = [
  '1 لتر عينة',
  'جالون 2.75 لتر',
  'بستلة 9 لتر',
  'بستلة 15 لتر',
] as const;

const JOTUN_SIZE_OPTIONS = [
  '0.9 لتر عينة',
  'جالون 3.6 لتر',
  'بستلة 9 لتر',
  'بستلة 16.2 لتر',
] as const;

const SAVETO_SIZE_OPTIONS = [
  'شيكارة 50 كجم (سافياتو / سموث)',
  'بستلة 25 كجم (فيتوتاتش جاهز)',
  'شيكارة 25 كجم',
] as const;

const SIPES_SIZE_OPTIONS_BY_SECTION: Record<SipesSectionId | 'all', readonly string[]> = {
  all: ['1 لتر عينة', 'جالون 3 لتر', 'بستلة 9 لتر', 'بستلة 15 لتر'],
  plastic: ['1 لتر عينة', 'جالون 3 لتر', 'بستلة 9 لتر', 'بستلة 15 لتر'],
  enamel: ['عبوة 1 لتر', 'جالون 3.6 لتر', 'بستلة 18 لتر'],
  graffiato: ['بستلة 15 كجم', 'بستلة 20 كجم', 'بستلة 25 كجم'],
  nc: ['عبوة 1 لتر', 'جالون 3.6 لتر', 'بستلة 18 لتر'],
  epoxy: ['طقم 1 لتر', 'طقم 4 لتر (جالون)', 'طقم 18 لتر (بستلة)'],
  road: ['جالون 4 لتر', 'بستلة 18 لتر'],
};

const SIPES_SECTION_SHORT_AR: Record<SipesSectionId, string> = {
  plastic: 'بلاستيك',
  enamel: 'لاكيه إنامل',
  graffiato: 'جرافيـاتو',
  nc: 'دوكو NC',
  epoxy: 'إيبوكسي',
  road: 'تخطيط طرق',
};

const SCIB_SIZE_OPTIONS = [
  '1 لتر عينة',
  'جالون 2.75 لتر',
  'بستلة 9 لتر',
  'بستلة 15 لتر',
] as const;

const CMB_SIZE_OPTIONS_BY_SECTION: Record<CmbSectionId | 'all', readonly string[]> = {
  all: ['1 لتر / 1 كجم', 'جالون / 4 كجم', 'بستلة 9 لتر / 15 كجم', 'بستلة 18–20 كجم'],
  marmix: ['عبوة 0.65 لتر', 'جالون 1.9 لتر', 'بستلة 3.75 لتر', 'بستلة 15 لتر'],
  alwany: ['عبوة ألواني 40 مل', 'طقم 10 عبوات × 40 مل', 'عبوة 1 لتر مركز'],
  interior_acrylic: ['1 لتر عينة', 'جالون 2.6 – 4 لتر', 'بستلة 8 – 9 لتر', 'بستلة 15 – 18 لتر'],
  graviato: ['بستلة 17 – 20 كجم', 'شيكارة 25 كجم', 'شيكارة 40 كجم'],
  decorative: ['عبوة 0.9 كجم', 'عبوة 2.7 كجم', 'بستلة 4 كجم'],
  epoxy: ['طقم 1 كجم (A+B)', 'طقم 4 كجم (A+B)', 'طقم 15 – 20 كجم'],
  wood: ['عبوة 0.9 كجم', 'جالون 3.3 كجم', 'بستلة 18 كجم'],
};

const CMB_SECTION_SHORT_AR: Record<CmbSectionId, string> = {
  marmix: 'مارمكس S40 وكيم لوكس',
  alwany: 'ملونات ألواني',
  interior_acrylic: 'كيماتون وكيماكوت',
  graviato: 'كيما جرافياتو والواجهات',
  decorative: 'الديكورية CMB',
  epoxy: 'كيمابوكسي',
  wood: 'أخشاب فيرونا',
};

const GRAFFIATO_SWATCH_SVG_PATTERNS: Record<GraffiatoTextureGrade, string> = {
  fine: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='3' cy='4' r='0.8' fill='%230f172a' fill-opacity='0.22'/%3E%3Ccircle cx='10' cy='2' r='0.7' fill='%23ffffff' fill-opacity='0.35'/%3E%3Ccircle cx='18' cy='7' r='0.85' fill='%230f172a' fill-opacity='0.2'/%3E%3Ccircle cx='6' cy='13' r='0.75' fill='%23ffffff' fill-opacity='0.32'/%3E%3Ccircle cx='14' cy='15' r='0.9' fill='%230f172a' fill-opacity='0.24'/%3E%3Ccircle cx='21' cy='19' r='0.8' fill='%230f172a' fill-opacity='0.18'/%3E%3Ccircle cx='4' cy='21' r='0.85' fill='%230f172a' fill-opacity='0.21'/%3E%3Ccircle cx='12' cy='22' r='0.75' fill='%23ffffff' fill-opacity='0.3'/%3E%3C/svg%3E")`,
  medium: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='5' cy='5' r='1.35' fill='%230f172a' fill-opacity='0.28'/%3E%3Ccircle cx='6' cy='4.2' r='0.9' fill='%23ffffff' fill-opacity='0.32'/%3E%3Ccircle cx='16' cy='7' r='1.5' fill='%230f172a' fill-opacity='0.26'/%3E%3Ccircle cx='24' cy='4' r='1.2' fill='%230f172a' fill-opacity='0.22'/%3E%3Ccircle cx='9' cy='17' r='1.45' fill='%230f172a' fill-opacity='0.28'/%3E%3Ccircle cx='10' cy='16' r='0.9' fill='%23ffffff' fill-opacity='0.3'/%3E%3Ccircle cx='21' cy='16' r='1.35' fill='%230f172a' fill-opacity='0.25'/%3E%3Ccircle cx='4' cy='25' r='1.2' fill='%230f172a' fill-opacity='0.24'/%3E%3Ccircle cx='16' cy='24' r='1.5' fill='%230f172a' fill-opacity='0.28'/%3E%3Ccircle cx='25' cy='25' r='1.1' fill='%23ffffff' fill-opacity='0.28'/%3E%3C/svg%3E")`,
  coarse: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='64'%3E%3Cpath d='M5,2 L5,24 M5,30 L5,60' stroke='%230f172a' stroke-opacity='0.36' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M6.5,2 L6.5,24 M6.5,30 L6.5,60' stroke='%23ffffff' stroke-opacity='0.34' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M15,6 L15,42 M15,48 L15,62' stroke='%230f172a' stroke-opacity='0.34' stroke-width='1.9' stroke-linecap='round'/%3E%3Cpath d='M16.4,6 L16.4,42 M16.4,48 L16.4,62' stroke='%23ffffff' stroke-opacity='0.3' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M25,1 L25,18 M25,25 L25,52' stroke='%230f172a' stroke-opacity='0.37' stroke-width='2.1' stroke-linecap='round'/%3E%3Cpath d='M26.6,1 L26.6,18 M26.6,25 L26.6,52' stroke='%23ffffff' stroke-opacity='0.35' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M33,10 L33,38 M33,44 L33,61' stroke='%230f172a' stroke-opacity='0.32' stroke-width='1.8' stroke-linecap='round'/%3E%3Ccircle cx='10' cy='15' r='1' fill='%230f172a' fill-opacity='0.24'/%3E%3Ccircle cx='20' cy='34' r='1' fill='%230f172a' fill-opacity='0.24'/%3E%3Ccircle cx='30' cy='48' r='1' fill='%23ffffff' fill-opacity='0.28'/%3E%3C/svg%3E")`,
};

const INITIAL_LARGE_ALL_LIMIT = 120;

const GLC_NORMALIZED_SHADES: NormalizedShade[] = GLC_PLATINE_COLORS.map((c) => ({
  code: c.code,
  hex: c.hex,
  familyId: c.familyId,
  pageNumber: c.pageNumber,
}));

const JOTUN_NORMALIZED_SHADES: NormalizedShade[] = JOTUN_INTERIOR_COLORS.map((c) => ({
  code: c.code,
  hex: c.hex,
  familyId: c.familyId,
  nameAr: c.nameAr,
  nameEn: c.nameEn,
  url: c.url,
}));

const SIPES_NORMALIZED_SHADES: NormalizedShade[] = SIPES_COLORS.map((c) => ({
  code: c.code,
  hex: c.hex,
  familyId: c.sectionId,
  sectionShortAr: SIPES_SECTION_SHORT_AR[c.sectionId],
  textureGrade: c.textureGrade,
  nameAr: c.nameAr,
  nameEn: c.nameEn,
  pageNumber: c.pageNumber,
}));

const SAVETO_NORMALIZED_SHADES: NormalizedShade[] = SAVETO_COLORS.map((c) => ({
  code: c.code,
  hex: c.hex,
  familyId: c.familyId,
  sectionShortAr: c.productLine,
  textureGrade: c.textureGrade,
  nameAr: c.nameAr,
  nameEn: c.nameEn,
}));

const SCIB_NORMALIZED_SHADES: NormalizedShade[] = SCIB_COLORS.map((c) => ({
  code: c.code,
  hex: c.hex,
  familyId: c.familyId,
  nameAr: c.nameAr,
  nameEn: c.nameEn,
  url: c.url,
}));

const CMB_NORMALIZED_SHADES: NormalizedShade[] = CMB_COLORS.map((c) => ({
  code: c.code,
  hex: c.hex,
  familyId: c.sectionId,
  sectionShortAr: CMB_SECTION_SHORT_AR[c.sectionId],
  textureGrade: c.textureGrade,
  nameAr: c.nameAr,
  nameEn: c.nameEn,
  pageNumber: c.pageNumber,
}));

const GRAFFIATO_LASER_SHADES: NormalizedShade[] = GRAFFIATO_LASER_COLORS.map((c) => ({
  code: c.code,
  hex: c.hex,
  familyId: c.familyId,
  sectionShortAr: c.isLaserWide ? 'ليزر لامع' : 'كيماستون ليزر',
  textureGrade: c.textureGrade,
  isLaser: c.isLaser,
  isLaserWide: c.isLaserWide,
  boardImage: c.boardImage,
  nameAr: c.nameAr,
  pageNumber: c.pageNumber,
}));

const GRAFFIATO_CLASSIC_SHADES: NormalizedShade[] = GRAFFIATO_CLASSIC_COLORS.map((c) => ({
  code: c.code,
  hex: c.hex,
  familyId: c.familyId,
  sectionShortAr:
    c.familyId === 'jotashield_tex'
      ? 'جوتاشيلد'
      : c.familyId === 'marvex'
      ? 'مارفكس'
      : c.familyId === 'jematex'
      ? 'جيماتكس'
      : 'ماربل',
  textureGrade: c.textureGrade,
  isLaser: false,
  boardImage: c.boardImage,
  nameAr: c.nameAr,
  pageNumber: c.pageNumber,
}));

const GRAFFIATO_TEXTURE_SIZE_OPTIONS = [
  'بستلة 20 كجم (خشن / وسط / ناعم)',
  'بستلة 15 كجم',
  'بستلة 25 كجم (واجهات خارجية)',
] as const;

function getGraffiatoBaseIdForGrade(grade?: GraffiatoTextureGrade): string {
  if (grade === 'fine') return 'sipes_graffiato_fine';
  if (grade === 'medium') return 'sipes_graffiato_medium';
  return 'sipes_graffiato_coarse';
}

function getSavetoBaseIdForGrade(grade?: GraffiatoTextureGrade): string {
  if (grade === 'fine') return 'saveto_smooth_render';
  if (grade === 'medium') return 'saveto_vetotouch_textura';
  return 'saveto_saviatto_coarse';
}

function getCmbGraviatoBaseIdForGrade(grade?: GraffiatoTextureGrade): string {
  if (grade === 'fine') return 'cmb_kema_graviato_fine';
  if (grade === 'medium') return 'cmb_kema_graviato_medium';
  return 'cmb_kema_graviato_coarse';
}

function getLaserBaseIdForGrade(grade?: GraffiatoTextureGrade): string {
  if (grade === 'fine') return 'gl_fine';
  if (grade === 'medium') return 'gl_medium';
  return 'gl_coarse';
}

function getClassicBaseIdForGrade(grade?: GraffiatoTextureGrade): string {
  if (grade === 'fine') return 'gc_fine';
  if (grade === 'medium') return 'gc_medium';
  return 'gc_coarse';
}

export const GlcColorStudioPage: React.FC<GlcColorStudioPageProps> = ({
  activeBrand,
  onChangeBrand,
  onBackHome,
  onBrowseGlcProducts,
  onBrowseJotunProducts,
  onBrowseSipesProducts,
  onBrowseSavetoProducts,
  onBrowseScibProducts,
  onBrowseCmbProducts,
  onOpenProduct,
}) => {
  const { config, products, submitInquiry } = useStore();

  // Preserve filter, search & color selection independently per brand
  const [familyByBrand, setFamilyByBrand] = useState<Record<ColorStudioBrand, string>>({
    glc: 'all',
    jotun: 'all',
    sipes: 'all',
    saveto: 'all',
    scib: 'all',
    cmb: 'all',
    graffiato_laser: 'all',
    graffiato_classic: 'all',
  });
  const [graffiatoGradeFilter, setGraffiatoGradeFilter] = useState<
    'all' | GraffiatoTextureGrade
  >('all');
  const [savetoGradeFilter, setSavetoGradeFilter] = useState<'all' | GraffiatoTextureGrade>('all');
  const [cmbGradeFilter, setCmbGradeFilter] = useState<'all' | GraffiatoTextureGrade>('all');
  const [laserOnlyFilter, setLaserOnlyFilter] = useState(false);
  const [classicGradeFilter, setClassicGradeFilter] = useState<'all' | GraffiatoTextureGrade>(
    'all'
  );
  const [searchByBrand, setSearchByBrand] = useState<Record<ColorStudioBrand, string>>({
    glc: '',
    jotun: '',
    sipes: '',
    saveto: '',
    scib: '',
    cmb: '',
    graffiato_laser: '',
    graffiato_classic: '',
  });
  const [showAllJotun, setShowAllJotun] = useState(false);
  const [showAllScib, setShowAllScib] = useState(false);
  const [boardLightbox, setBoardLightbox] = useState<{
    boards: GraffiatoBoardImage[];
    index: number;
  } | null>(null);

  const [primaryByBrand, setPrimaryByBrand] = useState<Record<ColorStudioBrand, NormalizedShade>>(
    () => ({
      glc:
        GLC_NORMALIZED_SHADES.find((c) => c.code === 'Y21010') || GLC_NORMALIZED_SHADES[0],
      jotun:
        JOTUN_NORMALIZED_SHADES.find((c) => c.code === '7627') || JOTUN_NORMALIZED_SHADES[0],
      sipes:
        SIPES_NORMALIZED_SHADES.find((c) => c.code === 'S089') || SIPES_NORMALIZED_SHADES[0],
      saveto:
        SAVETO_NORMALIZED_SHADES.find((c) => c.code.includes('SAV-C03')) ||
        SAVETO_NORMALIZED_SHADES[0],
      scib:
        SCIB_NORMALIZED_SHADES.find((c) => c.code === '9436') || SCIB_NORMALIZED_SHADES[0],
      cmb:
        CMB_NORMALIZED_SHADES.find((c) => c.code === '011') || CMB_NORMALIZED_SHADES[0],
      graffiato_laser:
        GRAFFIATO_LASER_SHADES.find((c) => c.code === '1016') || GRAFFIATO_LASER_SHADES[0],
      graffiato_classic:
        GRAFFIATO_CLASSIC_SHADES.find((c) => c.code === 'R 50') || GRAFFIATO_CLASSIC_SHADES[0],
    })
  );
  const [compareByBrand, setCompareByBrand] = useState<Record<ColorStudioBrand, NormalizedShade>>(
    () => ({
      glc:
        GLC_NORMALIZED_SHADES.find((c) => c.code === 'N03000') || GLC_NORMALIZED_SHADES[1],
      jotun:
        JOTUN_NORMALIZED_SHADES.find((c) => c.code === '1001') || JOTUN_NORMALIZED_SHADES[1],
      sipes:
        SIPES_NORMALIZED_SHADES.find((c) => c.code === '952') || SIPES_NORMALIZED_SHADES[1],
      saveto:
        SAVETO_NORMALIZED_SHADES.find((c) => c.code.includes('SAV-C01')) ||
        SAVETO_NORMALIZED_SHADES[1],
      scib:
        SCIB_NORMALIZED_SHADES.find((c) => c.code === '7420') || SCIB_NORMALIZED_SHADES[1],
      cmb:
        CMB_NORMALIZED_SHADES.find((c) => c.code === '347') || CMB_NORMALIZED_SHADES[1],
      graffiato_laser:
        GRAFFIATO_LASER_SHADES.find((c) => c.code === '1002') || GRAFFIATO_LASER_SHADES[1],
      graffiato_classic:
        GRAFFIATO_CLASSIC_SHADES.find((c) => c.code === '6050') || GRAFFIATO_CLASSIC_SHADES[1],
    })
  );

  const [compareMode, setCompareMode] = useState(false);
  const [compareSlotTarget, setCompareSlotTarget] = useState<'primary' | 'compare'>('compare');
  const [scene, setScene] = useState<RoomSceneType>(() =>
    activeBrand === 'graffiato_laser' ||
    activeBrand === 'graffiato_classic' ||
    activeBrand === 'saveto'
      ? 'exterior'
      : 'living'
  );
  const [lighting, setLighting] = useState<WallLightingMode>('daylight');
  const [finish, setFinish] = useState<WallFinishType>('matt');
  const [wallTexture, setWallTexture] = useState<WallTextureType>(() =>
    activeBrand === 'graffiato_laser' ||
    activeBrand === 'graffiato_classic' ||
    activeBrand === 'saveto'
      ? 'coarse'
      : 'smooth'
  );

  const [baseIdByBrand, setBaseIdByBrand] = useState<Record<ColorStudioBrand, string>>({
    glc: GLC_PLATINE_BASES[0].id,
    jotun: JOTUN_INTERIOR_BASES[0].id,
    sipes: SIPES_PRODUCT_BASES[0].id,
    saveto: SAVETO_PRODUCT_BASES[0].id,
    scib: SCIB_PRODUCT_BASES[0].id,
    cmb: CMB_PRODUCT_BASES[0].id,
    graffiato_laser: GRAFFIATO_LASER_BASES[0].id,
    graffiato_classic: GRAFFIATO_CLASSIC_BASES[0].id,
  });
  const [sizeByBrand, setSizeByBrand] = useState<Record<ColorStudioBrand, string>>({
    glc: GLC_SIZE_OPTIONS[2],
    jotun: JOTUN_SIZE_OPTIONS[2],
    sipes: SIPES_SIZE_OPTIONS_BY_SECTION.all[2],
    saveto: SAVETO_SIZE_OPTIONS[0],
    scib: SCIB_SIZE_OPTIONS[2],
    cmb: CMB_SIZE_OPTIONS_BY_SECTION.all[2],
    graffiato_laser: GRAFFIATO_TEXTURE_SIZE_OPTIONS[0],
    graffiato_classic: GRAFFIATO_TEXTURE_SIZE_OPTIONS[0],
  });

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isJotun = activeBrand === 'jotun';
  const isSipes = activeBrand === 'sipes';
  const isSaveto = activeBrand === 'saveto';
  const isScib = activeBrand === 'scib';
  const isCmb = activeBrand === 'cmb';
  const isGraffiatoLaser = activeBrand === 'graffiato_laser';
  const isGraffiatoClassic = activeBrand === 'graffiato_classic';
  const isDedicatedGraffiato = isGraffiatoLaser || isGraffiatoClassic;

  // Ensure direct navigation into Laser / Non-Laser Graffiato starts directly on the exterior house facade
  useEffect(() => {
    if (
      activeBrand === 'graffiato_laser' ||
      activeBrand === 'graffiato_classic' ||
      activeBrand === 'saveto'
    ) {
      setScene((prev) => (prev === 'wall' ? 'wall' : 'exterior'));
      setWallTexture((prev) => (prev === 'smooth' ? 'coarse' : prev));
    }
  }, [activeBrand]);

  const brandTitleUpper = isJotun
    ? 'JOTUN'
    : isSipes
    ? 'SIPES'
    : isSaveto
    ? 'SAVETO'
    : isScib
    ? 'SCIB'
    : isCmb
    ? 'CMB'
    : isGraffiatoLaser
    ? 'كيماستون ليزر'
    : isGraffiatoClassic
    ? 'جرافيـاتو بدون ليزر'
    : 'GLC';
  const brandTitleAr = isJotun
    ? 'جوتن (JOTUN)'
    : isSipes
    ? 'سايبس (SIPES)'
    : isSaveto
    ? 'سافيتو (SAVETO)'
    : isScib
    ? 'سكيب (SCIB)'
    : isCmb
    ? 'كيماويات البناء الحديث (CMB)'
    : isGraffiatoLaser
    ? 'جرافيـاتو ليزر — جوريكا مصر (6 لوحات)'
    : isGraffiatoClassic
    ? 'جرافيـاتو وزخرفي بدون ليزر (6 لوحات)'
    : 'GLC بلاتين';

  const allShades = isJotun
    ? JOTUN_NORMALIZED_SHADES
    : isSipes
    ? SIPES_NORMALIZED_SHADES
    : isSaveto
    ? SAVETO_NORMALIZED_SHADES
    : isScib
    ? SCIB_NORMALIZED_SHADES
    : isCmb
    ? CMB_NORMALIZED_SHADES
    : isGraffiatoLaser
    ? GRAFFIATO_LASER_SHADES
    : isGraffiatoClassic
    ? GRAFFIATO_CLASSIC_SHADES
    : GLC_NORMALIZED_SHADES;

  const primaryShade = primaryByBrand[activeBrand];
  const compareShade = compareByBrand[activeBrand];
  const selectedFamilyId = familyByBrand[activeBrand];
  const searchCode = searchByBrand[activeBrand];

  const isGraffiatoMode =
    isSaveto ||
    isDedicatedGraffiato ||
    (isSipes && (selectedFamilyId === 'graffiato' || primaryShade.familyId === 'graffiato')) ||
    (isCmb && (selectedFamilyId === 'graviato' || primaryShade.familyId === 'graviato'));

  const activeWallTexture: WallTextureType =
    (isSaveto || isDedicatedGraffiato || (isCmb && primaryShade.familyId === 'graviato')) &&
    wallTexture === 'smooth'
      ? primaryShade.textureGrade || 'coarse'
      : wallTexture;

  const effectiveScene: RoomSceneType =
    isGraffiatoMode && scene !== 'exterior' && scene !== 'wall' ? 'exterior' : scene;

  const activeSipesSection = useMemo(() => {
    if (!isSipes) return null;
    if (selectedFamilyId !== 'all') {
      return SIPES_COLOR_SECTIONS.find((s) => s.id === selectedFamilyId) || SIPES_COLOR_SECTIONS[0];
    }
    return (
      SIPES_COLOR_SECTIONS.find((s) => s.id === primaryShade.familyId) || SIPES_COLOR_SECTIONS[0]
    );
  }, [isSipes, primaryShade.familyId, selectedFamilyId]);

  const activeCmbSection = useMemo(() => {
    if (!isCmb) return null;
    if (selectedFamilyId !== 'all') {
      return CMB_COLOR_SECTIONS.find((s) => s.id === selectedFamilyId) || CMB_COLOR_SECTIONS[0];
    }
    return (
      CMB_COLOR_SECTIONS.find((s) => s.id === primaryShade.familyId) || CMB_COLOR_SECTIONS[0]
    );
  }, [isCmb, primaryShade.familyId, selectedFamilyId]);

  const basesList: NormalizedBase[] = isJotun
    ? JOTUN_INTERIOR_BASES
    : isSipes
    ? SIPES_PRODUCT_BASES
    : isSaveto
    ? SAVETO_PRODUCT_BASES
    : isScib
    ? SCIB_PRODUCT_BASES
    : isCmb
    ? CMB_PRODUCT_BASES
    : isGraffiatoLaser
    ? GRAFFIATO_LASER_BASES
    : isGraffiatoClassic
    ? GRAFFIATO_CLASSIC_BASES
    : GLC_PLATINE_BASES;

  const sizeOptions: readonly string[] = isJotun
    ? JOTUN_SIZE_OPTIONS
    : isSipes
    ? SIPES_SIZE_OPTIONS_BY_SECTION[(selectedFamilyId as SipesSectionId) || 'all'] ||
      SIPES_SIZE_OPTIONS_BY_SECTION.all
    : isSaveto
    ? SAVETO_SIZE_OPTIONS
    : isScib
    ? SCIB_SIZE_OPTIONS
    : isCmb
    ? CMB_SIZE_OPTIONS_BY_SECTION[(selectedFamilyId as CmbSectionId) || 'all'] ||
      CMB_SIZE_OPTIONS_BY_SECTION.all
    : isDedicatedGraffiato
    ? GRAFFIATO_TEXTURE_SIZE_OPTIONS
    : GLC_SIZE_OPTIONS;

  const selectedBaseId = baseIdByBrand[activeBrand];
  const rawSizeOption = sizeByBrand[activeBrand];
  const sizeOption = sizeOptions.includes(rawSizeOption) ? rawSizeOption : sizeOptions[0];

  const families = useMemo(() => {
    if (isJotun) {
      return JOTUN_COLOR_FAMILIES.map((f) => ({
        id: f.id,
        nameAr: f.nameAr,
        swatchHex: f.swatchHex,
        count: JOTUN_NORMALIZED_SHADES.filter((c) => c.familyId === f.id).length,
      }));
    }
    if (isSipes) {
      return SIPES_COLOR_SECTIONS.map((s) => ({
        id: s.id,
        nameAr: s.nameAr,
        swatchHex: s.swatchHex,
        count: SIPES_NORMALIZED_SHADES.filter((c) => c.familyId === s.id).length,
      }));
    }
    if (isSaveto) {
      return SAVETO_COLOR_FAMILIES.filter((f) => f.id !== 'all').map((f) => ({
        id: f.id,
        nameAr: f.nameAr,
        swatchHex: f.sampleHex,
        count: SAVETO_NORMALIZED_SHADES.filter((c) => c.familyId === f.id).length,
      }));
    }
    if (isScib) {
      return SCIB_COLOR_FAMILIES.map((f) => ({
        id: f.id,
        nameAr: f.nameAr,
        swatchHex: f.swatchHex,
        count: SCIB_NORMALIZED_SHADES.filter((c) => c.familyId === f.id).length,
      }));
    }
    if (isCmb) {
      return CMB_COLOR_SECTIONS.map((s) => ({
        id: s.id,
        nameAr: s.nameAr,
        swatchHex: s.swatchHex,
        count: CMB_NORMALIZED_SHADES.filter((c) => c.familyId === s.id).length,
      }));
    }
    if (isGraffiatoLaser) {
      return GRAFFIATO_LASER_FAMILIES.map((f) => ({
        id: f.id,
        nameAr: f.nameAr,
        swatchHex: f.swatchHex,
        count: GRAFFIATO_LASER_SHADES.filter((c) => c.familyId === f.id).length,
      }));
    }
    if (isGraffiatoClassic) {
      return GRAFFIATO_CLASSIC_FAMILIES.map((f) => ({
        id: f.id,
        nameAr: f.nameAr,
        swatchHex: f.swatchHex,
        count: GRAFFIATO_CLASSIC_SHADES.filter((c) => c.familyId === f.id).length,
      }));
    }
    return GLC_COLOR_FAMILIES.map((f) => ({
      id: f.id,
      nameAr: f.nameAr,
      swatchHex: GLC_PLATINE_COLORS.find((c) => c.familyId === f.id)?.hex || '#CBD5E1',
      count: GLC_NORMALIZED_SHADES.filter((c) => c.familyId === f.id).length,
    }));
  }, [isCmb, isGraffiatoClassic, isGraffiatoLaser, isJotun, isSaveto, isScib, isSipes]);

  const familyNameById = useMemo(
    () => new Map(families.map((f) => [f.id, f.nameAr])),
    [families]
  );

  const selectedBase = useMemo(
    () => basesList.find((b) => b.id === selectedBaseId) || basesList[0],
    [basesList, selectedBaseId]
  );

  const matchingStoreProduct = useMemo(() => {
    if (selectedBase.productId) {
      const exact = products.find((p) => p.id === selectedBase.productId);
      if (exact) return exact;
    }
    if (isJotun) {
      return (
        products.find(
          (p) =>
            `${p.brandName} ${p.name}`.toUpperCase().includes('JOTUN') || p.name.includes('جوتن')
        ) || null
      );
    }
    if (isSipes) {
      return (
        products.find(
          (p) =>
            `${p.brandName} ${p.name}`.toUpperCase().includes('SIPES') ||
            p.name.includes('سايبس')
        ) || null
      );
    }
    if (isSaveto) {
      return (
        products.find(
          (p) =>
            `${p.brandName} ${p.name}`.toUpperCase().includes('SAVETO') ||
            p.name.includes('سافيتو')
        ) || null
      );
    }
    if (isScib) {
      return (
        products.find(
          (p) =>
            `${p.brandName} ${p.name}`.toUpperCase().includes('SCIB') ||
            p.name.includes('سكيب')
        ) || null
      );
    }
    if (isCmb) {
      return (
        products.find(
          (p) =>
            `${p.brandName} ${p.name}`.toUpperCase().includes('CMB') ||
            p.categoryId === 'cat_cmb'
        ) || null
      );
    }
    return null;
  }, [isCmb, isJotun, isSaveto, isScib, isSipes, products, selectedBase.productId]);

  const filteredColors = useMemo(() => {
    const q = searchCode.trim().toLowerCase();
    return allShades.filter((c) => {
      if (selectedFamilyId !== 'all' && c.familyId !== selectedFamilyId) return false;
      if (
        isSipes &&
        selectedFamilyId === 'graffiato' &&
        graffiatoGradeFilter !== 'all' &&
        c.textureGrade !== graffiatoGradeFilter
      ) {
        return false;
      }
      if (isSaveto && savetoGradeFilter !== 'all' && c.textureGrade !== savetoGradeFilter) {
        return false;
      }
      if (
        isCmb &&
        selectedFamilyId === 'graviato' &&
        cmbGradeFilter !== 'all' &&
        c.textureGrade !== cmbGradeFilter
      ) {
        return false;
      }
      if (isGraffiatoLaser && laserOnlyFilter && !c.isLaserWide) {
        return false;
      }
      if (
        isGraffiatoClassic &&
        classicGradeFilter !== 'all' &&
        c.textureGrade !== classicGradeFilter
      ) {
        return false;
      }
      if (q) {
        const famName = (familyNameById.get(c.familyId) || '').toLowerCase();
        const texName = c.textureGrade ? TEXTURE_GRADE_LABELS_AR[c.textureGrade].toLowerCase() : '';
        const hay = `${c.code} ${c.nameAr || ''} ${c.nameEn || ''} ${c.sectionShortAr || ''} ${texName} ${famName}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [
    allShades,
    selectedFamilyId,
    isSipes,
    isSaveto,
    isCmb,
    isGraffiatoLaser,
    isGraffiatoClassic,
    graffiatoGradeFilter,
    savetoGradeFilter,
    cmbGradeFilter,
    laserOnlyFilter,
    classicGradeFilter,
    searchCode,
    familyNameById,
  ]);

  const shouldCapJotun =
    isJotun &&
    !showAllJotun &&
    selectedFamilyId === 'all' &&
    searchCode.trim() === '' &&
    filteredColors.length > INITIAL_LARGE_ALL_LIMIT;

  const shouldCapScib =
    isScib &&
    !showAllScib &&
    selectedFamilyId === 'all' &&
    searchCode.trim() === '' &&
    filteredColors.length > INITIAL_LARGE_ALL_LIMIT;

  const displayedColors = useMemo(
    () =>
      shouldCapJotun || shouldCapScib
        ? filteredColors.slice(0, INITIAL_LARGE_ALL_LIMIT)
        : filteredColors,
    [shouldCapJotun, shouldCapScib, filteredColors]
  );

  const handleBrandSwitch = (nextBrand: ColorStudioBrand) => {
    if (nextBrand === activeBrand) return;
    setSubmitted(false);
    setErrorMsg('');
    if (
      nextBrand === 'saveto' ||
      nextBrand === 'graffiato_laser' ||
      nextBrand === 'graffiato_classic'
    ) {
      setScene('exterior');
      const nextTex =
        nextBrand === 'graffiato_laser'
          ? 'coarse'
          : primaryByBrand[nextBrand].textureGrade || 'coarse';
      setWallTexture(nextTex);
      setFinish('matt');
    } else if (nextBrand === 'sipes' && familyByBrand.sipes === 'graffiato') {
      setScene('exterior');
      setWallTexture(primaryByBrand.sipes.textureGrade || 'coarse');
    } else if (nextBrand === 'cmb' && familyByBrand.cmb === 'graviato') {
      setScene('exterior');
      setWallTexture(primaryByBrand.cmb.textureGrade || 'coarse');
    } else if (nextBrand !== 'sipes' && nextBrand !== 'cmb' && scene === 'exterior') {
      setScene('living');
      setWallTexture('smooth');
    } else if (nextBrand !== 'sipes' && nextBrand !== 'cmb') {
      setWallTexture('smooth');
    }
    onChangeBrand(nextBrand);
  };

  const handleSelectFamily = (nextFamilyId: string) => {
    setFamilyByBrand((prev) => ({ ...prev, [activeBrand]: nextFamilyId }));
    if (isSipes) {
      if (nextFamilyId === 'graffiato') {
        setGraffiatoGradeFilter('all');
        // Graffiato is always an exterior facade finish -> switch scene to exterior
        setScene('exterior');
        const defaultPrimary =
          SIPES_NORMALIZED_SHADES.find((c) => c.familyId === 'graffiato' && c.code === '616') ||
          SIPES_NORMALIZED_SHADES.find((c) => c.familyId === 'graffiato');
        const defaultCompare =
          SIPES_NORMALIZED_SHADES.find((c) => c.familyId === 'graffiato' && c.code === '630') ||
          SIPES_NORMALIZED_SHADES.find((c) => c.familyId === 'graffiato' && c.code === '683 FMC');

        let nextGrade: GraffiatoTextureGrade = 'coarse';
        if (primaryByBrand.sipes.familyId !== 'graffiato' && defaultPrimary) {
          setPrimaryByBrand((prev) => ({ ...prev, sipes: defaultPrimary }));
          nextGrade = defaultPrimary.textureGrade || 'coarse';
        } else {
          nextGrade = primaryByBrand.sipes.textureGrade || 'coarse';
        }
        if (compareByBrand.sipes.familyId !== 'graffiato' && defaultCompare) {
          setCompareByBrand((prev) => ({ ...prev, sipes: defaultCompare }));
        }
        setWallTexture(nextGrade);
        setBaseIdByBrand((prev) => ({
          ...prev,
          sipes: getGraffiatoBaseIdForGrade(nextGrade),
        }));
        setFinish('matt');
      } else if (nextFamilyId !== 'all') {
        setScene((prevScene) => (prevScene === 'exterior' ? 'living' : prevScene));
        setWallTexture('smooth');
        const matchedBase = SIPES_PRODUCT_BASES.find((b) => b.sectionId === nextFamilyId);
        if (matchedBase) {
          setBaseIdByBrand((prev) => ({ ...prev, sipes: matchedBase.id }));
          setFinish(matchedBase.finish);
        }
      } else {
        setWallTexture(
          primaryByBrand.sipes.textureGrade ? primaryByBrand.sipes.textureGrade : 'smooth'
        );
      }

      if (nextFamilyId !== 'all') {
        const nextSizes = SIPES_SIZE_OPTIONS_BY_SECTION[nextFamilyId as SipesSectionId];
        if (nextSizes && !nextSizes.includes(sizeByBrand.sipes)) {
          setSizeByBrand((prev) => ({ ...prev, sipes: nextSizes[0] }));
        }
      }
    } else if (isCmb) {
      if (nextFamilyId === 'graviato') {
        setCmbGradeFilter('all');
        setScene('exterior');
        const defaultPrimary =
          CMB_NORMALIZED_SHADES.find((c) => c.familyId === 'graviato' && c.code === 'KEMA-GR-SD') ||
          CMB_NORMALIZED_SHADES.find((c) => c.familyId === 'graviato');
        const defaultCompare =
          CMB_NORMALIZED_SHADES.find((c) => c.familyId === 'graviato' && c.code === 'PLIKO-700') ||
          CMB_NORMALIZED_SHADES.find((c) => c.familyId === 'graviato');
        let nextGrade: GraffiatoTextureGrade = 'coarse';
        if (primaryByBrand.cmb.familyId !== 'graviato' && defaultPrimary) {
          setPrimaryByBrand((prev) => ({ ...prev, cmb: defaultPrimary }));
          nextGrade = defaultPrimary.textureGrade || 'coarse';
        } else {
          nextGrade = primaryByBrand.cmb.textureGrade || 'coarse';
        }
        if (compareByBrand.cmb.familyId !== 'graviato' && defaultCompare) {
          setCompareByBrand((prev) => ({ ...prev, cmb: defaultCompare }));
        }
        setWallTexture(nextGrade);
        setBaseIdByBrand((prev) => ({
          ...prev,
          cmb: getCmbGraviatoBaseIdForGrade(nextGrade),
        }));
        setFinish('matt');
      } else if (nextFamilyId !== 'all') {
        setScene((prevScene) => (prevScene === 'exterior' ? 'living' : prevScene));
        setWallTexture('smooth');
        const matchedBase = CMB_PRODUCT_BASES.find((b) => b.sectionId === nextFamilyId);
        if (matchedBase) {
          setBaseIdByBrand((prev) => ({ ...prev, cmb: matchedBase.id }));
          setFinish(matchedBase.finish);
        }
      } else {
        setWallTexture(primaryByBrand.cmb.textureGrade || 'smooth');
      }

      if (nextFamilyId !== 'all') {
        const nextSizes = CMB_SIZE_OPTIONS_BY_SECTION[nextFamilyId as CmbSectionId];
        if (nextSizes && !nextSizes.includes(sizeByBrand.cmb)) {
          setSizeByBrand((prev) => ({ ...prev, cmb: nextSizes[0] }));
        }
      }
    } else if (isGraffiatoClassic && nextFamilyId !== 'all') {
      setScene('exterior');
      const famDefaultGrade: GraffiatoTextureGrade =
        nextFamilyId === 'marvex' || nextFamilyId === 'jematex'
          ? 'coarse'
          : nextFamilyId === 'jotashield_tex'
          ? 'medium'
          : 'fine';
      setWallTexture(famDefaultGrade);
      setBaseIdByBrand((prev) => ({
        ...prev,
        graffiato_classic: getClassicBaseIdForGrade(famDefaultGrade),
      }));
    }
  };

  const handleSelectSwatch = (shade: NormalizedShade) => {
    setSubmitted(false);
    if (compareMode && compareSlotTarget === 'compare') {
      setCompareByBrand((prev) => ({ ...prev, [activeBrand]: shade }));
      if (
        (isSipes && shade.familyId === 'graffiato') ||
        (isCmb && shade.familyId === 'graviato') ||
        isSaveto ||
        isDedicatedGraffiato
      ) {
        setScene('exterior');
      }
    } else {
      setPrimaryByBrand((prev) => ({ ...prev, [activeBrand]: shade }));
      if (isDedicatedGraffiato) {
        setScene('exterior');
        // Keep customer's chosen خشن / وسط / ناعم texture if already selected, otherwise adopt shade default
        const currentOrShadeGrade: GraffiatoTextureGrade =
          activeWallTexture !== 'smooth' ? activeWallTexture : shade.textureGrade || 'coarse';
        setWallTexture(currentOrShadeGrade);
        setBaseIdByBrand((prev) => ({
          ...prev,
          [activeBrand]: isGraffiatoLaser
            ? getLaserBaseIdForGrade(currentOrShadeGrade)
            : getClassicBaseIdForGrade(currentOrShadeGrade),
        }));
      } else if (isSaveto) {
        setScene('exterior');
        const nextGrade = shade.textureGrade || 'coarse';
        setWallTexture(nextGrade);
        setBaseIdByBrand((prev) => ({
          ...prev,
          saveto: getSavetoBaseIdForGrade(nextGrade),
        }));
        setFinish('matt');
      } else if (isSipes) {
        if (shade.familyId === 'graffiato') {
          setScene('exterior');
          const nextGrade = shade.textureGrade || 'coarse';
          setWallTexture(nextGrade);
          setBaseIdByBrand((prev) => ({
            ...prev,
            sipes: getGraffiatoBaseIdForGrade(nextGrade),
          }));
          setFinish('matt');
        } else {
          setWallTexture('smooth');
          if (scene === 'exterior') {
            setScene('living');
          }
          const matchedBase = SIPES_PRODUCT_BASES.find((b) => b.sectionId === shade.familyId);
          if (matchedBase) {
            setBaseIdByBrand((prev) => ({ ...prev, sipes: matchedBase.id }));
            setFinish(matchedBase.finish);
          }
        }
      } else if (isCmb) {
        if (shade.familyId === 'graviato') {
          setScene('exterior');
          const nextGrade = shade.textureGrade || 'coarse';
          setWallTexture(nextGrade);
          setBaseIdByBrand((prev) => ({
            ...prev,
            cmb: getCmbGraviatoBaseIdForGrade(nextGrade),
          }));
          setFinish('matt');
        } else {
          setWallTexture('smooth');
          if (scene === 'exterior') {
            setScene('living');
          }
          const matchedBase = CMB_PRODUCT_BASES.find((b) => b.sectionId === shade.familyId);
          if (matchedBase) {
            setBaseIdByBrand((prev) => ({ ...prev, cmb: matchedBase.id }));
            setFinish(matchedBase.finish);
          }
        }
      }
    }
  };

  const handleSelectFinish = (nextFinish: WallFinishType) => {
    setFinish(nextFinish);
    if (selectedBase.finish !== nextFinish) {
      const firstMatch = basesList.find((b) => b.finish === nextFinish);
      if (firstMatch) {
        setBaseIdByBrand((prev) => ({ ...prev, [activeBrand]: firstMatch.id }));
      }
    }
  };

  const handleSelectTexture = (nextTex: WallTextureType) => {
    setWallTexture(nextTex);
    if (isGraffiatoLaser && nextTex !== 'smooth') {
      setBaseIdByBrand((prev) => ({
        ...prev,
        graffiato_laser: getLaserBaseIdForGrade(nextTex),
      }));
      if (scene !== 'exterior' && scene !== 'wall') {
        setScene('exterior');
      }
    } else if (isGraffiatoClassic && nextTex !== 'smooth') {
      setBaseIdByBrand((prev) => ({
        ...prev,
        graffiato_classic: getClassicBaseIdForGrade(nextTex),
      }));
      if (scene !== 'exterior' && scene !== 'wall') {
        setScene('exterior');
      }
    } else if (isSaveto && nextTex !== 'smooth') {
      setBaseIdByBrand((prev) => ({
        ...prev,
        saveto: getSavetoBaseIdForGrade(nextTex),
      }));
      if (scene !== 'exterior' && scene !== 'wall') {
        setScene('exterior');
      }
    } else if (isSipes && nextTex !== 'smooth') {
      setBaseIdByBrand((prev) => ({
        ...prev,
        sipes: getGraffiatoBaseIdForGrade(nextTex),
      }));
      if (scene !== 'exterior' && scene !== 'wall') {
        setScene('exterior');
      }
    } else if (isCmb && nextTex !== 'smooth') {
      setBaseIdByBrand((prev) => ({
        ...prev,
        cmb: getCmbGraviatoBaseIdForGrade(nextTex),
      }));
      if (scene !== 'exterior' && scene !== 'wall') {
        setScene('exterior');
      }
    }
  };

  const handleSelectBase = (baseId: string) => {
    setBaseIdByBrand((prev) => ({ ...prev, [activeBrand]: baseId }));
    const found = basesList.find((b) => b.id === baseId);
    if (found) setFinish(found.finish);
    if (
      baseId === 'sipes_graffiato_fine' ||
      baseId === 'saveto_smooth_render' ||
      baseId === 'cmb_kema_graviato_fine' ||
      baseId === 'gl_fine' ||
      baseId === 'gc_fine'
    ) {
      setWallTexture('fine');
      setScene('exterior');
    } else if (
      baseId === 'sipes_graffiato_medium' ||
      baseId === 'saveto_vetotouch_textura' ||
      baseId === 'cmb_kema_graviato_medium' ||
      baseId === 'gl_medium' ||
      baseId === 'gc_medium'
    ) {
      setWallTexture('medium');
      setScene('exterior');
    } else if (
      baseId === 'sipes_graffiato_coarse' ||
      baseId === 'saveto_saviatto_coarse' ||
      baseId === 'saveto_vetotouch_graviatto' ||
      baseId === 'cmb_kema_graviato_coarse' ||
      baseId === 'gl_coarse' ||
      baseId === 'gc_coarse'
    ) {
      setWallTexture('coarse');
      setScene('exterior');
    } else if (baseId === 'scib_ultima_exterior' || baseId === 'scib_weathercoat_classic') {
      setScene('exterior');
    }
  };

  const formatShadeLabel = (shade: NormalizedShade) => {
    const label = shade.nameAr || shade.nameEn;
    return label ? `${shade.code} (${label})` : shade.code;
  };

  const orderColorSummary = compareMode
    ? `${formatShadeLabel(primaryShade)} (أساسي) / للمقارنة: ${formatShadeLabel(compareShade)}`
    : formatShadeLabel(primaryShade);

  const primaryFamilyName = familyNameById.get(primaryShade.familyId) || '';
  const activeTextureLabel =
    activeWallTexture !== 'smooth' ? TEXTURE_GRADE_LABELS_AR[activeWallTexture] : null;

  const whatsappUrl = `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    `مرحباً ${config.storeName}، أرغب في تجهيز لون ${brandTitleAr} بالكمبيوتر:\n• القسم/الباليت: ${primaryFamilyName}\n• كود اللون: ${formatShadeLabel(primaryShade)}${
      activeTextureLabel ? `\n• الملمس المطلوب: ${activeTextureLabel}` : ''
    }\n• نوع الدهان: ${selectedBase.nameAr} (${selectedBase.finishLabelAr})\n• العبوة المطلوبة: ${sizeOption}`
  )}`;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.trim().length < 2 || phone.trim().length < 6) {
      setErrorMsg('يرجى إدخال الاسم ورقم الهاتف للتواصل وتأكيد التجهيز.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await submitInquiry({
        customerName: customerName.trim(),
        phone: phone.trim(),
        subject: `تلوين كمبيوتر ${brandTitleUpper}: كود ${formatShadeLabel(primaryShade)}`,
        message: `الشركة: ${brandTitleAr}\nالقسم: ${primaryFamilyName}\nالكود المطلوب: ${orderColorSummary}${
          activeTextureLabel ? `\nالملمس: ${activeTextureLabel}` : ''
        }\nنوع المنتج: ${selectedBase.nameAr} (${selectedBase.finishLabelAr})\nالعبوة: ${sizeOption}`,
        colorCode: `${brandTitleUpper} ${formatShadeLabel(primaryShade)}`,
      });
      setSubmitted(true);
      setCustomerName('');
      setPhone('');
    } catch {
      setErrorMsg('تعذر إرسال الطلب الآن، يمكنك الطلب مباشرة عبر واتساب.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-12">
      {/* Top Studio Header Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-bold">
                <span>
                  {isJotun
                    ? 'JOTUN EGYPT'
                    : isSipes
                    ? 'SIPES PAINTS'
                    : isSaveto
                    ? 'SAVETO · VETO'
                    : isScib
                    ? 'SCIB PAINTS'
                    : isCmb
                    ? 'CMB EGYPT'
                    : isGraffiatoLaser
                    ? 'جرافيـاتو ليزر · جوريكا مصر'
                    : isGraffiatoClassic
                    ? 'جرافيـاتو بدون ليزر · واجهات'
                    : 'GLC PAINTS'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {isJotun
                    ? 'كتالوج ألوان جوتن الداخلية الرسمي'
                    : isSipes
                    ? 'كتالوجات سايبس الرسمية (داخلية وخارجية)'
                    : isSaveto
                    ? 'جرافيـاتو سافيتو وسافياتو للواجهات (خشن · وسط · ناعم)'
                    : isScib
                    ? 'كتالوج ألوان سكيب الرسمي (Colour Catalogue)'
                    : isCmb
                    ? 'كتالوجات ألوان ومنتجات كيماويات البناء الحديث'
                    : isGraffiatoLaser
                    ? '6 لوحات أصلية (1002 – 1220) · تشطيب بالليزر (خشن · وسط · ناعم)'
                    : isGraffiatoClassic
                    ? '6 لوحات أصلية (جوتاشيلد · مارفكس · جيماتكس · ماربل) بدون ليزر'
                    : 'كارتيلا سوبر بلاتين المعتمدة'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-nums">{allShades.length} كود لون</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white leading-snug">
                {isJotun
                  ? 'كمبيوتر ألوان جوتن (JOTUN) ومعاينة الحائط المباشرة'
                  : isSipes
                  ? 'كمبيوتر ألوان سايبس (SIPES) — الواجهات الخارجية والحوائط'
                  : isSaveto
                  ? 'كتالوج جرافيـاتو وواجهات سافيتو (SAVETO) — خشن 3مم · وسط 2مم · ناعم 1مم'
                  : isScib
                  ? 'كمبيوتر ألوان سكيب (SCIB) ومعاينة الحائط المباشرة (2,221 لون)'
                  : isCmb
                  ? 'كتالوج ألوان ومنتجات CMB (مارمكس · ألواني · كيماتون · كيما جرافياتو · كيمابوكسي)'
                  : isGraffiatoLaser
                  ? 'كتالوج جرافيـاتو ليزر (6 صور أصلية) — عرض خشن ووسط وناعم على واجهة البيت'
                  : isGraffiatoClassic
                  ? 'كتالوج جرافيـاتو وزخرفي بدون ليزر (6 صور أصلية) — عرض خشن ووسط وناعم على واجهة البيت'
                  : 'كمبيوتر ألوان GLC ومعاينة الحائط المباشرة'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isJotun ? (
                <a
                  href={JOTUN_CATALOG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-100 whitespace-nowrap shrink-0 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>كتالوج جوتن الرسمي</span>
                </a>
              ) : isScib ? (
                <a
                  href={SCIB_CATALOG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-100 whitespace-nowrap shrink-0 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>كتالوج سكيب الرسمي</span>
                </a>
              ) : isCmb && activeCmbSection ? (
                <a
                  href={activeCmbSection.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={activeCmbSection.pdfName}
                  className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-100 whitespace-nowrap shrink-0 transition-colors"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>كتالوج {activeCmbSection.shortAr} PDF</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              ) : isSipes && activeSipesSection ? (
                <a
                  href={activeSipesSection.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={activeSipesSection.pdfName}
                  className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-100 whitespace-nowrap shrink-0 transition-colors"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>كتالوج {SIPES_SECTION_SHORT_AR[activeSipesSection.id]} PDF</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              ) : isDedicatedGraffiato ? (
                <button
                  type="button"
                  onClick={() =>
                    setBoardLightbox({
                      boards: isGraffiatoLaser
                        ? GRAFFIATO_LASER_BOARD_IMAGES
                        : GRAFFIATO_CLASSIC_BOARD_IMAGES,
                      index: 0,
                    })
                  }
                  className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-100 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <Images className="w-4 h-4 text-amber-400" />
                  <span>
                    {isGraffiatoLaser ? 'تصفح 6 صور ليزر الأصلية' : 'تصفح 6 صور بدون ليزر'}
                  </span>
                </button>
              ) : isSaveto ? null : (
                <a
                  href={GLC_PLATINE_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="GLC_Platine_Color_Card.pdf"
                  className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-100 whitespace-nowrap shrink-0 transition-colors"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>كتالوج بلاتين PDF</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}

              {!isDedicatedGraffiato && (
                <button
                  type="button"
                  onClick={
                    isJotun
                      ? onBrowseJotunProducts
                      : isSipes
                      ? onBrowseSipesProducts
                      : isSaveto
                      ? onBrowseSavetoProducts
                      : isScib
                      ? onBrowseScibProducts
                      : isCmb
                      ? onBrowseCmbProducts
                      : onBrowseGlcProducts
                  }
                  className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-100 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <Paintbrush className="w-4 h-4 text-amber-400" />
                  <span>
                    {isJotun
                      ? 'قسم دهانات جوتن'
                      : isSipes
                      ? 'قسم دهانات سايبس'
                      : isSaveto
                      ? 'منتجات سافيتو'
                      : isScib
                      ? 'قسم دهانات سكيب'
                      : isCmb
                      ? 'منتجات CMB'
                      : 'منتجات GLC'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onBackHome}
                className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-3.5 py-2 text-xs font-extrabold text-slate-950 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للصفحة السابقة</span>
              </button>
            </div>
          </div>

          {/* Clean Brand & Catalog Switcher Segmented Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800 overflow-x-auto no-scrollbar max-w-full">
              <button
                type="button"
                onClick={() => handleBrandSwitch('glc')}
                className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeBrand === 'glc'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                GLC بلاتين{' '}
                <span className="font-mono-nums opacity-80">
                  ({GLC_NORMALIZED_SHADES.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleBrandSwitch('jotun')}
                className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeBrand === 'jotun'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                جوتن JOTUN{' '}
                <span className="font-mono-nums opacity-80">
                  ({JOTUN_NORMALIZED_SHADES.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleBrandSwitch('sipes')}
                className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeBrand === 'sipes'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                سايبس SIPES{' '}
                <span className="font-mono-nums opacity-80">
                  ({SIPES_NORMALIZED_SHADES.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleBrandSwitch('scib')}
                className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeBrand === 'scib'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                سكيب SCIB{' '}
                <span className="font-mono-nums opacity-80">
                  ({SCIB_NORMALIZED_SHADES.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleBrandSwitch('cmb')}
                className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeBrand === 'cmb'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                CMB كيماويات{' '}
                <span className="font-mono-nums opacity-80">
                  ({CMB_NORMALIZED_SHADES.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleBrandSwitch('saveto')}
                className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeBrand === 'saveto'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                سافيتو SAVETO{' '}
                <span className="font-mono-nums opacity-80">
                  ({SAVETO_NORMALIZED_SHADES.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleBrandSwitch('graffiato_laser')}
                className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeBrand === 'graffiato_laser'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-amber-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>جرافيـاتو ليزر</span>
                <span className="font-mono-nums opacity-80">
                  ({GRAFFIATO_LASER_SHADES.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleBrandSwitch('graffiato_classic')}
                className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeBrand === 'graffiato_classic'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                جرافيـاتو بدون ليزر{' '}
                <span className="font-mono-nums opacity-80">
                  ({GRAFFIATO_CLASSIC_SHADES.length})
                </span>
              </button>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-400">
              {isDedicatedGraffiato
                ? 'اضغط على أي كود لمشاهدته فوراً على واجهة البيت مع التبديل بين الملمس الخشن والوسط والناعم'
                : 'اختر الشركة والقسم واضغط على أي درجة لون لمشاهدتها فوراً على الواجهة الخارجية أو الغرفة'}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Interactive Studio Workspace */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RIGHT / STICKY COLUMN (in RTL): Interactive Wall & Exterior Facade Visualizer */}
        <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-5 space-y-4 shadow-xs">
            {/* Scene Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto no-scrollbar max-w-full">
                {(isGraffiatoMode
                  ? ([
                      { id: 'exterior', label: 'واجهة البيت' },
                      { id: 'wall', label: 'تكبير ملمس الواجهة' },
                    ] as const)
                  : ([
                      { id: 'living', label: 'غرفة معيشة' },
                      { id: 'bedroom', label: 'غرفة نوم' },
                      { id: 'exterior', label: 'واجهة البيت' },
                      { id: 'wall', label: 'حائط كامل' },
                    ] as const)
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScene(item.id)}
                    className={`min-h-[36px] px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      effectiveScene === item.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setLighting((prev) => (prev === 'daylight' ? 'warm' : 'daylight'))
                  }
                  className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    lighting === 'warm'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {lighting === 'warm' ? (
                    <>
                      <Lamp className="w-3.5 h-3.5 text-amber-600" />
                      <span>{effectiveScene === 'exterior' ? 'إضاءة ليلية' : 'إضاءة دافئة'}</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-blue-600" />
                      <span>إضاءة نهارية</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCompareMode((prev) => !prev)}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    compareMode
                      ? 'bg-slate-900 border-slate-900 text-amber-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>مقارنة لونين</span>
                </button>
              </div>
            </div>

            {/* Split-Compare Slot Selector when enabled */}
            {compareMode && (
              <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCompareSlotTarget('primary')}
                  className={`min-h-[42px] rounded-lg border px-3 py-1.5 flex items-center justify-between gap-2 text-right transition-all cursor-pointer ${
                    compareSlotTarget === 'primary'
                      ? 'border-blue-600 bg-white ring-2 ring-blue-600/15'
                      : 'border-slate-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500">
                      {effectiveScene === 'exterior'
                        ? 'تغيير الواجهة الرئيسية'
                        : 'تغيير اللون الأساسي (يمين)'}
                    </div>
                    <div className="font-mono-nums text-xs font-extrabold text-slate-900 truncate">
                      {primaryShade.code}
                      {primaryShade.nameAr ? ` · ${primaryShade.nameAr}` : ''}
                    </div>
                  </div>
                  <span
                    className="w-6 h-6 rounded border border-black/15 shrink-0"
                    style={{ backgroundColor: primaryShade.hex }}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setCompareSlotTarget('compare')}
                  className={`min-h-[42px] rounded-lg border px-3 py-1.5 flex items-center justify-between gap-2 text-right transition-all cursor-pointer ${
                    compareSlotTarget === 'compare'
                      ? 'border-blue-600 bg-white ring-2 ring-blue-600/15'
                      : 'border-slate-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500">
                      {effectiveScene === 'exterior'
                        ? 'تغيير الجناح والسور'
                        : 'تغيير لون المقارنة (يسار)'}
                    </div>
                    <div className="font-mono-nums text-xs font-extrabold text-slate-900 truncate">
                      {compareShade.code}
                      {compareShade.nameAr ? ` · ${compareShade.nameAr}` : ''}
                    </div>
                  </div>
                  <span
                    className="w-6 h-6 rounded border border-black/15 shrink-0"
                    style={{ backgroundColor: compareShade.hex }}
                  />
                </button>
              </div>
            )}

            {/* Architectural Live Visualizer (Exterior Facade or Room Wall) */}
            <GlcWallPreview
              primaryShade={{
                code: primaryShade.code,
                hex: primaryShade.hex,
                nameAr: primaryShade.nameAr || primaryShade.nameEn,
                brandLabel: brandTitleUpper,
                texture: activeWallTexture,
                laserGlitter: isGraffiatoLaser || Boolean(primaryShade.isLaser),
              }}
              compareShade={
                compareMode
                  ? {
                      code: compareShade.code,
                      hex: compareShade.hex,
                      nameAr: compareShade.nameAr || compareShade.nameEn,
                      brandLabel: brandTitleUpper,
                      texture: activeWallTexture,
                      laserGlitter: isGraffiatoLaser || Boolean(compareShade.isLaser),
                    }
                  : null
              }
              scene={effectiveScene}
              lighting={lighting}
              finish={finish}
              texture={activeWallTexture}
              hasLaserGlitter={isGraffiatoLaser}
            />

            {/* Graffiato Texture Controls when in Graffiato / Exterior mode, or Sheen Controls otherwise */}
            {isGraffiatoMode || activeWallTexture !== 'smooth' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <span className="text-xs font-bold text-slate-700">
                  {isSaveto
                    ? 'ملمس وخشونة واجهة سافيتو:'
                    : 'خشونة الملمس على واجهة البيت:'}
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                  {(
                    [
                      {
                        id: 'coarse',
                        label: isSaveto ? 'خشن 3–4مم' : 'خشن',
                      },
                      {
                        id: 'medium',
                        label: isSaveto ? 'وسط 2مم' : 'وسط',
                      },
                      {
                        id: 'fine',
                        label: isSaveto ? 'ناعم 1مم' : 'ناعم',
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTexture(item.id)}
                      className={`min-h-[38px] px-3 py-1 rounded-md text-xs sm:text-sm font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                        activeWallTexture === item.id
                          ? 'bg-slate-900 text-amber-400 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <span className="text-xs font-bold text-slate-700">درجة اللمعة على الحائط:</span>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto no-scrollbar">
                  {(
                    [
                      { id: 'matt', label: 'مط (Matt)' },
                      { id: 'silk', label: 'حريري (Silk)' },
                      { id: 'semigloss', label: 'نصف لامع (Semi-Gloss)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectFinish(item.id)}
                      className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        finish === item.id
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Swatch Specifications Summary */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="relative w-12 h-12 rounded-xl border border-black/15 shrink-0 shadow-xs overflow-hidden"
                  style={{ backgroundColor: primaryShade.hex }}
                >
                  {activeWallTexture !== 'smooth' && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{ backgroundImage: GRAFFIATO_SWATCH_SVG_PATTERNS[activeWallTexture] }}
                    />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-nums text-base font-extrabold text-slate-900">
                      {brandTitleUpper} {primaryShade.code}
                    </span>
                    {primaryShade.nameAr && (
                      <span className="text-sm font-extrabold text-blue-700">
                        {primaryShade.nameAr}
                      </span>
                    )}
                    {primaryShade.nameEn && (
                      <span className="text-xs text-slate-500">({primaryShade.nameEn})</span>
                    )}
                    <span className="text-xs text-slate-400 font-mono-nums">
                      {primaryShade.hex}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">
                    {primaryFamilyName}
                    {activeTextureLabel ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        {activeTextureLabel}
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true"> · </span>
                        {getToneBrightnessLabel(primaryShade.hex)}
                      </>
                    )}
                    {primaryShade.pageNumber ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        صفحة {primaryShade.pageNumber} بالكتالوج
                      </>
                    ) : null}
                  </p>
                </div>
              </div>

              {primaryShade.url && (
                <a
                  href={primaryShade.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                >
                  <span>{isScib ? 'صفحة اللون بسكيب' : 'صفحة اللون بجوتن'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </section>

          {/* Computer Color Mixing & Order Request Card */}
          <form
            onSubmit={handleOrderSubmit}
            className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                تجهيز لون{' '}
                {isJotun
                  ? 'جوتن'
                  : isSipes
                  ? 'سايبس'
                  : isSaveto
                  ? 'سافيتو'
                  : isScib
                  ? 'سكيب'
                  : isCmb
                  ? 'CMB'
                  : isGraffiatoLaser
                  ? 'جرافيـاتو ليزر'
                  : isGraffiatoClassic
                  ? 'جرافيـاتو بدون ليزر'
                  : 'GLC'}{' '}
                بالكمبيوتر وطلبه الآن
              </h2>
              {matchingStoreProduct && (
                <button
                  type="button"
                  onClick={() => onOpenProduct(matchingStoreProduct)}
                  className="text-xs font-bold text-blue-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  تفاصيل الدهان ←
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  منتج {brandTitleUpper} المطلوب للتلوين:
                </label>
                <select
                  value={selectedBaseId}
                  onChange={(e) => handleSelectBase(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {basesList.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.nameAr} — {base.finishLabelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">حجم العبوة:</label>
                <select
                  value={sizeOption}
                  onChange={(e) =>
                    setSizeByBrand((prev) => ({ ...prev, [activeBrand]: e.target.value }))
                  }
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {sizeOptions.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="الاسم بالكامل *"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف / واتساب *"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 font-mono-nums focus:outline-none focus:border-blue-600"
              />
            </div>

            {errorMsg && <p className="text-xs font-semibold text-red-600">{errorMsg}</p>}
            {submitted && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4 shrink-0" />
                <span>
                  تم إرسال طلب تجهيز كود {brandTitleUpper} {primaryShade.code} لإدارة المتجر وسنتواصل
                  معك فوراً!
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-white whitespace-nowrap transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'جاري الإرسال...'
                    : `طلب خلط كود ${primaryShade.code}`}
                </span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackAnalyticsEvent({
                    eventType: 'whatsapp_click',
                    targetId: `${activeBrand}_color_${primaryShade.code}`,
                    targetLabel: `طلب لون ${brandTitleUpper} ${primaryShade.code}`,
                  })
                }
                className="min-h-[44px] mowan-btn-bevel inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white whitespace-nowrap shrink-0 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>طلب عبر واتساب</span>
              </a>
            </div>
          </form>
        </div>

        {/* LEFT / CATALOG GRID COLUMN (in RTL): Search + Section Tabs + Textured Swatches */}
        <div className="lg:col-span-6 space-y-4">
          <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {isGraffiatoLaser
                    ? 'اختر كود الجرافيـاتو بالليزر ليظهر فوراً على واجهة البيت'
                    : isGraffiatoClassic
                    ? 'اختر كود الجرافيـاتو بدون ليزر ليظهر على واجهة البيت'
                    : isSaveto ||
                      (selectedFamilyId === 'graffiato' && isSipes) ||
                      (selectedFamilyId === 'graviato' && isCmb)
                    ? 'اختر لون وملمس الواجهة ليظهر فوراً على المبنى الخارجي'
                    : 'اختر الدرجة لتظهر فوراً في المعاينة'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono-nums">
                  معروض {displayedColors.length} من أصل {filteredColors.length} لون{' '}
                  {isJotun
                    ? 'في كتالوج جوتن الداخلي'
                    : isSipes
                    ? 'في أقسام دهانات سايبس المعتمدة'
                    : isSaveto
                    ? 'في كتالوج جرافيـاتو سافيتو (خشن · متوسط · ناعم)'
                    : isScib
                    ? 'في كتالوج سكيب الرسمي'
                    : isCmb
                    ? 'في أقسام ومنتجات CMB المعتمدة'
                    : isGraffiatoLaser
                    ? 'في كتالوج الليزر (6 لوحات أصلية · 1002–1220)'
                    : isGraffiatoClassic
                    ? 'في كتالوج بدون ليزر (6 لوحات · جوتاشيلد · مارفكس · جيماتكس · ماربل)'
                    : 'في كارتيلا GLC بلاتين'}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchCode}
                  onChange={(e) =>
                    setSearchByBrand((prev) => ({ ...prev, [activeBrand]: e.target.value }))
                  }
                  placeholder={
                    isJotun
                      ? 'ابحث بالكود أو الاسم (مثلاً 7627)...'
                      : isSipes
                      ? 'ابحث بالكود أو الملمس (مثلاً 684 أو خشن أو ناعم)...'
                      : isSaveto
                      ? 'ابحث بالكود أو الخشونة (خشن، متوسط، ناعم، رملي)...'
                      : isScib
                      ? 'ابحث بكود سكيب أو الاسم (مثلاً 9436 أو 7420)...'
                      : isCmb
                      ? 'ابحث بكود CMB أو المنتج (مثلاً 347 أو CMB 06 أو كيمابوكسي)...'
                      : isGraffiatoLaser
                      ? 'ابحث بكود الليزر (مثلاً 1004 أو 1016 أو 1150)...'
                      : isGraffiatoClassic
                      ? 'ابحث بالكود (مثلاً 6050 أو R50 أو X11 أو 5001)...'
                      : 'ابحث بالكود (مثلاً Y21010)...'
                  }
                  className="w-full min-h-[42px] rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Color Family / Product Specialized Sections Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectFamily('all')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedFamilyId === 'all'
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSipes
                  ? `جميع أقسام سايبس (${allShades.length})`
                  : isCmb
                  ? `كل أقسام CMB (${allShades.length})`
                  : isSaveto
                  ? `كل درجات سافيتو (${allShades.length})`
                  : `جميع الألوان (${allShades.length})`}
              </button>
              {families.map((fam) => {
                const active = selectedFamilyId === fam.id;
                return (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => handleSelectFamily(fam.id)}
                    className={`min-h-[38px] inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-sm border border-black/15 shrink-0"
                      style={{ backgroundColor: fam.swatchHex }}
                    />
                    <span>{fam.nameAr}</span>
                    {(isSipes || isSaveto || isCmb || isScib || isDedicatedGraffiato) && (
                      <span
                        className={`font-mono-nums text-[11px] ${
                          active ? 'text-amber-300' : 'text-slate-500'
                        }`}
                      >
                        ({fam.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dedicated 6-Photo Real Catalog Strip + Controls for Laser Graffiato */}
            {isGraffiatoLaser && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>صور كتالوج الليزر الأصلية (6 لوحات — اضغط للتكبير):</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLaserOnlyFilter(false)}
                      className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        !laserOnlyFilter
                          ? 'bg-slate-900 text-amber-400'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      كل الأكواد (110)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLaserOnlyFilter(true)}
                      className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        laserOnlyFilter
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      شرائح الليزر العريضة فقط (10)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GRAFFIATO_LASER_BOARD_IMAGES.map((board, idx) => (
                    <div
                      key={board.id}
                      className={`rounded-xl border overflow-hidden bg-slate-50 flex flex-col ${
                        selectedFamilyId === board.id
                          ? 'border-blue-600 ring-2 ring-blue-600/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setBoardLightbox({
                            boards: GRAFFIATO_LASER_BOARD_IMAGES,
                            index: idx,
                          })
                        }
                        className="relative aspect-[3/4] w-full overflow-hidden group cursor-pointer"
                        aria-label={`تكبير ${board.titleAr}`}
                      >
                        <img
                          src={board.url}
                          alt={board.titleAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 left-1 w-6 h-6 rounded-md bg-slate-950/75 text-white flex items-center justify-center">
                          <Maximize2 className="w-3 h-3" />
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectFamily(board.id)}
                        className="py-1.5 px-1 text-[10px] font-extrabold text-slate-800 hover:text-blue-700 font-mono-nums truncate cursor-pointer"
                      >
                        {board.codeRange}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dedicated 6-Photo Real Catalog Strip + Controls for Non-Laser Graffiato */}
            {isGraffiatoClassic && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Images className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>صور كتالوج بدون ليزر (6 لوحات — جوتاشيلد · مارفكس · جيماتكس · ماربل):</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: 'الكل (90)' },
                        { id: 'coarse', label: 'خشن (مارفكس / جيماتكس)' },
                        { id: 'medium', label: 'وسط (جوتاشيلد)' },
                        { id: 'fine', label: 'ناعم (ماربل)' },
                      ] as const
                    ).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setClassicGradeFilter(g.id);
                          if (g.id !== 'all') {
                            handleSelectTexture(g.id);
                          }
                        }}
                        className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          classicGradeFilter === g.id
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GRAFFIATO_CLASSIC_BOARD_IMAGES.map((board, idx) => {
                    const targetFam =
                      board.id === 'classic_j1' || board.id === 'classic_j2'
                        ? 'jotashield_tex'
                        : board.id === 'classic_marvex'
                        ? 'marvex'
                        : board.id === 'classic_jematex'
                        ? 'jematex'
                        : 'marble';
                    return (
                      <div
                        key={board.id}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setBoardLightbox({
                              boards: GRAFFIATO_CLASSIC_BOARD_IMAGES,
                              index: idx,
                            })
                          }
                          className="relative aspect-[3/4] w-full overflow-hidden group cursor-pointer"
                          aria-label={`تكبير ${board.titleAr}`}
                        >
                          <img
                            src={board.url}
                            alt={board.titleAr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-1 left-1 w-6 h-6 rounded-md bg-slate-950/75 text-white flex items-center justify-center">
                            <Maximize2 className="w-3 h-3" />
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectFamily(targetFam)}
                          className="py-1.5 px-1 text-[10px] font-extrabold text-slate-800 hover:text-blue-700 font-mono-nums truncate cursor-pointer"
                        >
                          {board.codeRange}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Saveto Graffiato & Colored Renders Grade Filter (Coarse 3-4mm / Medium 2mm / Fine 1-1.5mm) */}
            {isSaveto && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="block text-xs font-bold text-slate-800">
                  اختر درجة خشونة الجرافيـاتو من سافيتو (تطبيق خارجي للواجهات والفلل):
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {SAVETO_GRAFFIATO_GRADES.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        const grade = g.id;
                        setSavetoGradeFilter(grade);
                        if (grade !== 'all') {
                          setWallTexture(grade);
                          setBaseIdByBrand((prev) => ({
                            ...prev,
                            saveto: getSavetoBaseIdForGrade(grade),
                          }));
                        }
                      }}
                      title={g.detailAr}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        savetoGradeFilter === g.id
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {g.nameAr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Graffiato Texture Grade Sub-Filter (Fine FMC / Medium MC / Coarse Grooved) */}
            {isSipes && selectedFamilyId === 'graffiato' && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    درجة خشونة الملمس (حسب الكتالوج الرسمي للواجهات الخارجية):
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'all', label: 'كل الأنواع (40)', count: 40 },
                      { id: 'coarse', label: 'خشن بأخاديد طولية (32)', count: 32 },
                      { id: 'fine', label: 'ناعم محبب FMC (6)', count: 6 },
                      { id: 'medium', label: 'متوسط الخشونة MC (2)', count: 2 },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGraffiatoGradeFilter(g.id)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        graffiatoGradeFilter === g.id
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active SIPES Section Info + Direct PDF Link */}
            {isSipes && (
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {selectedFamilyId === 'all' ? (
                  <span className="text-slate-600">
                    تصفح أقسام سايبس الـ 6: البلاستيك (200) · اللاكيه والإنامل (40) · جرافيـاتو الواجهات (40) · دوكو NC (50) · إيبوكسي (7) · طرق (7)
                  </span>
                ) : (
                  activeSipesSection && (
                    <>
                      <span className="text-slate-700 font-semibold">
                        {activeSipesSection.nameAr} — {activeSipesSection.subtitleAr}
                      </span>
                      <a
                        href={activeSipesSection.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={activeSipesSection.pdfName}
                        className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>فتح كتالوج القسم PDF</span>
                      </a>
                    </>
                  )
                )}
              </div>
            )}

            {/* CMB Kemagraviato & Exterior Textures Grade Filter */}
            {isCmb && selectedFamilyId === 'graviato' && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="block text-xs font-bold text-slate-800">
                  درجة خشونة كيما جرافياتو وتكسيات واجهات CMB (خارجي):
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: 'all', label: 'كل الأنواع (15)' },
                      { id: 'coarse', label: 'خشن جرافياتو / بليكو 900' },
                      { id: 'medium', label: 'متوسط بليكو 800 / داري لايف' },
                      { id: 'fine', label: 'ناعم بليكو 700 / سمنتون / كالزيل' },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setCmbGradeFilter(g.id)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        cmbGradeFilter === g.id
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active CMB Product Section Info + Direct PDF Link */}
            {isCmb && (
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {selectedFamilyId === 'all' ? (
                  <>
                    <span className="text-slate-600">
                      أقسام CMB المعتمدة: مارمكس S40 · ملونات ألواني · كيماتون وزيناتون · كيما جرافياتو · الديكورية · كيمابوكسي · فيرونا للأخشاب
                    </span>
                    <a
                      href={CMB_CATALOGS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>صفحة كتالوجات CMB</span>
                    </a>
                  </>
                ) : (
                  activeCmbSection && (
                    <>
                      <span className="text-slate-700 font-semibold">
                        {activeCmbSection.nameAr} — {activeCmbSection.subtitleAr}
                      </span>
                      <a
                        href={activeCmbSection.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={activeCmbSection.pdfName}
                        className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>تحميل كتالوج {activeCmbSection.shortAr} PDF</span>
                      </a>
                    </>
                  )
                )}
              </div>
            )}
          </section>

          {/* Coded Swatches Grid */}
          {filteredColors.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
              <p className="text-sm font-bold text-slate-800">
                لا توجد ألوان مطابقة للبحث &quot;{searchCode}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchByBrand((prev) => ({ ...prev, [activeBrand]: '' }));
                  setFamilyByBrand((prev) => ({ ...prev, [activeBrand]: 'all' }));
                  setGraffiatoGradeFilter('all');
                  setSavetoGradeFilter('all');
                  setCmbGradeFilter('all');
                }}
                className="min-h-[40px] rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold cursor-pointer"
              >
                عرض جميع ألوان {brandTitleUpper} ({allShades.length})
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 min-[460px]:grid-cols-4 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {displayedColors.map((shade) => {
                  const isPrimary =
                    shade.code === primaryShade.code && shade.familyId === primaryShade.familyId;
                  const isCompare =
                    compareMode &&
                    shade.code === compareShade.code &&
                    shade.familyId === compareShade.familyId;
                  return (
                    <button
                      key={`${activeBrand}-${shade.familyId}-${shade.code}`}
                      type="button"
                      onClick={() => handleSelectSwatch(shade)}
                      className={`group rounded-xl border bg-white p-1.5 text-right transition-all cursor-pointer ${
                        isPrimary
                          ? 'border-blue-600 ring-2 ring-blue-600/25 shadow-sm'
                          : isCompare
                          ? 'border-amber-500 ring-2 ring-amber-400/35 shadow-sm'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                      aria-label={`اختيار لون ${brandTitleUpper} ${shade.code} ${shade.nameAr || ''} لمعاينته`}
                    >
                      <div
                        className="relative h-16 sm:h-20 w-full rounded-lg border border-black/10 overflow-hidden transition-transform duration-150 group-hover:scale-[1.02]"
                        style={{ backgroundColor: shade.hex }}
                      >
                        {shade.textureGrade && (
                          <>
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                backgroundImage:
                                  GRAFFIATO_SWATCH_SVG_PATTERNS[
                                    isDedicatedGraffiato && activeWallTexture !== 'smooth'
                                      ? activeWallTexture
                                      : shade.textureGrade
                                  ],
                              }}
                            />
                            {shade.isLaserWide && (
                              <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-extrabold leading-none pointer-events-none">
                                ليزر
                              </span>
                            )}
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/75 text-white text-[9px] font-bold leading-none pointer-events-none">
                              {isDedicatedGraffiato
                                ? activeWallTexture === 'fine'
                                  ? 'ناعم'
                                  : activeWallTexture === 'medium'
                                  ? 'وسط'
                                  : 'خشن'
                                : shade.textureGrade === 'fine'
                                ? isSaveto
                                  ? 'ناعم 1مم'
                                  : 'ناعم FMC'
                                : shade.textureGrade === 'medium'
                                ? isSaveto
                                  ? 'متوسط 2مم'
                                  : 'متوسط MC'
                                : isSaveto
                                ? 'خشن 3مم'
                                : 'خشن'}
                            </span>
                          </>
                        )}
                        {(isPrimary || isCompare) && (
                          <span
                            className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold shadow-xs z-10 ${
                              isPrimary
                                ? 'bg-blue-600 text-white'
                                : 'bg-amber-400 text-slate-950'
                            }`}
                          >
                            {isCompare && !isPrimary ? '2' : '1'}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 px-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono-nums text-xs sm:text-[13px] font-extrabold text-slate-900 tracking-tight truncate">
                            {shade.code}
                          </span>
                          {shade.pageNumber && (
                            <span className="text-[10px] text-slate-400 font-mono-nums hidden sm:inline shrink-0">
                              ل{shade.pageNumber}
                            </span>
                          )}
                        </div>
                        {(shade.nameAr ||
                          shade.nameEn ||
                          ((isSipes || isCmb || isDedicatedGraffiato) &&
                            selectedFamilyId === 'all')) && (
                          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 truncate">
                            {shade.nameAr
                              ? (isSipes || isCmb) &&
                                selectedFamilyId === 'all' &&
                                shade.sectionShortAr
                                ? `${shade.sectionShortAr} · ${shade.nameAr}`
                                : shade.nameAr
                              : shade.nameEn
                              ? shade.nameEn
                              : shade.sectionShortAr}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {(shouldCapJotun || shouldCapScib) && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      shouldCapScib ? setShowAllScib(true) : setShowAllJotun(true)
                    }
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                  >
                    <span>
                      {shouldCapScib
                        ? `عرض جميع ألوان سكيب (${filteredColors.length} لون معتمد)`
                        : `عرض جميع ألوان جوتن (${filteredColors.length} لون معتمد)`}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Color Accuracy Disclaimer */}
          <p className="text-[11px] text-slate-500 leading-relaxed px-1">
            قد تختلف درجة اللون المعروضة على الشاشة بنسبة طفيفة عن الدهان النهائي بسبب إعدادات
            الإضاءة وسطوع الشاشة؛ يُعتمد كود {brandTitleUpper} الرسمي عند التلوين الفعلي بماكينة
            الكمبيوتر بالمتجر.
          </p>
        </div>
      </div>

      {/* Original Photographed 6-Board Lightbox */}
      {boardLightbox && boardLightbox.boards[boardLightbox.index] && (
        <div
          onClick={() => setBoardLightbox(null)}
          className="fixed inset-0 z-50 bg-slate-950/92 flex flex-col justify-between p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-3 text-white max-w-5xl w-full mx-auto"
          >
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold truncate">
                {boardLightbox.boards[boardLightbox.index].titleAr}
              </h4>
              <p className="text-xs text-slate-300 font-mono-nums">
                لوحة {boardLightbox.index + 1} من {boardLightbox.boards.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBoardLightbox(null)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center max-w-5xl w-full mx-auto my-3 min-h-0"
          >
            <button
              type="button"
              onClick={() =>
                setBoardLightbox((prev) =>
                  prev
                    ? {
                        ...prev,
                        index: (prev.index - 1 + prev.boards.length) % prev.boards.length,
                      }
                    : null
                )
              }
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 cursor-pointer shrink-0"
              aria-label="اللوحة السابقة"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <img
              src={boardLightbox.boards[boardLightbox.index].url}
              alt={boardLightbox.boards[boardLightbox.index].titleAr}
              className="max-h-[75vh] max-w-full object-contain rounded-xl mx-2"
            />

            <button
              type="button"
              onClick={() =>
                setBoardLightbox((prev) =>
                  prev
                    ? {
                        ...prev,
                        index: (prev.index + 1) % prev.boards.length,
                      }
                    : null
                )
              }
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 cursor-pointer shrink-0"
              aria-label="اللوحة التالية"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar max-w-5xl w-full mx-auto"
          >
            {boardLightbox.boards.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBoardLightbox((prev) => (prev ? { ...prev, index: i } : null))}
                className={`w-14 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                  i === boardLightbox.index
                    ? 'border-amber-400 opacity-100'
                    : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={b.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
