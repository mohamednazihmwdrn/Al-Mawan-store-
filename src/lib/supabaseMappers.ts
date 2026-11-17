import { DEFAULT_STORE_CONFIG } from '../data/defaults';
import {
  AnalyticsEvent,
  Banner,
  CatalogAttachment,
  Category,
  ColorCatalog,
  Inquiry,
  Order,
  OrderItem,
  PartnerBrand,
  Product,
  StoreConfig,
  StoreFeature,
  Subpage,
} from '../types/store';

export interface DbRow {
  [key: string]: unknown;
}

export function mapConfigFromDb(row: DbRow): StoreConfig {
  const vis = (row.visibility as Partial<StoreConfig['visibility']>) || {};
  const rawHeaderName = String(row.header_brand_name || '').trim();
  const headerBrandName =
    !rawHeaderName || rawHeaderName === 'الموان للحداد والبويهات'
      ? DEFAULT_STORE_CONFIG.headerBrandName
      : rawHeaderName;
  return {
    ...DEFAULT_STORE_CONFIG,
    storeName: String(row.store_name || DEFAULT_STORE_CONFIG.storeName),
    headerBrandName,
    subtitle: String(row.subtitle ?? DEFAULT_STORE_CONFIG.subtitle),
    announcementBar: String(row.announcement_bar ?? ''),
    phonePrimary: String(row.phone_primary || DEFAULT_STORE_CONFIG.phonePrimary),
    phoneSecondary: String(row.phone_secondary ?? ''),
    whatsappNumber: String(row.whatsapp_number || DEFAULT_STORE_CONFIG.whatsappNumber),
    workingHours: String(row.working_hours ?? DEFAULT_STORE_CONFIG.workingHours),
    address: String(row.address || DEFAULT_STORE_CONFIG.address),
    shippingFee: Number(row.shipping_fee ?? DEFAULT_STORE_CONFIG.shippingFee) || 0,
    freeShippingMin: Number(row.free_shipping_min ?? DEFAULT_STORE_CONFIG.freeShippingMin) || 0,
    facebookUrl: String(row.facebook_url ?? ''),
    mapsUrl: String(row.maps_url ?? ''),
    sectionsTitleCategories: String(
      row.sections_title_categories ?? DEFAULT_STORE_CONFIG.sectionsTitleCategories
    ),
    sectionsSubtitleCategories: String(
      row.sections_subtitle_categories ?? DEFAULT_STORE_CONFIG.sectionsSubtitleCategories
    ),
    sectionsTitleProducts: String(
      row.sections_title_products ?? DEFAULT_STORE_CONFIG.sectionsTitleProducts
    ),
    sectionsTitleBrands: String(row.sections_title_brands ?? DEFAULT_STORE_CONFIG.sectionsTitleBrands),
    sectionsSubtitleBrands: String(
      row.sections_subtitle_brands ?? DEFAULT_STORE_CONFIG.sectionsSubtitleBrands
    ),
    contactBadge: String(row.contact_badge ?? DEFAULT_STORE_CONFIG.contactBadge),
    contactTitle: String(row.contact_title ?? DEFAULT_STORE_CONFIG.contactTitle),
    contactDescription: String(row.contact_description ?? DEFAULT_STORE_CONFIG.contactDescription),
    footerBio: String(row.footer_bio ?? DEFAULT_STORE_CONFIG.footerBio),
    visibility: {
      ...DEFAULT_STORE_CONFIG.visibility,
      ...vis,
    },
    features: Array.isArray(row.features)
      ? (row.features as StoreFeature[])
      : DEFAULT_STORE_CONFIG.features,
    brands: Array.isArray(row.brands) ? (row.brands as PartnerBrand[]) : DEFAULT_STORE_CONFIG.brands,
    updatedAt: row.updated_at,
  };
}

