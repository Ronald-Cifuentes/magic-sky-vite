import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminFetch } from './adminApi';
import { AdminFilterTabs } from './components/AdminFilterTabs';
import { AdminSearchBar } from './components/AdminSearchBar';
import { DataTable, DataTableColumn } from './components/DataTable';

const ADMIN_COLLECTIONS = `
  query AdminCollections($page: Float, $pageSize: Float, $search: String, $sortBy: String, $sortOrder: String) {
    adminCollections(page: $page, pageSize: $pageSize, search: $search, sortBy: $sortBy, sortOrder: $sortOrder) {
      items {
        id
        name
        slug
        description
        imageUrl
        products { product { id } sortOrder }
      }
      total
      page
      pageSize
    }
  }
`;

const DELETE_MUTATION = `
  mutation AdminDeleteCollection($id: String!) {
    adminDeleteCollection(id: $id)
  }
`;

export function AdminColecciones() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const loadCollections = useCallback(() => {
    setLoading(true);
    adminFetch(ADMIN_COLLECTIONS, {
      page,
      pageSize,
      search: search || undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setData((res.data as any)?.adminCollections ?? { items: [], total: 0, page: 1, pageSize: 50 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, tab]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleDelete = async (c: any) => {
    if (!confirm(`¿Eliminar la colección "${c.name}"?`)) return;
    try {
      await adminFetch(DELETE_MUTATION, { id: c.id });
      loadCollections();
    } catch (e: any) {
      alert(e.message || 'Error al eliminar');
    }
  };

  const columns: DataTableColumn<any>[] = [
    {
      id: 'thumb',
      header: '',
      sortable: false,
      render: (c) => (
        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
          {c.imageUrl ? (
            <img src={c.imageUrl} alt="" className="w-full h-full object-cover rounded" />
          ) : (
            '—'
          )}
        </div>
      ),
    },
    {
      id: 'title',
      header: 'Título',
      sortable: false,
      render: (c) => (
        <Link to={`/admin/productos/colecciones/${c.id}`} className="font-medium text-primary hover:underline">
          {c.name}
        </Link>
      ),
    },
    {
      id: 'products',
      header: 'Productos',
      sortable: false,
      render: (c) => (
        <span className="text-gray-600">{c.products?.length ?? 0}</span>
      ),
    },
    {
      id: 'conditions',
      header: 'Condiciones de los productos',
      sortable: false,
      render: () => <span className="text-gray-500">—</span>,
    },
    {
      id: 'actions',
      header: '',
      sortable: false,
      render: (c) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/productos/colecciones/${c.id}`}
            className="text-primary hover:underline text-sm"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(c)}
            className="text-red-600 hover:underline text-sm"
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
        <h1 className="text-2xl font-bold text-secondary">Colecciones</h1>
        <Link
          to="/admin/productos/colecciones/nueva"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
        >
          Crear colección
        </Link>
      </div>

      <div className="mb-4">
        <AdminFilterTabs tabs={[{ id: 'all', label: 'Todas' }]} activeId={tab} onChange={setTab} onAdd={() => {}} />
      </div>

      <div className="mb-4 max-w-md">
        <AdminSearchBar placeholder="Buscar colecciones..." value={search} onChange={setSearch} />
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
        emptyMessage="No hay colecciones"
      />

      <p className="mt-4 text-sm text-gray-500">
        <a href="#" className="underline hover:text-primary">
          Más información sobre colecciones
        </a>
      </p>
    </div>
  );
}
