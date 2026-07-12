import React from 'react';
import { Search } from 'lucide-react';

export const SearchFilterSort = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [], // array of { name, value, onChange, options: [{label, value}] }
  sortBy,
  onSortChange,
  sortOptions = [], // array of { label, value }
}) => {
  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--border-radius-md)' }}>
      <div className="filter-bar">
        {/* Search Input */}
        {onSearchChange && (
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
          </div>
        )}

        {/* Dynamic Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end' }}>
          {filters.map((filter, index) => (
            <div key={index} style={{ minWidth: '130px' }}>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '13px' }}
              >
                {filter.options.map((opt, oIndex) => (
                  <option key={oIndex} value={opt.value} style={{ background: 'var(--bg-app)', color: 'var(--text-main)' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Sort Option */}
          {onSortChange && sortOptions.length > 0 && (
            <div style={{ minWidth: '150px' }}>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '13px', borderLeft: '2px solid rgb(var(--color-primary))' }}
              >
                {sortOptions.map((opt, index) => (
                  <option key={index} value={opt.value} style={{ background: 'var(--bg-app)', color: 'var(--text-main)' }}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterSort;
