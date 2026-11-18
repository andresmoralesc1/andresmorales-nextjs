'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import {
  BarChart3,
  Eye,
  Users,
  Clock,
  ArrowUpRight,
  Globe,
  Smartphone,
  Laptop,
  Compass,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Activity,
  Layers,
  Monitor,
  Share2,
} from 'lucide-react';

interface AnalyticsData {
  success: boolean;
  sites: Array<{ id: string; name: string; domain: string; shareId: string }>;
  selectedSiteId: string;
  range: string;
  stats: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
    comparison?: {
      pageviews: number;
      visitors: number;
      visits: number;
      bounces: number;
      totaltime: number;
    };
  } | null;
  active: number;
  pageviewsSeries: Array<{ x: string; y: number }>;
  sessionsSeries: Array<{ x: string; y: number }>;
  paths: Array<{ x: string; y: number }>;
  countries: Array<{ x: string; y: number }>;
  devices: Array<{ x: string; y: number }>;
  browsers: Array<{ x: string; y: number }>;
  os: Array<{ x: string; y: number }>;
  referrers: Array<{ x: string; y: number }>;
}

const COUNTRY_FLAGS: Record<string, string> = {
  CO: '🇨🇴',
  US: '🇺🇸',
  ES: '🇪🇸',
  MX: '🇲🇽',
  BR: '🇧🇷',
  AR: '🇦🇷',
  CL: '🇨🇱',
  PE: '🇵🇪',
  DE: '🇩🇪',
  FR: '🇫🇷',
  GB: '🇬🇧',
  CA: '🇨🇦',
};

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function AnalyticsDashboardClient({
  username,
  locale,
}: {
  username: string;
  locale: string;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState('9865d96c-00dc-4cd5-b7e8-a2d85ca7b932');
  const [range, setRange] = useState('30d');
  const [viewMode, setViewMode] = useState<'native' | 'embed'>('native');

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?siteId=${selectedSiteId}&range=${range}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSiteId, range]);

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh active users count every 30 seconds
    const interval = setInterval(() => {
      fetch(`/api/admin/analytics?siteId=${selectedSiteId}&range=${range}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            setData((prev) => (prev ? { ...prev, active: json.active } : json));
          }
        })
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMetrics, selectedSiteId, range]);

  const currentSite = data?.sites.find((s) => s.id === selectedSiteId) || {
    id: selectedSiteId,
    name: 'Andrés Morales',
    domain: 'andresmorales.com.co',
    shareId: 'andresmorales',
  };

  const totalPageviews = data?.stats?.pageviews ?? 0;
  const totalVisitors = data?.stats?.visitors ?? 0;
  const totalVisits = data?.stats?.visits ?? 0;
  const bounces = data?.stats?.bounces ?? 0;
  const bounceRate = totalVisits > 0 ? Math.round((bounces / totalVisits) * 100) : 0;
  const avgTime = totalVisits > 0 ? Math.round((data?.stats?.totaltime ?? 0) / totalVisits) : 0;

  // Max value for path bars
  const maxPathViews = Math.max(...(data?.paths.map((p) => p.y) || [1]), 1);

  return (
    <AdminShell
      username={username}
      locale={locale}
      title="Métricas Web & Analíticas Umami"
      subtitle="Datos en tiempo real, 100% privados y auto-hospedados sin cookies invasivas"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMetrics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#f96e03] text-xs font-semibold text-[#1E1810] transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Actualizar métricas"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#f96e03] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <a
            href="https://umami.andresmorales.com.co"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E1810] hover:bg-[#f96e03] text-white hover:text-[#1E1810] text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <span>Consola Umami</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls Bar: Site Switcher & Range Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#1E1810]/10 rounded-2xl p-3 shadow-sm">
          {/* Site Selector Tabs */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedSiteId('9865d96c-00dc-4cd5-b7e8-a2d85ca7b932')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSiteId === '9865d96c-00dc-4cd5-b7e8-a2d85ca7b932'
                  ? 'bg-[#1E1810] text-white shadow-sm'
                  : 'text-[#575250] hover:text-[#1E1810] hover:bg-stone-100'
              }`}
            >
              🌐 andresmorales.com.co
            </button>

            <button
              type="button"
              onClick={() => setSelectedSiteId('5c873d7b-161e-437f-9532-25b0913f85f2')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSiteId === '5c873d7b-161e-437f-9532-25b0913f85f2'
                  ? 'bg-[#1E1810] text-white shadow-sm'
                  : 'text-[#575250] hover:text-[#1E1810] hover:bg-stone-100'
              }`}
            >
              🎨 amart.andresmorales.com.co
            </button>
          </div>

          {/* Time Range Selector & Mode Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs">
              {[
                { id: '24h', label: '24h' },
                { id: '7d', label: '7 días' },
                { id: '30d', label: '30 días' },
                { id: '90d', label: '90 días' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setRange(p.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    range === p.id
                      ? 'bg-white text-[#1E1810] font-bold shadow-sm'
                      : 'text-stone-500 hover:text-[#1E1810]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('native')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'native'
                    ? 'bg-white text-[#1E1810] font-bold shadow-sm'
                    : 'text-stone-500 hover:text-[#1E1810]'
                }`}
              >
                Panel
              </button>
              <button
                type="button"
                onClick={() => setViewMode('embed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'embed'
                    ? 'bg-white text-[#1E1810] font-bold shadow-sm'
                    : 'text-stone-500 hover:text-[#1E1810]'
                }`}
              >
                Consola
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'embed' ? (
          /* ======================================================== */
          /* EMBEDDED UMAMI DASHBOARD VIEW                            */
          /* ======================================================== */
          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm min-h-[750px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <span className="text-xs font-mono text-[#575250]">
                Mostrando consola en vivo de <strong>{currentSite.domain}</strong>
              </span>
              <a
                href={`https://umami.andresmorales.com.co/share/${currentSite.shareId}/${currentSite.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#f96e03] hover:underline font-bold flex items-center gap-1"
              >
                <span>Abrir en ventana completa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <iframe
              src={`https://umami.andresmorales.com.co/share/${currentSite.shareId}/${currentSite.domain}`}
              className="w-full h-[700px] border-0 rounded-xl"
              title="Umami Analytics Console"
            />
          </div>
        ) : (
          /* ======================================================== */
          /* NATIVE EXECUTIVE ANALYTICS DASHBOARD                     */
          /* ======================================================== */
          <div className="space-y-6">
            {/* Live Indicator Banner */}
            <div className="flex items-center justify-between bg-white border border-[#1E1810]/10 rounded-2xl px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#1E1810]">
                  Visitantes en vivo ahora:
                </p>
                <span className="text-sm font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {data?.active ?? 0} online
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#575250]">
                <span>Dominio: <strong>{currentSite.domain}</strong></span>
              </div>
            </div>

            {/* 6 Key Performance Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#575250] flex items-center gap-1.5 font-bold">
                  <Eye className="w-3.5 h-3.5 text-[#f96e03]" />
                  Vistas Totales
                </p>
                <p className="text-2xl font-serif font-bold text-[#1E1810] mt-1.5">
                  {totalPageviews}
                </p>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">Páginas leídas</p>
              </div>

              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#575250] flex items-center gap-1.5 font-bold">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Visitantes
                </p>
                <p className="text-2xl font-serif font-bold text-blue-600 mt-1.5">
                  {totalVisitors}
                </p>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">Usuarios únicos</p>
              </div>

              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#575250] flex items-center gap-1.5 font-bold">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  Sesiones
                </p>
                <p className="text-2xl font-serif font-bold text-purple-600 mt-1.5">
                  {totalVisits}
                </p>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">Visitas completas</p>
              </div>

              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#575250] flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  Rebote
                </p>
                <p className="text-2xl font-serif font-bold text-amber-600 mt-1.5">
                  {bounceRate}%
                </p>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">Tasa de rebote</p>
              </div>

              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#575250] flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Permanencia
                </p>
                <p className="text-2xl font-serif font-bold text-emerald-600 mt-1.5">
                  {formatDuration(avgTime)}
                </p>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">Tiempo promedio</p>
              </div>

              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#575250] flex items-center gap-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5 text-cyan-600" />
                  Países
                </p>
                <p className="text-2xl font-serif font-bold text-cyan-600 mt-1.5">
                  {data?.countries.length ?? 0}
                </p>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5">Ubicaciones</p>
              </div>
            </div>

            {/* Visual Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages (URLs) */}
              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                  <h3 className="text-sm font-serif font-bold text-[#1E1810] flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#f96e03]" />
                    Páginas Más Visitadas
                  </h3>
                  <span className="text-[10px] font-mono text-stone-400">Vistas</span>
                </div>

                <div className="space-y-3">
                  {data?.paths && data.paths.length > 0 ? (
                    data.paths.map((p) => {
                      const pct = Math.round((p.y / maxPathViews) * 100);
                      return (
                        <div key={p.x} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-[#1E1810] font-bold truncate max-w-[260px] sm:max-w-xs">
                              {p.x === '/' ? '/ (Página Principal)' : p.x}
                            </span>
                            <span className="text-[#f96e03] font-bold">{p.y}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className="h-full bg-[#f96e03] rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-stone-400 font-mono">
                      Aún no hay visitas registradas para este rango.
                    </div>
                  )}
                </div>
              </div>

              {/* Geographic Countries */}
              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                  <h3 className="text-sm font-serif font-bold text-[#1E1810] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-600" />
                    Países de Origen
                  </h3>
                  <span className="text-[10px] font-mono text-stone-400">Visitantes</span>
                </div>

                <div className="space-y-2.5">
                  {data?.countries && data.countries.length > 0 ? (
                    data.countries.map((c) => {
                      const flag = COUNTRY_FLAGS[c.x] || '🌐';
                      return (
                        <div
                          key={c.x}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{flag}</span>
                            <span className="font-bold text-[#1E1810] font-mono">{c.x}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#1E1810]">
                            {c.y} visitas
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-stone-400 font-mono">
                      Sin datos geográficos en este periodo.
                    </div>
                  )}
                </div>
              </div>

              {/* Devices Breakdown */}
              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                  <h3 className="text-sm font-serif font-bold text-[#1E1810] flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Dispositivos Utilizados
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {data?.devices && data.devices.length > 0 ? (
                    data.devices.map((d) => (
                      <div
                        key={d.x}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {d.x === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Laptop className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="font-bold text-[#1E1810] capitalize">{d.x}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#1E1810]">
                          {d.y} visitas
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-stone-400 font-mono">
                      Sin registros de dispositivos.
                    </div>
                  )}
                </div>
              </div>

              {/* Browsers & OS */}
              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                  <h3 className="text-sm font-serif font-bold text-[#1E1810] flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-600" />
                    Navegadores & Sistemas
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {data?.browsers && data.browsers.length > 0 ? (
                    data.browsers.map((b) => (
                      <div
                        key={b.x}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                      >
                        <span className="font-bold text-[#1E1810] capitalize">{b.x}</span>
                        <span className="font-mono text-xs font-bold text-[#1E1810]">
                          {b.y} visitas
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-stone-400 font-mono">
                      Sin registros de navegadores.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
