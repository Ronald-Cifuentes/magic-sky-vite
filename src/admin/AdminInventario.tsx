import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from './adminApi';
import { AdminFilterTabs } from './components/AdminFilterTabs';
import { AdminSearchBar } from './components/AdminSearchBar';
import { DataTable, DataTableColumn } from './components/DataTable';

const ADMIN_INVENTORY = `
  query AdminInventoryItems($page: Float, $pageSize: Float, $search: String, $sortBy: String) {
    adminInventoryItems(page: $page, pageSize: $pageSize, search: $search, sortBy: $sortBy) {
      items {
        variantId
        productId
        productTitle
        productImageUrl
        sku
        unavailable
        committed
        available
        onHand
      }
      total
      page
      pageSize
    }
  }
`;

const UPDATE_STOCK_MUTATION = `
  mutation AdminUpdateInventoryStock($variantId: String!, $quantity: Float!) {
    adminUpdateInventoryStock(variantId: $variantId, quantity: $quantity)
  }
`;

export function AdminInventario() {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pageSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [editingCell, setEditingCell] = useState<{ variantId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const loadInventory = useCallback(() => {
    setLoading(true);
    adminFetch(ADMIN_INVENTORY, {
      page,
      pageSize,
      search: search || undefined,
    })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setData((res.data as any)?.adminInventoryItems ?? { items: [], total: 0, page: 1, pageSize: 50 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, search]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleSaveStock = async (variantId: string, _field: 'available' | 'onHand', value: number) => {
    try {
      await adminFetch(UPDATE_STOCK_MUTATION, { variantId, quantity: value });
      setEditingCell(null);
      loadInventory();
    } catch (e: any) {
      alert(e.message || 'Error al actualizar');
    }
  };

  const columns: DataTableColumn<any>[] = [
    {
      id: 'product',
      header: 'Producto',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.productImageUrl ? (
            <img src={row.productImageUrl} alt="" className="w-10 h-10 object-cover rounded" />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded" />
          )}
          <span className="font-medium">{row.productTitle}</span>
        </div>
      ),
    },
    {
      id: 'sku',
      header: 'SKU',
      sortable: false,
      render: (row) => <span className="text-gray-600 font-mono text-sm">{row.sku || '—'}</span>,
    },
    {
      id: 'unavailable',
      header: 'No disponible',
      sortable: false,
      render: (row) => <span className="text-gray-600">{row.unavailable}</span>,
    },
    {
      id: 'committed',
      header: 'Comprometido',
      sortable: false,
      render: (row) => <span className="text-gray-600">{row.committed}</span>,
    },
    {
      id: 'available',
      header: 'Disponible',
      sortable: false,
      render: (row) => <span className="text-gray-600">{row.available}</span>,
    },
    {
      id: 'onHand',
      header: 'En existencia',
      sortable: false,
      render: (row) => (
        <div className="w-20">
          {editingCell?.variantId === row.variantId && editingCell?.field === 'onHand' ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleSaveStock(row.variantId, 'onHand', parseInt(editValue, 10) || 0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveStock(row.variantId, 'onHand', parseInt(editValue, 10) || 0);
              }}
              autoFocus
              className="w-full px-2 py-1 border rounded text-sm"
            />
          ) : (
            <input
              type="number"
              value={row.onHand}
              readOnly
              onFocus={() => {
                setEditingCell({ variantId: row.variantId, field: 'onHand' });
                setEditValue(String(row.onHand));
              }}
              className="w-full px-2 py-1 border rounded text-sm bg-white cursor-pointer"
            />
          )}
        </div>
      ),
    },
  ];

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary">Inventario</h1>
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
        </div>
      </div>

      <div className="mb-4">
        <AdminFilterTabs tabs={[{ id: 'all', label: 'Todo' }]} activeId="all" onChange={() => {}} onAdd={() => {}} />
      </div>

      <div className="mb-4 max-w-md">
        <AdminSearchBar placeholder="Buscar..." value={search} onChange={setSearch} />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(row) => row.variantId}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 50}
        total={data?.total ?? 0}
        onPageChange={setPage}
        showSearchIcon
        showColumnsIcon
        showSortIcon
        loading={loading}
        emptyMessage="No hay productos en inventario"
      />
    </div>
  );
}
