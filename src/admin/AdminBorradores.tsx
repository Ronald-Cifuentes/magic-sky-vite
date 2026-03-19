import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminFetch } from './adminApi';
import { AdminFilterTabs } from './components/AdminFilterTabs';
import { AdminSearchBar } from './components/AdminSearchBar';
import { DataTable, DataTableColumn } from './components/DataTable';

const ADMIN_DRAFT_ORDERS = `
  query AdminDraftOrders($page: Float, $pageSize: Float, $search: String, $status: String) {
    adminDraftOrders(page: $page, pageSize: $pageSize, search: $search, status: $status) {
      items {
        id
        draftNumber
        email
        status
        total
        currency
        createdAt
        customerName
      }
      total
      page
      pageSize
    }
  }
`;

const DRAFT_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'OPEN', label: 'Abierto' },
  { id: 'INVOICE_SENT', label: 'Factura enviada' },
  { id: 'COMPLETED', label: 'Completado' },
];

const statusLabels: Record<string, string> = {
  OPEN: 'Abierto',
  INVOICE_SENT: 'Factura enviada',
  COMPLETED: 'Completado',
};

export function AdminBorradores() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const loadDrafts = useCallback(() => {
    setLoading(true);
    adminFetch(ADMIN_DRAFT_ORDERS, {
      page,
      pageSize,
      search: search || undefined,
      status: tab === 'all' ? undefined : tab,
    })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setData((res.data as any)?.adminDraftOrders ?? { items: [], total: 0, page: 1, pageSize: 50 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, tab]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

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
      id: 'draft',
      header: 'Pedido preliminar',
      sortable: false,
      render: (o) => (
        <span className="font-mono font-medium">#{o.draftNumber}</span>
      ),
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
      id: 'status',
      header: 'Estado',
      sortable: false,
      render: (o) => (
        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
          {statusLabels[o.status] || o.status}
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
        <h1 className="text-2xl font-bold text-secondary">Borradores</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Exportar
          </button>
          <Link
            to="/admin/pedidos/crear"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Crear pedido
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <AdminFilterTabs tabs={DRAFT_TABS} activeId={tab} onChange={setTab} onAdd={() => {}} />
      </div>

      <div className="mb-4 max-w-md">
        <AdminSearchBar placeholder="Buscar borradores..." value={search} onChange={setSearch} />
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
        emptyMessage="No hay borradores"
      />

      <p className="mt-4 text-sm text-gray-500">
        <a href="#" className="underline hover:text-primary">
          Más información sobre creación de pedidos preliminares
        </a>
      </p>
    </div>
  );
}
