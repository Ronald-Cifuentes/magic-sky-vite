import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminFetch } from './adminApi';

const ADMIN_DASHBOARD_STATS = `
  query AdminDashboardStats($period: String, $channel: String) {
    adminDashboardStats(period: $period, channel: $channel) {
      sessions
      sessionsTrend
      sessionsSparkline
      totalSales
      totalSalesTrend
      orders
      ordersTrend
      conversionRate
      conversionRateTrend
    }
  }
`;

const PERIOD_OPTIONS = [
  { id: '7d', label: 'Últimos 7 días' },
  { id: '14d', label: 'Últimos 14 días' },
  { id: '30d', label: 'Últimos 30 días' },
  { id: '90d', label: 'Últimos 90 días' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function KpiCard({
  title,
  value,
  trend,
  sparkline,
}: {
  title: string;
  value: string | number;
  trend?: number;
  sparkline?: number[];
}) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-secondary">{value}</span>
        {trend !== undefined && (
          <span className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
      </div>
      {sparkline && sparkline.length > 0 && (
        <div className="mt-3 flex items-end gap-0.5 h-8">
          {sparkline.map((v, i) => (
            <div
              key={i}
              className="flex-1 min-w-[2px] bg-primary/30 rounded-t"
              style={{ height: `${Math.max(4, (v / Math.max(...sparkline, 1)) * 100)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<{
    sessions: number;
    sessionsTrend: number;
    sessionsSparkline: number[];
    totalSales: number;
    totalSalesTrend: number;
    orders: number;
    ordersTrend: number;
    conversionRate: number;
    conversionRateTrend: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [channel, setChannel] = useState('all');

  useEffect(() => {
    setLoading(true);
    adminFetch(ADMIN_DASHBOARD_STATS, { period, channel })
      .then((res) => {
        if (res.errors) return;
        setStats((res.data as any)?.adminDashboardStats ?? null);
      })
      .finally(() => setLoading(false));
  }, [period, channel]);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            {getGreeting()}, empecemos.
          </h1>
          <p className="text-gray-500 mt-1">Resumen de tu tienda</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todos los canales</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 max-w-md">
        <input
          type="text"
          placeholder="Pregunta lo que quieras..."
          className="flex-1 border rounded-lg px-4 py-2 text-sm"
        />
        <span className="text-gray-400" title="Búsqueda IA">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-border-soft animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-8 bg-gray-200 rounded w-3/4 mt-3" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="Sesiones"
            value={stats.sessions.toLocaleString()}
            trend={stats.sessionsTrend}
            sparkline={stats.sessionsSparkline}
          />
          <KpiCard
            title="Ventas totales"
            value={`$${(stats.totalSales / 100).toLocaleString()} COP`}
            trend={stats.totalSalesTrend}
          />
          <KpiCard
            title="Pedidos"
            value={stats.orders}
            trend={stats.ordersTrend}
          />
          <KpiCard
            title="Tasa de conversión"
            value={`${stats.conversionRate.toFixed(1)}%`}
            trend={stats.conversionRateTrend}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Sesiones" value="0" />
          <KpiCard title="Ventas totales" value="$0" />
          <KpiCard title="Pedidos" value="0" />
          <KpiCard title="Tasa de conversión" value="0%" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/productos"
          className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft hover:shadow-pink block"
        >
          <h2 className="font-semibold text-secondary">Productos</h2>
          <p className="text-sm text-gray-500 mt-1">Gestionar catálogo</p>
        </Link>
        <Link
          to="/admin/pedidos"
          className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft hover:shadow-pink block"
        >
          <h2 className="font-semibold text-secondary">Pedidos</h2>
          <p className="text-sm text-gray-500 mt-1">Ver y gestionar pedidos</p>
        </Link>
        <Link
          to="/admin/cms"
          className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft hover:shadow-pink block"
        >
          <h2 className="font-semibold text-secondary">CMS</h2>
          <p className="text-sm text-gray-500 mt-1">Contenido y páginas</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft">
          <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Video Dropshipping</span>
          </div>
          <h3 className="font-semibold text-secondary">Dropshipping</h3>
          <div className="flex gap-2 mt-2">
            <button type="button" className="text-sm text-primary hover:underline">Ver video</button>
            <span className="text-gray-300">|</span>
            <button type="button" className="text-sm text-primary hover:underline">Más información</button>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft">
          <h3 className="font-semibold text-secondary">Conseguir las diez primeras ventas</h3>
          <p className="text-sm text-gray-500 mt-1">Progreso: 0/6 tareas</p>
          <div className="mt-3 space-y-2">
            {['Crear producto', 'Configurar envíos', 'Añadir métodos de pago'].map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{t}</span>
                <button type="button" className="text-primary hover:underline">Empezar</button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft">
          <h3 className="font-semibold text-secondary">Mercados</h3>
          <p className="text-sm text-gray-500 mt-1">Integra Amazon, Walmart, eBay, Etsy</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {['Amazon', 'Walmart', 'eBay', 'Etsy'].map((m) => (
              <span key={m} className="px-2 py-1 bg-gray-100 rounded text-xs">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
