import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from './adminApi';
import { AdminFilterTabs } from './components/AdminFilterTabs';
import { AdminSearchBar } from './components/AdminSearchBar';
import { DataTable, DataTableColumn } from './components/DataTable';

const ADMIN_PURCHASE_ORDERS = `
  query AdminPurchaseOrders($page: Float, $pageSize: Float, $search: String, $status: String) {
    adminPurchaseOrders(page: $page, pageSize: $pageSize, search: $search, status: $status) {
      items {
        id
        poNumber
        status
        total
        currency
        expectedDate
        createdAt
      }
      total
      page
      pageSize
    }
  }
`;

const ADMIN_CREATE_PURCHASE_ORDER = `
  mutation AdminCreatePurchaseOrder($itemsJson: String) {
    adminCreatePurchaseOrder(itemsJson: $itemsJson) {
      id
      poNumber
      status
      total
    }
  }
`;

const STATUS_TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'DRAFT', label: 'Borrador' },
  { id: 'SENT', label: 'Enviada' },
  { id: 'RECEIVED', label: 'Recibida' },
];

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  RECEIVED: 'Recibida',
};

export function AdminOrdenesCompra() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [creating, setCreating] = useState(false);

  const loadOrders = useCallback(() => {
    setLoading(true);
    adminFetch(ADMIN_PURCHASE_ORDERS, {
      page,
      pageSize,
      search: search || undefined,
      status: tab === 'all' ? undefined : tab,
    })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setData((res.data as any)?.adminPurchaseOrders ?? { items: [], total: 0, page: 1, pageSize: 50 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, tab]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCreate = () => {
    setCreating(true);
    adminFetch(ADMIN_CREATE_PURCHASE_ORDER, { itemsJson: '[]' })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error al crear');
        else loadOrders();
      })
      .catch((e) => setError(e.message))
      .finally(() => setCreating(false));
  };

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
      id: 'po',
      header: 'Orden',
      sortable: false,
      render: (o) => <span className="font-mono font-medium">{o.poNumber}</span>,
    },
    {
      id: 'date',
      header: 'Fecha',
      sortable: false,
      render: (o) => <span className="text-gray-600">{formatDate(o.createdAt)}</span>,
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

  const hasData = (data?.items?.length ?? 0) > 0;

  if (error) return <p className="text-red-600">{error}</p>;

  if (!hasData && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-48 h-48 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-secondary mb-2">Gestiona tus órdenes de compra</h2>
        <p className="text-gray-600 text-center max-w-md mb-6">
          Haz seguimiento y recibe el inventario pedido a los distribuidores
        </p>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
        >
          {creating ? 'Creando...' : 'Crear orden de compra'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary">Órdenes de compra</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Exportar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
          >
            {creating ? 'Creando...' : 'Crear orden de compra'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <AdminFilterTabs tabs={STATUS_TABS} activeId={tab} onChange={setTab} onAdd={() => {}} />
      </div>

      <div className="mb-4 max-w-md">
        <AdminSearchBar placeholder="Buscar órdenes..." value={search} onChange={setSearch} />
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
        emptyMessage="No hay órdenes de compra"
      />
    </div>
  );
}
