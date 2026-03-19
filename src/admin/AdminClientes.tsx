import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from './adminApi';
import { AdminSearchBar } from './components/AdminSearchBar';
import { DataTable, DataTableColumn } from './components/DataTable';

const ADMIN_CUSTOMERS = `
  query AdminCustomers($page: Float, $pageSize: Float, $search: String, $sortBy: String, $sortOrder: String) {
    adminCustomers(page: $page, pageSize: $pageSize, search: $search, sortBy: $sortBy, sortOrder: $sortOrder) {
      items {
        id
        firstName
        lastName
        email
        phone
        totalSpent
        totalOrders
        createdAt
      }
      total
      page
      pageSize
    }
  }
`;

export function AdminClientes() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [sortBy] = useState<string>('createdAt');
  const [sortOrder] = useState<string>('desc');

  const loadCustomers = useCallback(() => {
    setLoading(true);
    adminFetch(ADMIN_CUSTOMERS, {
      page,
      pageSize,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setData((res.data as any)?.adminCustomers ?? { items: [], total: 0, page: 1, pageSize: 50 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, sortBy, sortOrder]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const columns: DataTableColumn<any>[] = [
    {
      id: 'name',
      header: 'Cliente',
      sortable: false,
      render: (c) => (
        <span className="font-medium">
          {c.firstName} {c.lastName}
        </span>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      sortable: false,
      render: (c) => <span className="text-gray-600">{c.email || '—'}</span>,
    },
    {
      id: 'orders',
      header: 'Pedidos',
      sortable: false,
      render: (c) => <span>{c.totalOrders ?? 0}</span>,
    },
    {
      id: 'spent',
      header: 'Total gastado',
      sortable: false,
      render: (c) => (
        <span className="font-medium">
          ${((c.totalSpent ?? 0) / 100).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Fecha',
      sortable: false,
      render: (c) => <span className="text-gray-600">{formatDate(c.createdAt)}</span>,
    },
  ];

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary">Clientes</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Exportar
          </button>
        </div>
      </div>

      <div className="mb-4 max-w-md">
        <AdminSearchBar placeholder="Buscar clientes..." value={search} onChange={setSearch} />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(c) => c.id}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 50}
        total={data?.total ?? 0}
        onPageChange={setPage}
        showSearchIcon
        showSortIcon
        loading={loading}
        emptyMessage="No hay clientes"
      />
    </div>
  );
}
