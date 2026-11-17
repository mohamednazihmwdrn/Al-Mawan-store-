import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Eye,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Monitor,
  Users,
} from 'lucide-react';
import { summarizeAnalytics } from '../../lib/analytics';
import { AnalyticsEvent } from '../../types/store';

interface OwnerAnalyticsSectionProps {
  events: AnalyticsEvent[];
  onClearAnalytics: () => Promise<void>;
  onNotify?: (msg: string) => void;
}

export const OwnerAnalyticsSection: React.FC<OwnerAnalyticsSectionProps> = ({
  events,
  onClearAnalytics,
  onNotify,
}) => {
  const [daysWindow, setDaysWindow] = useState<1 | 7 | 30>(7);
  const [clearing, setClearing] = useState(false);

  const summary = useMemo(
    () => summarizeAnalytics(events, daysWindow),
    [events, daysWindow]
  );

  const totalDevices = summary.mobileSessions + summary.desktopSessions;
  const mobilePct =
    totalDevices > 0 ? Math.round((summary.mobileSessions / totalDevices) * 100) : 0;
  const desktopPct = totalDevices > 0 ? 100 - mobilePct : 0;

  const maxCatCount = summary.topCategories[0]?.count || 1;
  const maxProdScore = summary.topProducts[0]
    ? summary.topProducts[0].views + summary.topProducts[0].cartAdds
    : 1;
  const maxPageCount = summary.topPages[0]?.count || 1;
  const maxDailyCount = Math.max(1, ...summary.dailyVisits.map((d) => d.count));

  const addToCartRate =
    summary.productViews > 0
      ? Math.round((summary.cartAdds / summary.productViews) * 100)
      : 0;

  const handleReset = async () => {
    setClearing(true);
    try {
      await onClearAnalytics();
      onNotify?.('تم تصفير سجل التحليلات بنجاح.');
    } catch (err) {
      onNotify?.(err instanceof Error ? err.message : 'تعذر تصفير التحليلات');
    } finally {
      setClearing(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-6">
      {/* Header + Privacy Notice + Time Range Segmented Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900">
            <BarChart3 className="w-5 h-5 text-blue-700 shrink-0" />
            <h3 className="text-base sm:text-lg font-extrabold">
              تحليلات الزوار وتفضيلات المتجر
            </h3>
          </div>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              إحصائيات خفيفة تحترم الخصوصية: بدون ملفات تعريف ارتباط (Cookies) أو تتبع IP أو بيانات شخصية، وتحترم خيار عدم التتبع (Do Not Track).
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label="الفترة الزمنية"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl"
          >
            {(
              [
                [1, 'اليوم'],
                [7, 'آخر 7 أيام'],
                [30, 'آخر 30 يوماً'],
              ] as const
            ).map(([days, label]) => (
              <button
                key={days}
                type="button"
                onClick={() => setDaysWindow(days)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  daysWindow === days
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {events.length > 0 && (
            <button
              type="button"
              disabled={clearing}
              onClick={handleReset}
              className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{clearing ? 'جاري المسح...' : 'تصفير السجل'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Clean Visitor & Engagement KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>الزيارات الفريدة</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-mono-nums text-2xl font-extrabold text-slate-900">
            {summary.uniqueVisitors}
          </p>
          <p className="text-[11px] text-slate-500 font-mono-nums">
            اليوم فقط: {summary.todayVisitors} زيارة
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>معاينات المنتجات</span>
            <Eye className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="font-mono-nums text-2xl font-extrabold text-slate-900">
            {summary.productViews}
          </p>
          <p className="text-[11px] text-slate-500">فتح تفاصيل الأصناف</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>الإضافات للسلة</span>
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-mono-nums text-2xl font-extrabold text-slate-900">
            {summary.cartAdds}
          </p>
          <p className="text-[11px] text-slate-500 font-mono-nums">
            معدل التفاعل: {addToCartRate}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>نقرات واتساب</span>
            <MessageCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-mono-nums text-2xl font-extrabold text-slate-900">
            {summary.whatsappClicks}
          </p>
          <p className="text-[11px] text-slate-500">استفسار أو طلب مباشر</p>
        </div>
      </div>

      {/* Preferences & Traffic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Column 1: Top Products & Top Categories */}
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>المنتجات الأكثر اهتماماً</span>
              <span className="text-slate-400 font-normal">المشاهدات / الإضافة للسلة</span>
            </div>
            {summary.topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 border-y border-slate-100">
                لم تُسجل مشاهدات أو إضافات منتجات في هذه الفترة بعد.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border-y border-slate-100">
                {summary.topProducts.map((item) => {
                  const score = item.views + item.cartAdds;
                  const widthPct = Math.max(8, Math.round((score / maxProdScore) * 100));
                  return (
                    <div key={item.id} className="py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-slate-800 truncate">{item.label}</span>
                        <span className="font-mono-nums text-slate-600 shrink-0">
                          {item.views} مشاهدة · {item.cartAdds} سلة
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>الأقسام المفضلة للزوار</span>
              <span className="text-slate-400 font-normal">عدد مرات التصفح</span>
            </div>
            {summary.topCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 border-y border-slate-100">
                ستظهر هنا أكثر الأقسام التي يتصفحها العملاء تلقائياً.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border-y border-slate-100">
                {summary.topCategories.map((cat) => {
                  const widthPct = Math.max(8, Math.round((cat.count / maxCatCount) * 100));
                  return (
                    <div key={cat.id} className="py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-slate-800 truncate">{cat.label}</span>
                        <span className="font-mono-nums text-slate-600 shrink-0">
                          {cat.count} زيارة
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Daily Trend (7 Days) + Devices + Top Pages */}
        <div className="space-y-5">
          {/* 7-Day Daily Visits Bar Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>حركة الزيارات خلال آخر 7 أيام</span>
              <span className="text-slate-400 font-normal">زيارات فريدة يومياً</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 pt-5 pb-3">
              <div className="grid grid-cols-7 gap-2 items-end h-28">
                {summary.dailyVisits.map((day) => {
                  const barHeight =
                    day.count > 0 ? Math.max(14, Math.round((day.count / maxDailyCount) * 100)) : 6;
                  return (
                    <div
                      key={day.dateKey}
                      className="flex flex-col items-center justify-end h-full gap-1.5"
                    >
                      <span className="font-mono-nums text-[10px] font-bold text-slate-600">
                        {day.count}
                      </span>
                      <div className="w-full max-w-[28px] flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            day.count > 0 ? 'bg-slate-900' : 'bg-slate-200'
                          }`}
                          style={{ height: `${barHeight}%` }}
                          title={`${day.label}: ${day.count}`}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>أجهزة الزوار</span>
              <span className="text-slate-400 font-normal font-mono-nums">
                {totalDevices} جلسة
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>الهاتف</span>
                </div>
                <span className="font-mono-nums text-sm font-extrabold text-slate-900">
                  {mobilePct}%
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Monitor className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>الكمبيوتر</span>
                </div>
                <span className="font-mono-nums text-sm font-extrabold text-slate-900">
                  {desktopPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Top Visited Sections */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>الصفحات والأدوات الأكثر زيارة</span>
              <span className="text-slate-400 font-normal">مشاهدات الصفحات</span>
            </div>
            {summary.topPages.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 border-y border-slate-100">
                لا توجد بيانات صفحات مسجلة بعد.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border-y border-slate-100">
                {summary.topPages.map((pg) => {
                  const widthPct = Math.max(8, Math.round((pg.count / maxPageCount) * 100));
                  return (
                    <div key={pg.id} className="py-2 flex items-center gap-3 text-xs">
                      <span className="font-bold text-slate-800 w-36 truncate shrink-0">
                        {pg.label}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="font-mono-nums text-slate-600 w-10 text-left shrink-0">
                        {pg.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
