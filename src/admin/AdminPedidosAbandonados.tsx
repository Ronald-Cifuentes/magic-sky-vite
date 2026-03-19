import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from './adminApi';
import { AdminFilterTabs } from './components/AdminFilterTabs';
import { AdminSearchBar } from './components/AdminSearchBar';
import { DataTable, DataTableColumn } from './components/DataTable';

const ADMIN_ABANDONED_CHECKOUTS = `
  query AdminAbandonedCheckouts($page: Float, $pageSize: Float, $search: String, $region: String, $recoveryStatus: String) {
    adminAbandonedCheckouts(page: $page, pageSize: $pageSize, search: $search, region: $region, recoveryStatus: $recoveryStatus) {
      items {
        id
        createdAt
        customerName
        email
        region
        recoveryStatus
        total
        currency
      }
      total
      page
      pageSize
    }
  }
`;

export function AdminPedidosAbandonados() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const loadCheckouts = useCallback(() => {
    setLoading(true);
    adminFetch(ADMIN_ABANDONED_CHECKOUTS, {
      page,
      pageSize,
      search: search || undefined,
      recoveryStatus: tab === 'all' ? undefined : tab,
    })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setData((res.data as any)?.adminAbandonedCheckouts ?? { items: [], total: 0, page: 1, pageSize: 50 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, tab]);

  useEffect(() => {
    loadCheckouts();
  }, [loadCheckouts]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: DataTableColumn<any>[] = [
    {
      id: 'order',
      header: 'Pedido',
      sortable: false,
      render: (o) => <span className="font-mono text-gray-700">#{o.id.slice(0, 12)}...</span>,
    },
    {
      id: 'date',
      header: 'Fecha',
      sortable: false,
      render: (o) => <span className="text-gray-600">{formatDate(o.createdAt)}</span>,
    },
    {
      id: 'customer',
      header: 'Cliente',
      sortable: false,
      render: (o) => <span>{o.customerName || o.email || '—'}</span>,
    },
    {
      id: 'region',
      header: 'Región',
      sortable: false,
      render: (o) => <span className="text-gray-600">{o.region || '—'}</span>,
    },
    {
      id: 'recovery',
      header: 'Estado de recuperación',
      sortable: false,
      render: (o) => (
        <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-800">
          {o.recoveryStatus}
        </span>
      ),
    },
    {
      id: 'total',
      header: 'Total',
      sortable: false,
      render: (o) => (
        <span className="font-medium">
          ${((o.total ?? 0) / 100).toLocaleString()} {o.currency}
        </span>
      ),
    },
  ];

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary">Pedidos abandonados</h1>
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Exportar
        </button>
      </div>

      <div className="mb-4">
        <AdminFilterTabs tabs={[{ id: 'all', label: 'Todos' }]} activeId={tab} onChange={setTab} onAdd={() => {}} />
      </div>

      <div className="mb-4 max-w-md">
        <AdminSearchBar placeholder="Buscar..." value={search} onChange={setSearch} />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(o) => o.id}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 50}
        total={data?.total ?? 0}
        onPageChange={setPage}
        showSearchIcon
        showSortIcon
        loading={loading}
        emptyMessage="No hay pedidos abandonados"
      />

      <p className="mt-4 text-sm text-gray-500">
        <a href="#" className="underline hover:text-primary">
          Más información sobre pedidos abandonados
        </a>
      </p>
    </div>
  );
}
