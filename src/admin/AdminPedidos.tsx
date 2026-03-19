import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminFetch } from './adminApi';
import { AdminFilterTabs } from './components/AdminFilterTabs';
import { AdminSearchBar } from './components/AdminSearchBar';
import { DataTable, DataTableColumn } from './components/DataTable';

const ADMIN_ORDERS_PAGINATED = `
  query AdminOrdersPaginated($page: Float, $pageSize: Float, $search: String, $status: String, $paymentStatus: String, $fulfillmentStatus: String) {
    adminOrdersPaginated(page: $page, pageSize: $pageSize, search: $search, status: $status, paymentStatus: $paymentStatus, fulfillmentStatus: $fulfillmentStatus) {
      items {
        id
        orderNumber
        email
        status
        total
        currency
        createdAt
        customerName
        paymentStatus
        fulfillmentStatus
        items { id quantity }
      }
      total
      page
      pageSize
    }
  }
`;

const ADMIN_UPDATE_ORDER_STATUS = `
  mutation AdminUpdateOrderStatus($id: String!, $status: OrderStatus!) {
    adminUpdateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const ADMIN_DELETE_ORDER = `
  mutation AdminDeleteOrder($id: String!) {
    adminDeleteOrder(id: $id)
  }
`;

const ORDER_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'unfulfilled', label: 'No preparados' },
  { id: 'unpaid', label: 'No pagados' },
  { id: 'open', label: 'Abiertos' },
  { id: 'archived', label: 'Archivados' },
];

function mapTabToParams(tabId: string) {
  if (tabId === 'unfulfilled') return { fulfillmentStatus: 'unfulfilled' };
  if (tabId === 'unpaid') return { paymentStatus: 'unpaid' };
  if (tabId === 'open') return { status: 'PENDING' };
  if (tabId === 'archived') return { status: 'CANCELLED' };
  return {};
}

export function AdminPedidos() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    const params = {
      page,
      pageSize,
      search: search || undefined,
      ...mapTabToParams(tab),
    };
    adminFetch(ADMIN_ORDERS_PAGINATED, params)
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setData((res.data as any)?.adminOrdersPaginated ?? { items: [], total: 0, page: 1, pageSize: 50 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, tab]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
      render: (o) => (
        <Link to={`/admin/pedidos/${o.id}`} className="font-mono text-primary hover:underline">
          #{o.orderNumber}
        </Link>
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
      render: (o) => (
        <span>{o.customerName || o.email}</span>
      ),
    },
    {
      id: 'channel',
      header: 'Canal',
      sortable: false,
      render: () => <span className="text-gray-500">—</span>,
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
    {
      id: 'payment',
      header: 'Estado del pago',
      sortable: false,
      render: (o) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            o.paymentStatus === 'Pagado'
              ? 'bg-green-100 text-green-800'
              : o.paymentStatus === 'Anulado'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {o.paymentStatus}
        </span>
      ),
    },
    {
      id: 'fulfillment',
      header: 'Estado de preparación',
      sortable: false,
      render: (o) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            o.fulfillmentStatus === 'Preparado' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {o.fulfillmentStatus}
        </span>
      ),
    },
    {
      id: 'items',
      header: 'Artículos',
      sortable: false,
      render: (o) => (
        <span className="text-gray-600">
          {o.items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) ?? 0} artículos
        </span>
      ),
    },
    {
      id: 'delivery',
      header: 'Estado de la entrega',
      sortable: false,
      render: () => <span className="text-gray-500">—</span>,
    },
    {
      id: 'shipping',
      header: 'Forma de entrega',
      sortable: false,
      render: () => <span className="text-gray-600">Envío gratis</span>,
    },
    {
      id: 'tags',
      header: 'Etiquetas',
      sortable: false,
      render: () => <span className="text-gray-500">—</span>,
    },
    {
      id: 'actions',
      header: 'Acciones',
      sortable: false,
      render: (o) => (
        <div className="flex gap-2">
          {o.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={async () => {
                if (actioningId) return;
                if (!confirm('¿Cancelar este pedido?')) return;
                setActioningId(o.id);
                try {
                  await adminFetch(ADMIN_UPDATE_ORDER_STATUS, { id: o.id, status: 'CANCELLED' });
                  loadOrders();
                } catch (e) {
                  alert((e as Error)?.message ?? 'Error al cancelar');
                } finally {
                  setActioningId(null);
                }
              }}
              disabled={!!actioningId}
              className="px-2 py-1 text-xs rounded border border-amber-300 text-amber-800 hover:bg-amber-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              if (actioningId) return;
              if (!confirm('¿Eliminar este pedido permanentemente? Esta acción no se puede deshacer.')) return;
              setActioningId(o.id);
              try {
                await adminFetch(ADMIN_DELETE_ORDER, { id: o.id });
                loadOrders();
              } catch (e) {
                alert((e as Error)?.message ?? 'Error al eliminar');
              } finally {
                setActioningId(null);
              }
            }}
            disabled={!!actioningId}
            className="px-2 py-1 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary">Pedidos</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Exportar
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Más acciones
          </button>
          <Link
            to="/admin/pedidos/crear"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Crear pedido
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Pedidos', value: data?.total ?? 0 },
          { label: 'Artículos pedidos', value: data?.items?.reduce((s, o) => s + (o.items?.reduce((a: number, i: any) => a + (i.quantity || 0), 0) ?? 0), 0) ?? 0 },
          { label: 'Devoluciones', value: 0 },
          { label: 'Pedidos preparados', value: data?.items?.filter((o) => o.fulfillmentStatus === 'Preparado').length ?? 0 },
          { label: 'Pedidos entregados', value: data?.items?.filter((o) => o.status === 'DELIVERED').length ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 uppercase">{stat.label}</p>
            <p className="text-xl font-semibold mt-1">{stat.label === 'Pedidos' ? 'Hoy' : ''} {stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <AdminFilterTabs tabs={ORDER_TABS} activeId={tab} onChange={setTab} onAdd={() => {}} />
      </div>

      <div className="mb-4 max-w-md">
        <AdminSearchBar placeholder="Buscar pedidos..." value={search} onChange={setSearch} />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(o) => o.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 50}
        total={data?.total ?? 0}
        onPageChange={setPage}
        showSearchIcon
        showColumnsIcon
        showSortIcon
        loading={loading}
        emptyMessage="No hay pedidos"
      />
    </div>
  );
}
