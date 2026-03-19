interface Tab {
  id: string;
  label: string;
}

interface AdminFilterTabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  addLabel?: string;
  onAdd?: () => void;
  className?: string;
}

export function AdminFilterTabs({
  tabs,
  activeId,
  onChange,
  addLabel = '+',
  onAdd,
  className = '',
}: AdminFilterTabsProps) {
  return (
    <div className={`flex items-center gap-1 border-b border-gray-200 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeId === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-3 text-gray-500 hover:text-gray-700 text-sm"
          title="Añadir vista"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
