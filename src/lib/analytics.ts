import { AnalyticsEvent, AnalyticsEventType } from '../types/store';
import { sanitizeId } from './imageUtils';
import { isSupabaseConfigured, supabase } from './supabase';

export const ANALYTICS_STORAGE_KEY = 'mowan_analytics_v1';
export const ANALYTICS_UPDATED_EVENT = 'mowan_analytics_updated';
const SESSION_TOKEN_KEY = 'mowan_visit_sid';
const MAX_LOCAL_EVENTS = 500;

const recentDedupeMap = new Map<string, number>();

export function isDoNotTrackEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const dnt =
    navigator.doNotTrack ||
    (window as unknown as { doNotTrack?: string }).doNotTrack ||
    (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

function getEphemeralSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (existing) return existing;
    const generated = sanitizeId(
      `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    );
    sessionStorage.setItem(SESSION_TOKEN_KEY, generated);
    return generated;
  } catch {
    return sanitizeId(`s_${Date.now().toString(36)}`);
  }
}

function detectDeviceType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

export function loadLocalAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is AnalyticsEvent =>
        Boolean(item && typeof item.id === 'string' && typeof item.eventType === 'string')
    );
  } catch {
    return [];
  }
}

export function clearLocalAnalyticsEvents(): void {
  try {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(ANALYTICS_UPDATED_EVENT));
  } catch {
    // Ignore storage errors
  }
}

function persistLocalEvent(evt: AnalyticsEvent): void {
  try {
    const prev = loadLocalAnalyticsEvents();
    const next = [evt, ...prev].slice(0, MAX_LOCAL_EVENTS);
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(ANALYTICS_UPDATED_EVENT));
  } catch {
    // Ignore localStorage quota issues
  }
}

export function trackAnalyticsEvent(payload: {
  eventType: AnalyticsEventType;
  targetId?: string;
  targetLabel?: string;
}): void {
  if (typeof window === 'undefined' || isDoNotTrackEnabled()) return;

  const targetId = sanitizeId(payload.targetId || 'store').slice(0, 80);
  const targetLabel = (payload.targetLabel || '').trim().slice(0, 120);
  const sessionId = getEphemeralSessionId();

  // Deduplicate store visits strictly once per browser tab session
  if (payload.eventType === 'store_visit') {
    const visitKey = `mowan_visited_${sessionId}`;
    try {
      if (sessionStorage.getItem(visitKey) === '1') return;
      sessionStorage.setItem(visitKey, '1');
    } catch {
      // Continue cleanly
    }
  } else {
    // Deduplicate rapid repeated clicks on the same item within 10s
    const key = `${payload.eventType}:${targetId}`;
    const now = Date.now();
    const lastTs = recentDedupeMap.get(key) || 0;
    if (now - lastTs < 10_000) return;
    recentDedupeMap.set(key, now);
  }

  const event: AnalyticsEvent = {
    id: sanitizeId(`ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`),
    sessionId,
    eventType: payload.eventType,
    targetId,
    targetLabel,
    deviceType: detectDeviceType(),
    createdAt: new Date().toISOString(),
  };

  if (!supabase || !isSupabaseConfigured) {
    persistLocalEvent(event);
    return;
  }

  // Fire-and-forget lightweight insert to Supabase (never blocks UI)
  void supabase
    .from('store_analytics')
    .insert({
      id: event.id,
      session_id: event.sessionId,
      event_type: event.eventType,
      target_id: event.targetId,
      target_label: event.targetLabel,
      device_type: event.deviceType,
      created_at: event.createdAt,
    })
    .then(({ error }) => {
      if (error && import.meta.env.DEV) {
        console.warn('Analytics insert skipped:', error.message);
      }
    });
}

export interface AnalyticsSummary {
  uniqueVisitors: number;
  todayVisitors: number;
  productViews: number;
  cartAdds: number;
  whatsappClicks: number;
  mobileSessions: number;
  desktopSessions: number;
  topCategories: { id: string; label: string; count: number }[];
  topProducts: { id: string; label: string; views: number; cartAdds: number }[];
  topPages: { id: string; label: string; count: number }[];
  dailyVisits: { dateKey: string; label: string; count: number }[];
}

const ARABIC_SHORT_WEEKDAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export function summarizeAnalytics(
  events: AnalyticsEvent[],
  daysWindow: 1 | 7 | 30
): AnalyticsSummary {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  if (daysWindow > 1) {
    cutoff.setDate(cutoff.getDate() - (daysWindow - 1));
  }
  const cutoffMs = cutoff.getTime();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  const filtered = events.filter((e) => {
    const t = Date.parse(e.createdAt);
    return Number.isFinite(t) && t >= cutoffMs;
  });

  const sessionDevices = new Map<string, 'mobile' | 'desktop'>();
  const todaySessions = new Set<string>();
  const categoryMap = new Map<string, { id: string; label: string; count: number }>();
  const productMap = new Map<
    string,
    { id: string; label: string; views: number; cartAdds: number }
  >();
  const pageMap = new Map<string, { id: string; label: string; count: number }>();

  let productViews = 0;
  let cartAdds = 0;
  let whatsappClicks = 0;

  for (const evt of filtered) {
    if (!sessionDevices.has(evt.sessionId)) {
      sessionDevices.set(evt.sessionId, evt.deviceType === 'mobile' ? 'mobile' : 'desktop');
    }

    const t = Date.parse(evt.createdAt);
    if (Number.isFinite(t) && t >= todayMs) {
      todaySessions.add(evt.sessionId);
    }

    if (evt.eventType === 'product_view') {
      productViews += 1;
      const key = evt.targetId || evt.targetLabel;
      if (key) {
        const prev = productMap.get(key) || {
          id: key,
          label: evt.targetLabel || key,
          views: 0,
          cartAdds: 0,
        };
        prev.views += 1;
        if (evt.targetLabel) prev.label = evt.targetLabel;
        productMap.set(key, prev);
      }
    } else if (evt.eventType === 'cart_add') {
      cartAdds += 1;
      const key = evt.targetId || evt.targetLabel;
      if (key) {
        const prev = productMap.get(key) || {
          id: key,
          label: evt.targetLabel || key,
          views: 0,
          cartAdds: 0,
        };
        prev.cartAdds += 1;
        if (evt.targetLabel) prev.label = evt.targetLabel;
        productMap.set(key, prev);
      }
    } else if (evt.eventType === 'whatsapp_click') {
      whatsappClicks += 1;
    } else if (evt.eventType === 'category_view') {
      const key = evt.targetId || evt.targetLabel;
      if (key) {
        const prev = categoryMap.get(key) || {
          id: key,
          label: evt.targetLabel || key,
          count: 0,
        };
        prev.count += 1;
        if (evt.targetLabel) prev.label = evt.targetLabel;
        categoryMap.set(key, prev);
      }
    } else if (evt.eventType === 'page_view') {
      const key = evt.targetId || evt.targetLabel;
      if (key) {
        const prev = pageMap.get(key) || {
          id: key,
          label: evt.targetLabel || key,
          count: 0,
        };
        prev.count += 1;
        if (evt.targetLabel) prev.label = evt.targetLabel;
        pageMap.set(key, prev);
      }
    }
  }

  let mobileSessions = 0;
  let desktopSessions = 0;
  for (const dev of sessionDevices.values()) {
    if (dev === 'mobile') mobileSessions += 1;
    else desktopSessions += 1;
  }

  // Last 7 days daily unique visitor sessions
  const dailyBuckets = new Map<string, { dateKey: string; label: string; sessions: Set<string> }>();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - offset);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const label = offset === 0 ? 'اليوم' : ARABIC_SHORT_WEEKDAYS[d.getDay()];
    dailyBuckets.set(dateKey, { dateKey, label, sessions: new Set() });
  }

  for (const evt of events) {
    const d = new Date(evt.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const bucket = dailyBuckets.get(dateKey);
    if (bucket) {
      bucket.sessions.add(evt.sessionId);
    }
  }

  return {
    uniqueVisitors: sessionDevices.size,
    todayVisitors: todaySessions.size,
    productViews,
    cartAdds,
    whatsappClicks,
    mobileSessions,
    desktopSessions,
    topCategories: Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topProducts: Array.from(productMap.values())
      .sort((a, b) => b.views + b.cartAdds * 2 - (a.views + a.cartAdds * 2))
      .slice(0, 5),
    topPages: Array.from(pageMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    dailyVisits: Array.from(dailyBuckets.values()).map((b) => ({
      dateKey: b.dateKey,
      label: b.label,
      count: b.sessions.size,
    })),
  };
}
