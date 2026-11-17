export interface StoreVisibility {
  hero: boolean;
  features: boolean;
  quickFilters: boolean;
  categories: boolean;
  brands: boolean;
  contact: boolean;
  colorStudio: boolean;
}

export interface StoreFeature {
  id: string;
  title: string;
  description: string;
  icon: 'shield' | 'truck' | 'headphones' | 'credit-card' | 'award' | 'palette';
  color: 'blue' | 'amber' | 'emerald' | 'slate';
}

export interface PartnerBrand {
  id: string;
  code: string;
  nameAr: string;
  color: 'navy' | 'blue' | 'red' | 'amber' | 'emerald' | 'slate';
  logoUrl: string;
}

export interface StoreConfig {
  storeName: string;
  headerBrandName: string;
  subtitle: string;
  announcementBar: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  workingHours: string;
  address: string;
  shippingFee: number;
  freeShippingMin: number;
  facebookUrl: string;
  mapsUrl: string;
  sectionsTitleCategories: string;
  sectionsSubtitleCategories: string;
  sectionsTitleProducts: string;
  sectionsTitleBrands: string;
  sectionsSubtitleBrands: string;
  contactBadge: string;
  contactTitle: string;
  contactDescription: string;
  footerBio: string;
  visibility: StoreVisibility;
  features: StoreFeature[];
  brands: PartnerBrand[];
  updatedAt?: unknown;
}

export type BannerActionType = 'none' | 'whatsapp' | 'category' | 'color_studio';

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  actionType: BannerActionType;
  actionTarget: string;
  active: boolean;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Subpage {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  oldPrice: number | null;
  stock: number | null;
  available: boolean;
  unit: string;
  sizes: string;
  specs: string;
  badge: string;
  categoryId: string;
  subpageId: string;
  brandName: string;
  imageUrl: string;
  galleryImages: string[];
  isOffer: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CatalogAttachment {
  id: string;
  type: 'pdf' | 'image';
  url: string;
  name?: string;
}

export interface ColorCatalog {
  id: string;
  title: string;
  brand: string;
  fileType: 'pdf' | 'image';
  fileUrl: string;
  attachments?: CatalogAttachment[];
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type OrderStatus = 'new' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'instapay' | 'vodafone_cash';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type InquiryStatus = 'new' | 'replied' | 'completed';

export interface Inquiry {
  id: string;
  customerName: string;
  phone: string;
  subject: string;
  message: string;
  colorCode: string;
  status: InquiryStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type StorefrontPage = 'home' | 'categories' | 'brands' | 'about' | 'contact';

export type OwnerTab =
  | 'overview'
  | 'orders'
  | 'inquiries'
  | 'products'
  | 'banners'
  | 'categories'
  | 'catalogs'
  | 'brands'
  | 'settings';

export type AnalyticsEventType =
  | 'store_visit'
  | 'page_view'
  | 'category_view'
  | 'product_view'
  | 'cart_add'
  | 'whatsapp_click';

export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  targetId: string;
  targetLabel: string;
  deviceType: 'mobile' | 'desktop';
  createdAt: string;
}
