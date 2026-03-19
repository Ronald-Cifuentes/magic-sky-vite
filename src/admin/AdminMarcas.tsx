import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from './adminApi';
import { AdminSearchBar } from './components/AdminSearchBar';
import { DataTable, DataTableColumn } from './components/DataTable';

const ADMIN_BRANDS_PAGINATED = `
  query AdminBrandsPaginated($page: Float, $pageSize: Float, $search: String) {
    adminBrandsPaginated(page: $page, pageSize: $pageSize, search: $search) {
      items {
        id
        name
        slug
        description
        logoUrl
      }
      total
      page
      pageSize
    }
  }
`;

const ADMIN_CREATE_BRAND = `
  mutation AdminCreateBrand($name: String!, $slug: String, $description: String, $logoUrl: String) {
    adminCreateBrand(name: $name, slug: $slug, description: $description, logoUrl: $logoUrl) {
      id
      name
      slug
    }
  }
`;

const ADMIN_UPDATE_BRAND = `
  mutation AdminUpdateBrand($id: String!, $name: String, $description: String, $logoUrl: String) {
    adminUpdateBrand(id: $id, name: $name, description: $description, logoUrl: $logoUrl) {
      id
      name
      slug
    }
  }
`;

const ADMIN_DELETE_BRAND = `
  mutation AdminDeleteBrand($id: String!) {
    adminDeleteBrand(id: $id)
  }
`;

export function AdminMarcas() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadBrands = useCallback(() => {
    setLoading(true);
    adminFetch(ADMIN_BRANDS_PAGINATED, {
      page,
      pageSize,
      search: search || undefined,
    })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setData((res.data as any)?.adminBrandsPaginated ?? { items: [], total: 0, page: 1, pageSize: 50 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, search]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const handleCreate = () => {
    if (!createName.trim()) return;
    setCreating(true);
    adminFetch(ADMIN_CREATE_BRAND, { name: createName.trim() })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error al crear');
        else {
          setCreateName('');
          setShowCreate(false);
          loadBrands();
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setCreating(false));
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    adminFetch(ADMIN_UPDATE_BRAND, { id, name: editName.trim() })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error al actualizar');
        else {
          setEditing(null);
          loadBrands();
        }
      })
      .catch((e) => setError(e.message));
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar la marca "${name}"?`)) return;
    adminFetch(ADMIN_DELETE_BRAND, { id })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error al eliminar');
        else loadBrands();
      })
      .catch((e) => setError(e.message));
  };

  const columns: DataTableColumn<any>[] = [
    {
      id: 'name',
      header: 'Marca',
      sortable: false,
      render: (b) => (
        <div className="flex items-center gap-3">
          {b.logoUrl ? (
            <img src={b.logoUrl} alt="" className="w-10 h-10 rounded object-cover" />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-medium">
              {b.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            {editing === b.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border rounded px-2 py-1 text-sm w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdate(b.id);
                  if (e.key === 'Escape') setEditing(null);
                }}
              />
            ) : (
              <span className="font-medium">{b.name}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'slug',
      header: 'Slug',
      sortable: false,
      render: (b) => <span className="text-gray-600 font-mono text-sm">{b.slug}</span>,
    },
    {
      id: 'actions',
      header: 'Acciones',
      sortable: false,
      render: (b) => (
        <div className="flex gap-2">
          {editing === b.id ? (
            <>
              <button
                type="button"
                onClick={() => handleUpdate(b.id)}
                className="text-sm text-green-600 hover:underline"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditing(b.id);
                  setEditName(b.name);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(b.id, b.name)}
                className="text-sm text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary">Marcas</h1>
        <div className="flex gap-2">
          {!showCreate ? (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              Crear marca
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nombre de la marca"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-48"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setShowCreate(false);
                }}
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || !createName.trim()}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
              >
                {creating ? 'Creando...' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setCreateName(''); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 max-w-md">
        <AdminSearchBar placeholder="Buscar marcas..." value={search} onChange={setSearch} />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(b) => b.id}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 50}
        total={data?.total ?? 0}
        onPageChange={setPage}
        showSearchIcon
        showSortIcon
        loading={loading}
        emptyMessage="No hay marcas"
      />
    </div>
  );
}
