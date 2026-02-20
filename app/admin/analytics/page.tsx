"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Eye,
  Users,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  BarChart3,
  ArrowUpRight,
  RefreshCcw,
} from "lucide-react";

/* ── Types ── */
interface DailyStat {
  date: string;
  count: number;
}

interface TopPage {
  path: string;
  count: number;
}

interface BrowserStat {
  browser: string;
  count: number;
}

interface OsStat {
  os: string;
  count: number;
}

interface DeviceStat {
  device: string;
  count: number;
}

interface ReferrerStat {
  referrer: string;
  count: number;
}

interface RecentView {
  id: string;
  path: string;
  browser: string;
  os: string;
  device: string;
  referrer: string;
  created_at: string;
}

type TimeRange = "7d" | "30d" | "90d" | "all";

/* ── Helpers ── */
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDeviceIcon(device: string) {
  switch (device) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    default:
      return Monitor;
  }
}

/* ── Aggregate helper (client-side aggregation from raw rows) ── */
function aggregate<T>(
  rows: T[],
  keyFn: (r: T) => string
): { key: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const r of rows) {
    const k = keyFn(r);
    map[k] = (map[k] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [browsers, setBrowsers] = useState<BrowserStat[]>([]);
  const [osList, setOsList] = useState<OsStat[]>([]);
  const [devices, setDevices] = useState<DeviceStat[]>([]);
  const [referrers, setReferrers] = useState<ReferrerStat[]>([]);
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);

  const load = useCallback(async () => {
    setLoading(true);

    const daysMap: Record<TimeRange, number | null> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      all: null,
    };
    const days = daysMap[range];

    // Fetch all page views for the selected range
    let query = supabase
      .from("page_views")
      .select("id, path, referrer, browser, os, device, created_at")
      .order("created_at", { ascending: false });

    if (days) {
      query = query.gte("created_at", daysAgo(days));
    }

    const { data: rows } = await query.limit(10000);
    const views = rows ?? [];

    // Total
    setTotalViews(views.length);

    // Today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    setTodayViews(
      views.filter((v) => new Date(v.created_at) >= todayStart).length
    );

    // Daily stats
    const dailyMap: Record<string, number> = {};
    const numDays = days ?? 365;
    for (let i = 0; i < numDays; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = 0;
    }
    for (const v of views) {
      const key = v.created_at.split("T")[0];
      if (key in dailyMap) dailyMap[key]++;
    }
    setDailyStats(
      Object.entries(dailyMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
    );

    // Top pages
    const pages = aggregate(views, (v) => v.path);
    setTopPages(pages.slice(0, 10).map((p) => ({ path: p.key, count: p.count })));

    // Browsers
    const br = aggregate(views, (v) => v.browser || "Unknown");
    setBrowsers(br.slice(0, 6).map((b) => ({ browser: b.key, count: b.count })));

    // OS
    const os = aggregate(views, (v) => v.os || "Unknown");
    setOsList(os.slice(0, 6).map((o) => ({ os: o.key, count: o.count })));

    // Devices
    const dev = aggregate(views, (v) => v.device || "desktop");
    setDevices(dev.map((d) => ({ device: d.key, count: d.count })));

    // Referrers
    const refs = aggregate(
      views.filter((v) => v.referrer && v.referrer.length > 0),
      (v) => {
        try {
          return new URL(v.referrer).hostname;
        } catch {
          return v.referrer;
        }
      }
    );
    setReferrers(refs.slice(0, 8).map((r) => ({ referrer: r.key, count: r.count })));

    // Recent
    setRecentViews(views.slice(0, 20) as RecentView[]);

    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const maxDaily = Math.max(...dailyStats.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Visitor analytics for your portfolio site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-card rounded-sm overflow-hidden text-xs">
            {(["7d", "30d", "90d", "all"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 transition-colors ${
                  range === r
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-interactive
              >
                {r === "all" ? "All" : r}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            data-interactive
            title="Refresh"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Views"
          value={totalViews}
          icon={Eye}
          loading={loading}
        />
        <StatCard
          label="Today"
          value={todayViews}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          label="Top Pages"
          value={topPages.length}
          icon={BarChart3}
          loading={loading}
        />
        <StatCard
          label="Referrers"
          value={referrers.length}
          icon={Globe}
          loading={loading}
        />
      </div>

      {/* Chart: views over time */}
      <div className="bg-card rounded-sm p-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-muted-foreground" />
          Views Over Time
        </h2>
        {loading ? (
          <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
            Loading…
          </div>
        ) : dailyStats.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
            No data yet
          </div>
        ) : (
          <div className="flex items-end gap-[2px] h-40">
            {dailyStats.map((day) => {
              const height = Math.max((day.count / maxDaily) * 100, 2);
              return (
                <div
                  key={day.date}
                  className="flex-1 group relative"
                  title={`${formatDate(day.date)}: ${day.count} views`}
                >
                  <div
                    className="w-full bg-foreground/20 hover:bg-foreground/40 transition-colors rounded-t-sm"
                    style={{ height: `${height}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-foreground text-background text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                    {formatDate(day.date)}: {day.count}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Pages */}
        <div className="bg-card rounded-sm p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-muted-foreground" />
            Top Pages
          </h2>
          {topPages.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topPages.map((page) => (
                <div key={page.path}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground truncate mr-2">
                      {page.path}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {page.count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/30 rounded-full"
                      style={{
                        width: `${(page.count / (topPages[0]?.count ?? 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referrers */}
        <div className="bg-card rounded-sm p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <ArrowUpRight size={14} className="text-muted-foreground" />
            Top Referrers
          </h2>
          {referrers.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No referrer data yet (direct visits)
            </p>
          ) : (
            <div className="space-y-3">
              {referrers.map((ref) => (
                <div key={ref.referrer}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground truncate mr-2">
                      {ref.referrer}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {ref.count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/30 rounded-full"
                      style={{
                        width: `${(ref.count / (referrers[0]?.count ?? 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Three-column grid: Devices, Browsers, OS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Devices */}
        <div className="bg-card rounded-sm p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Monitor size={14} className="text-muted-foreground" />
            Devices
          </h2>
          {devices.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {devices.map((d) => {
                const DevIcon = getDeviceIcon(d.device);
                const pct =
                  totalViews > 0
                    ? ((d.count / totalViews) * 100).toFixed(1)
                    : "0";
                return (
                  <div
                    key={d.device}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 text-foreground capitalize">
                      <DevIcon size={12} className="text-muted-foreground" />
                      {d.device}
                    </span>
                    <span className="text-muted-foreground">
                      {d.count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browsers */}
        <div className="bg-card rounded-sm p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Globe size={14} className="text-muted-foreground" />
            Browsers
          </h2>
          {browsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {browsers.map((b) => {
                const pct =
                  totalViews > 0
                    ? ((b.count / totalViews) * 100).toFixed(1)
                    : "0";
                return (
                  <div
                    key={b.browser}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-foreground">{b.browser}</span>
                    <span className="text-muted-foreground">
                      {b.count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* OS */}
        <div className="bg-card rounded-sm p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Monitor size={14} className="text-muted-foreground" />
            Operating Systems
          </h2>
          {osList.length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {osList.map((o) => {
                const pct =
                  totalViews > 0
                    ? ((o.count / totalViews) * 100).toFixed(1)
                    : "0";
                return (
                  <div
                    key={o.os}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-foreground">{o.os}</span>
                    <span className="text-muted-foreground">
                      {o.count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Views */}
      <div className="bg-card rounded-sm p-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Clock size={14} className="text-muted-foreground" />
          Recent Views
        </h2>
        {recentViews.length === 0 ? (
          <p className="text-xs text-muted-foreground">No views yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium">Page</th>
                  <th className="text-left py-2 pr-4 font-medium">Browser</th>
                  <th className="text-left py-2 pr-4 font-medium">OS</th>
                  <th className="text-left py-2 pr-4 font-medium">Device</th>
                  <th className="text-left py-2 pr-4 font-medium">Referrer</th>
                  <th className="text-left py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentViews.map((v) => {
                  const DevIcon = getDeviceIcon(v.device);
                  let shortRef = "";
                  if (v.referrer) {
                    try {
                      shortRef = new URL(v.referrer).hostname;
                    } catch {
                      shortRef = v.referrer.slice(0, 30);
                    }
                  }
                  return (
                    <tr
                      key={v.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2 pr-4 text-foreground max-w-[160px] truncate">
                        {v.path}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {v.browser}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {v.os}
                      </td>
                      <td className="py-2 pr-4">
                        <DevIcon
                          size={12}
                          className="text-muted-foreground inline"
                        />
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground max-w-[120px] truncate">
                        {shortRef || "—"}
                      </td>
                      <td className="py-2 text-muted-foreground whitespace-nowrap">
                        {formatTime(v.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Stat Card subcomponent ── */
function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  loading: boolean;
}) {
  return (
    <div className="p-6 bg-card rounded-sm">
      <Icon size={20} className="text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1" />
      ) : (
        <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
      )}
    </div>
  );
}
