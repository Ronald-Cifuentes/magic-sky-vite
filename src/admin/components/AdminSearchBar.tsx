import { useState, useEffect, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';

interface AdminSearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  className?: string;
  id?: string;
}

export function AdminSearchBar({
  placeholder = 'Buscar',
  value,
  onChange,
  debounceMs = 300,
  className = '',
  id,
}: AdminSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (val: string) => {
      const timer = setTimeout(() => onChange(val), debounceMs);
      return () => clearTimeout(timer);
    },
    [onChange, debounceMs],
  );

  useEffect(() => {
    if (localValue === value) return;
    const cleanup = debouncedOnChange(localValue);
    return cleanup;
  }, [localValue, value, debouncedOnChange]);

  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        id={id}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>
  );
}