export function mapConfigToDb(cfg: StoreConfig) {
  return {
    id: 'main',
    store_name: cfg.storeName.trim().slice(0, 120) || DEFAULT_STORE_CONFIG.storeName,
    header_brand_name:
      cfg.headerBrandName.trim().slice(0, 80) || DEFAULT_STORE_CONFIG.headerBrandName,
    subtitle: cfg.subtitle.slice(0, 200),
    announcement_bar: cfg.announcementBar.slice(0, 200),
    phone_primary: cfg.phonePrimary.trim().slice(0, 30) || DEFAULT_STORE_CONFIG.phonePrimary,
    phone_secondary: cfg.phoneSecondary.trim().slice(0, 30),
    whatsapp_number: cfg.whatsappNumber.trim().slice(0, 30) || DEFAULT_STORE_CONFIG.whatsappNumber,
    working_hours: cfg.workingHours.slice(0, 120),
    address: cfg.address.trim().slice(0, 240) || DEFAULT_STORE_CONFIG.address,
    shipping_fee: Math.max(0, Math.min(10000, Number(cfg.shippingFee) || 0)),
    free_shipping_min: Math.max(0, Math.min(1000000, Number(cfg.freeShippingMin) || 0)),
    facebook_url: cfg.facebookUrl.slice(0, 300),
    maps_url: cfg.mapsUrl.slice(0, 300),
    sections_title_categories: cfg.sectionsTitleCategories.slice(0, 120),
    sections_subtitle_categories: cfg.sectionsSubtitleCategories.slice(0, 200),
    sections_title_products: cfg.sectionsTitleProducts.slice(0, 120),
    sections_title_brands: cfg.sectionsTitleBrands.slice(0, 120),
    sections_subtitle_brands: cfg.sectionsSubtitleBrands.slice(0, 200),
    contact_badge: cfg.contactBadge.slice(0, 120),
    contact_title: cfg.contactTitle.slice(0, 160),
    contact_description: cfg.contactDescription.slice(0, 500),
    footer_bio: cfg.footerBio.slice(0, 500),
    visibility: {
      hero: Boolean(cfg.visibility.hero),
      features: Boolean(cfg.visibility.features),
      quickFilters: Boolean(cfg.visibility.quickFilters),
      categories: Boolean(cfg.visibility.categories),
      brands: Boolean(cfg.visibility.brands),
      contact: Boolean(cfg.visibility.contact),
      colorStudio: Boolean(cfg.visibility.colorStudio),
    },
    features: cfg.features.slice(0, 12),
    brands: cfg.brands.slice(0, 30),
    updated_at: new Date().toISOString(),
  };
}

