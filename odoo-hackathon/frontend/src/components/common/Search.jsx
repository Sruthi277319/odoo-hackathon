import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

const Search = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  className = '',
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onChange, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`relative flex items-center w-full max-w-sm ${className}`}>
      <SearchIcon className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full py-2 pl-9 pr-8 rounded-lg text-sm transition-all glass-input border border-slate-200 dark:border-slate-800"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-dark-900 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Search;
