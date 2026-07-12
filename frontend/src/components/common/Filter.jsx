import React from 'react';
import { Filter as FilterIcon } from 'lucide-react';

const Filter = ({
  options = [],
  selectedValue = '',
  onChange,
  label = 'Filter by',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FilterIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        className="py-2 pl-3.5 pr-8 text-xs rounded-lg transition-all glass-input border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 cursor-pointer outline-none focus:ring-1 focus:ring-primary-500/20"
      >
        <option value="">{label} (All)</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filter;