export function mapBannerFromDb(row: DbRow): Banner {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    imageUrl: String(row.image_url ?? ''),
    actionType: (row.action_type as Banner['actionType']) || 'none',
    actionTarget: String(row.action_target ?? ''),
    active: Boolean(row.active ?? true),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBannerToDb(b: Omit<Banner, 'createdAt' | 'updatedAt'>) {
  return {
    id: b.id,
    title: b.title.slice(0, 140),
    image_url: b.imageUrl,
    action_type: b.actionType,
    action_target: b.actionTarget.slice(0, 160),
    active: Boolean(b.active),
    sort_order: Number(b.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };
}

export function mapCategoryFromDb(row: DbRow): Category {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    imageUrl: String(row.image_url ?? ''),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCategoryToDb(c: Omit<Category, 'createdAt' | 'updatedAt'>) {
  return {
    id: c.id,
    name: c.name.trim().slice(0, 100),
    description: c.description.slice(0, 240),
    image_url: c.imageUrl,
    sort_order: Number(c.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };
}

export function mapSubpageFromDb(row: DbRow): Subpage {
  return {
    id: String(row.id),
    categoryId: String(row.category_id ?? ''),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    imageUrl: String(row.image_url ?? ''),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSubpageToDb(s: Omit<Subpage, 'createdAt' | 'updatedAt'>) {
  return {
    id: s.id,
    category_id: s.categoryId,
    name: s.name.trim().slice(0, 100),
    description: s.description.slice(0, 240),
    image_url: s.imageUrl,
    updated_at: new Date().toISOString(),
  };
}

export function mapProductFromDb(row: DbRow): Product {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    oldPrice: row.old_price === null || row.old_price === undefined ? null : Number(row.old_price),
    stock: row.stock === null || row.stock === undefined ? null : Number(row.stock),
    available: Boolean(row.available ?? true),
    unit: String(row.unit ?? ''),
    sizes: String(row.sizes ?? ''),
    specs: String(row.specs ?? ''),
    badge: String(row.badge ?? ''),
    categoryId: String(row.category_id ?? ''),
    subpageId: String(row.subpage_id ?? ''),
    brandName: String(row.brand_name ?? ''),
    imageUrl: String(row.image_url ?? ''),
    galleryImages: Array.isArray(row.gallery_images) ? (row.gallery_images as string[]) : [],
    isOffer: Boolean(row.is_offer ?? false),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProductToDb(p: Omit<Product, 'createdAt' | 'updatedAt'>) {
  return {
    id: p.id,
    name: p.name.trim().slice(0, 160),
    description: p.description.trim().slice(0, 2000) || p.name.trim(),
    price: p.price === null || p.price === undefined ? null : Number(p.price),
    old_price: p.oldPrice === null || p.oldPrice === undefined ? null : Number(p.oldPrice),
    stock: p.stock === null || p.stock === undefined ? null : Number(p.stock),
    available: Boolean(p.available),
    unit: p.unit.slice(0, 60),
    sizes: p.sizes.slice(0, 160),
    specs: p.specs.slice(0, 400),
    badge: p.badge.slice(0, 50),
    category_id: p.categoryId,
    subpage_id: p.subpageId.slice(0, 128),
    brand_name: p.brandName.slice(0, 100),
    image_url: p.imageUrl,
    gallery_images: (p.galleryImages || []).slice(0, 10),
    is_offer: Boolean(p.isOffer || (p.oldPrice && p.price && p.oldPrice > p.price)),
    updated_at: new Date().toISOString(),
  };
}

export function mapCatalogFromDb(row: DbRow): ColorCatalog {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    brand: String(row.brand ?? ''),
    fileType: row.file_type === 'pdf' ? 'pdf' : 'image',
    fileUrl: String(row.file_url ?? ''),
    attachments: Array.isArray(row.attachments) ? (row.attachments as CatalogAttachment[]) : [],
    notes: String(row.notes ?? ''),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCatalogToDb(c: Omit<ColorCatalog, 'createdAt' | 'updatedAt'>) {
  const attachments = (c.attachments || []).slice(0, 15);
  return {
    id: c.id,
    title: c.title.trim().slice(0, 140),
    brand: c.brand.slice(0, 80),
    file_type: attachments[0]?.type || c.fileType,
    file_url: attachments[0]?.url || c.fileUrl,
    attachments,
    notes: c.notes.slice(0, 500),
    updated_at: new Date().toISOString(),
  };
}

export function mapOrderFromDb(row: DbRow): Order {
  return {
    id: String(row.id),
    orderNumber: String(row.order_number ?? ''),
    customerName: String(row.customer_name ?? ''),
    phone: String(row.phone ?? ''),
    address: String(row.address ?? ''),
    notes: String(row.notes ?? ''),
    paymentMethod: (row.payment_method as Order['paymentMethod']) || 'cod',
    items: Array.isArray(row.items) ? (row.items as OrderItem[]) : [],
    subtotal: Number(row.subtotal ?? 0),
    shippingFee: Number(row.shipping_fee ?? 0),
    total: Number(row.total ?? 0),
    status: (row.status as Order['status']) || 'new',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapInquiryFromDb(row: DbRow): Inquiry {
  return {
    id: String(row.id),
    customerName: String(row.customer_name ?? ''),
    phone: String(row.phone ?? ''),
    subject: String(row.subject ?? ''),
    message: String(row.message ?? ''),
    colorCode: String(row.color_code ?? ''),
    status: (row.status as Inquiry['status']) || 'new',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAnalyticsFromDb(row: DbRow): AnalyticsEvent {
  return {
    id: String(row.id),
    sessionId: String(row.session_id ?? ''),
    eventType: (row.event_type as AnalyticsEvent['eventType']) || 'store_visit',
    targetId: String(row.target_id ?? ''),
    targetLabel: String(row.target_label ?? ''),
    deviceType: row.device_type === 'mobile' ? 'mobile' : 'desktop',
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}
