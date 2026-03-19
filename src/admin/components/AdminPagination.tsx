import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function AdminPagination({
  page,
  pageSize,
  total,
  onPageChange,
  className = '',
}: AdminPaginationProps) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className={`flex items-center gap-4 text-sm text-gray-600 ${className}`}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
      <span>
        {total > 0 ? `${start}-${end}` : '0'} de {total}
      </span>
    </div>
  );
}
