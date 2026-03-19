import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiExternalLink, FiStar, FiTrash2 } from 'react-icons/fi';
import { adminFetch } from './adminApi';
import { AdminFilterTabs } from './components/AdminFilterTabs';
import { AdminSearchBar } from './components/AdminSearchBar';
import { DataTable, DataTableColumn } from './components/DataTable';

const ADMIN_PRODUCTS_PAGINATED = `
  query AdminProductsPaginated($page: Float, $pageSize: Float, $search: String, $status: String, $categoryId: String, $sortBy: String, $sortOrder: String) {
    adminProductsPaginated(page: $page, pageSize: $pageSize, search: $search, status: $status, categoryId: $categoryId, sortBy: $sortBy, sortOrder: $sortOrder) {
      items {
        id
        slug
        title
        published
        featured
        status
        category { id name }
        variants { id price title }
        images { id url }
      }
      total
      page
      pageSize
    }
  }
`;

const SET_FEATURED_MUTATION = `
  mutation AdminSetProductFeatured($id: String!, $featured: Boolean!) {
    adminSetProductFeatured(id: $id, featured: $featured) {
      id featured
    }
  }
`;

const DELETE_MUTATION = `
  mutation AdminDeleteProduct($id: String!) {
    adminDeleteProduct(id: $id)
  }
`;

const PRODUCT_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Activos' },
  { id: 'draft', label: 'Borradores' },
  { id: 'archived', label: 'Archivados' },
];

export function AdminProductos() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadProducts = useCallback(() => {
    setLoading(true);
    adminFetch(ADMIN_PRODUCTS_PAGINATED, {
      page,
      pageSize,
      search: search || undefined,
      status: tab === 'all' ? undefined : tab,
      sortBy,
      sortOrder,
    })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setData((res.data as any)?.adminProductsPaginated ?? { items: [], total: 0, page: 1, pageSize: 50 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, tab, sortBy, sortOrder]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (p: any) => {
    if (!confirm(`¿Eliminar "${p.title}"?`)) return;
    try {
      await adminFetch(DELETE_MUTATION, { id: p.id });
      loadProducts();
    } catch (e: any) {
      alert(e.message || 'Error al eliminar');
    }
  };

  const handleToggleFeatured = async (p: any) => {
    try {
      await adminFetch(SET_FEATURED_MUTATION, { id: p.id, featured: !p.featured });
      loadProducts();
    } catch (e: any) {
      alert(e.message || 'Error al actualizar');
    }
  };

  const handleSort = (col: string) => {
    if (sortBy === col) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else setSortBy(col);
  };

  const columns: DataTableColumn<any>[] = [
    {
      id: 'title',
      header: 'Producto',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.images?.[0]?.url ? (
            <img src={p.images[0].url} alt="" className="w-10 h-10 object-cover rounded" />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded" />
          )}
          <span className="font-medium text-secondary">{p.title}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      sortable: false,
      render: (p) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            p.published && p.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {p.published && p.status === 'active' ? 'Activo' : 'Borrador'}
        </span>
      ),
    },
    {
      id: 'inventory',
      header: 'Inventario',
      sortable: false,
      render: (p) => {
        const stock = p.variants?.[0]?.inventoryQuantity ?? 0;
        return (
          <span className={stock <= 0 ? 'text-red-600' : stock <= 2 ? 'text-amber-600' : 'text-gray-600'}>
            {stock} en existencias
          </span>
        );
      },
    },
    {
      id: 'category',
      header: 'Categoría',
      sortable: false,
      render: (p) => <span className="text-gray-600">{p.category?.name || '—'}</span>,
    },
    {
      id: 'channels',
      header: 'Canales',
      sortable: false,
      render: () => <span className="text-gray-600">1</span>,
    },
    {
      id: 'actions',
      header: '',
      sortable: false,
      render: (p) => (
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => handleToggleFeatured(p)}
            title={p.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
            className={`p-1.5 rounded transition-colors ${
              p.featured ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
            }`}
          >
            <FiStar size={18} fill={p.featured ? 'currentColor' : 'none'} />
          </button>
          <Link
            to={`/admin/productos/${p.id}/editar`}
            title="Editar"
            className="text-primary hover:text-primary-hover p-1.5 rounded hover:bg-primary/10"
          >
            <FiEdit2 size={18} />
          </Link>
          <Link
            to={`/producto/${p.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver tienda"
            className="text-gray-500 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100"
          >
            <FiExternalLink size={18} />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(p)}
            title="Eliminar"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary">Productos</h1>
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
            Importar
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Más acciones
          </button>
          <Link
            to="/admin/productos/nuevo"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Agregar producto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Tasa media de ventas directas</p>
          <p className="text-xl font-semibold mt-1">0%</p>
          <p className="text-xs text-gray-500">30 días</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Productos por días de inventario restante</p>
          <p className="text-xl font-semibold mt-1">Sin datos</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 uppercase">Análisis ABC de productos</p>
          <p className="text-xl font-semibold mt-1">0,00 COP C</p>
        </div>
      </div>

      <div className="mb-4">
        <AdminFilterTabs tabs={PRODUCT_TABS} activeId={tab} onChange={setTab} onAdd={() => {}} />
      </div>

      <div className="mb-4 max-w-md">
        <AdminSearchBar placeholder="Buscar productos..." value={search} onChange={setSearch} />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(p) => p.id}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 50}
        total={data?.total ?? 0}
        onPageChange={setPage}
        showSearchIcon
        showSortIcon
        loading={loading}
        emptyMessage="No hay productos"
      />
    </div>
  );
}
