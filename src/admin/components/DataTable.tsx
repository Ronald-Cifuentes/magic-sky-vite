import { ReactNode } from 'react';
import { FiChevronUp, FiChevronDown, FiSearch, FiColumns } from 'react-icons/fi';
import { AdminPagination } from './AdminPagination';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  showSearchIcon?: boolean;
  showColumnsIcon?: boolean;
  showSortIcon?: boolean;
  onSearchClick?: () => void;
  onColumnsClick?: () => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  sortBy,
  sortOrder,
  onSort,
  page = 1,
  pageSize = 50,
  total = 0,
  onPageChange,
  showSearchIcon = false,
  showColumnsIcon = false,
  showSortIcon = false,
  onSearchClick,
  onColumnsClick,
  emptyMessage = 'No hay datos',
  loading = false,
}: DataTableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(new Set(data.map(keyExtractor)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectionChange(next);
  };

  const allSelected = data.length > 0 && data.every((r) => selectedIds.has(keyExtractor(r)));

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
      {(showSearchIcon || showColumnsIcon || showSortIcon) && (
        <div className="flex justify-end gap-2 p-2 border-b border-gray-100">
          {showSearchIcon && (
            <button
              type="button"
              onClick={onSearchClick}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              title="Buscar"
            >
              <FiSearch size={18} />
            </button>
          )}
          {showColumnsIcon && (
            <button
              type="button"
              onClick={onColumnsClick}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              title="Columnas"
            >
              <FiColumns size={18} />
            </button>
          )}
          {showSortIcon && onSort && (
            <button
              type="button"
              onClick={() => onSort(sortBy || columns[0]?.id)}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              title="Ordenar"
            >
              <FiChevronDown size={18} />
            </button>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && onSort && (
                      <button
                        type="button"
                        onClick={() => onSort(col.id)}
                        className="p-0.5 hover:bg-gray-200 rounded"
                      >
                        {sortBy === col.id ? (
                          sortOrder === 'asc' ? (
                            <FiChevronUp size={14} />
                          ) : (
                            <FiChevronDown size={14} />
                          )
                        ) : (
                          <FiChevronDown size={14} className="opacity-50" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-gray-50">
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(keyExtractor(row))}
                        onChange={(e) => handleSelectRow(keyExtractor(row), e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.id} className={`px-4 py-3 text-sm ${col.className || ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {onPageChange && total > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <AdminPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
