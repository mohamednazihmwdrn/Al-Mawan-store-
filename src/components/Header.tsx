import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  ChevronLeft,
  Home,
  Info,
  Layers,
  Mail,
  Menu,
  Palette,
  Phone,
  ShoppingCart,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { StorefrontPage } from '../types/store';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activePage: StorefrontPage;
  onSelectPage: (page: StorefrontPage) => void;
  onOpenCart: () => void;
  onOpenColorStudio: () => void;
  onTriggerOwnerAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onSelectPage,
  onOpenCart,
  onOpenColorStudio,
  onTriggerOwnerAuth,
}) => {
  const { config, cart, categories, products } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tapCountRef = useRef(0);
  const lastTapTimerRef = useRef<number | null>(null);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleBrandTap = () => {
    tapCountRef.current += 1;
    if (lastTapTimerRef.current) {
      window.clearTimeout(lastTapTimerRef.current);
    }
    if (tapCountRef.current >= 10) {
      tapCountRef.current = 0;
      onTriggerOwnerAuth();
      return;
    }
    lastTapTimerRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
    }, 3500);
  };

  const handleSelectPage = (page: StorefrontPage) => {
    setSidebarOpen(false);
    onSelectPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarPages: {
    id: StorefrontPage;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    visible: boolean;
  }[] = [
    {
      id: 'home',
      label: 'الرئيسية والمنتجات',
      subtitle: `عرض البنرات وجميع المنتجات (${products.length})`,
      icon: <Home className="w-5 h-5 shrink-0" />,
      visible: true,
    },
    {
      id: 'categories',
      label: 'الأقسام والبحث والعروض',
      subtitle: `تصفح ${categories.length} قسم رئيسي وفرعي وبحث سريع`,
      icon: <Layers className="w-5 h-5 shrink-0" />,
      visible: true,
    },
    {
      id: 'glc_colors',
      label: 'كمبيوتر الألوان والديكور',
      subtitle: 'GLC · جوتن · سايبس · سكيب · CMB · جرافيـاتو · فيوتك NEWTEC · بانوهات PS',
      icon: <Palette className="w-5 h-5 shrink-0" />,
      visible: config.visibility.colorStudio,
    },
    {
      id: 'brands',
      label: 'العلامات التجارية والشركاء',
      subtitle: `${config.brands.length} علامة وتوكيل معتمد`,
      icon: <Award className="w-5 h-5 shrink-0" />,
      visible: config.visibility.brands && config.brands.length > 0,
    },
    {
      id: 'about',
      label: 'عن المتجر والمميزات',
      subtitle: 'العنوان ومواعيد العمل والمميزات وتثبيت التطبيق',
      icon: <Info className="w-5 h-5 shrink-0" />,
      visible: true,
    },
    {
      id: 'contact',
      label: 'تواصل معنا والاستفسارات',
      subtitle: 'الواتساب والخريطة ونموذج الاستفسار المباشر',
      icon: <Mail className="w-5 h-5 shrink-0" />,
      visible: config.visibility.contact,
    },
  ];

  const desktopNavItems: { label: string; page: StorefrontPage; visible: boolean }[] = [
    { label: 'المنتجات', page: 'home', visible: true },
    { label: 'الأقسام والبحث', page: 'categories', visible: true },
    { label: 'كمبيوتر الألوان', page: 'glc_colors', visible: config.visibility.colorStudio },
    { label: 'العلامات التجارية', page: 'brands', visible: config.visibility.brands && config.brands.length > 0 },
    { label: 'تواصل معنا', page: 'contact', visible: config.visibility.contact },
  ];

  return (
    <>
      <header className="relative md:sticky md:top-0 z-40 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 min-h-[56px] sm:h-16 py-1.5 sm:py-0 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Brand Emblem + Wordmark (10 consecutive taps opens Owner Auth) */}
          <button
            type="button"
            onClick={handleBrandTap}
            className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center gap-2 sm:gap-2.5 text-[11.5px] min-[380px]:text-xs sm:text-base lg:text-lg leading-snug font-extrabold tracking-tight text-amber-400 hover:text-amber-300 transition-colors min-w-0 select-none cursor-pointer text-right"
          >
            <img
              src="/pwa-192x192.png"
              alt={config.storeName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-amber-400/60 shrink-0"
            />
            <span className="whitespace-normal sm:whitespace-nowrap">{config.headerBrandName}</span>
          </button>

          {/* Zone 2: Clean single-line navigation links on desktop */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-200">
            {desktopNavItems
              .filter((item) => item.visible)
              .map((item) => {
                const isActive = activePage === item.page;
                return (
                  <button
                    key={item.page}
                    type="button"
                    onClick={() => handleSelectPage(item.page)}
                    className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                      isActive
                        ? 'text-amber-400 font-bold'
                        : 'text-slate-200 hover:text-amber-400'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
          </nav>

          {/* Zone 3: Cart & Sidebar Menu Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative min-h-[44px] inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="سلة المشتريات"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">السلة</span>
              <span className="font-mono-nums text-amber-300 font-bold">({totalItems})</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 sm:px-3 text-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              aria-label="فتح القائمة الجانبية"
            >
              <Menu className="w-5 h-5 text-amber-400" />
              <span className="hidden sm:inline text-xs font-bold">القائمة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Organized Slide-Out Sidebar Drawer (RTL right-edge drawer across all screen sizes) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex justify-start bg-slate-950/65 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 36 }}
              className="w-[86vw] max-w-sm bg-slate-900 text-white h-full flex flex-col shadow-2xl border-l border-slate-800"
              onClick={(e) => e.stopPropagation()}
              aria-label="القائمة الجانبية للمتجر"
            >
              {/* Sidebar Header */}
              <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/pwa-192x192.png"
                    alt={config.storeName}
                    className="w-10 h-10 rounded-full object-cover border border-amber-400/70 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-amber-400 leading-snug">
                      {config.headerBrandName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      أقسام وصفحات المتجر
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  aria-label="إغلاق القائمة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Organized Dedicated Pages List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
                <div className="space-y-1.5">
                  <p className="px-2 text-[11px] font-bold text-slate-400">
                    صفحات المتجر الرئيسية
                  </p>
                  {sidebarPages
                    .filter((item) => item.visible)
                    .map((item) => {
                      const active = activePage === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectPage(item.id)}
                          className={`w-full min-h-[56px] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 text-right transition-colors cursor-pointer ${
                            active
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={active ? 'text-slate-950' : 'text-amber-400'}>
                              {item.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-extrabold truncate">
                                {item.label}
                              </div>
                              <div
                                className={`text-[11px] truncate ${
                                  active ? 'text-slate-800 font-medium' : 'text-slate-400'
                                }`}
                              >
                                {item.subtitle}
                              </div>
                            </div>
                          </div>
                          <ChevronLeft
                            className={`w-4 h-4 shrink-0 ${
                              active ? 'text-slate-950' : 'text-slate-500'
                            }`}
                          />
                        </button>
                      );
                    })}
                </div>

                {/* Interactive Tools */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800">
                  <p className="px-2 text-[11px] font-bold text-slate-400">
                    أدوات التسوق السريعة
                  </p>
                  {config.visibility.colorStudio && (
                    <button
                      type="button"
                      onClick={() => {
                        setSidebarOpen(false);
                        onOpenColorStudio();
                      }}
                      className="w-full min-h-[52px] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 bg-slate-800/60 hover:bg-slate-800 text-slate-100 text-right transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Palette className="w-5 h-5 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold truncate">استوديو كمبيوتر الألوان</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            خلط وتجهيز أكواد الألوان والكتالوجات
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-500 shrink-0" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSidebarOpen(false);
                      onOpenCart();
                    }}
                    className="w-full min-h-[52px] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 bg-slate-800/60 hover:bg-slate-800 text-slate-100 text-right transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ShoppingCart className="w-5 h-5 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">سلة المشتريات</div>
                        <div className="text-[11px] text-slate-400 font-mono-nums truncate">
                          {totalItems} قطعة مضافة للسلة
                        </div>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 pb-safe border-t border-slate-800 bg-slate-950/70 space-y-3 shrink-0">
                <div className="flex justify-center">
                  <PWAInstallButton />
                </div>
                <a
                  href={`tel:${config.phonePrimary}`}
                  className="flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-amber-400 font-mono-nums py-1"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>خدمة العملاء: {config.phonePrimary}</span>
                </a>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
