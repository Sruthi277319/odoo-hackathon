import React from 'react';
import Loader from './Loader';
import EmptyState from './EmptyState';

const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found',
  emptySubMessage = 'Try clearing filters or adding new items.',
  keyExtractor = (item, index) => item.id || index,
  onRowClick,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-xl glass-panel ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/40 dark:bg-dark-900/50 border-b border-slate-200/50 dark:border-slate-800/40">
              {columns.map((col, idx) => (
                <th
                  key={col.header || idx}
                  className={`px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader size="md" />
                    <span className="text-sm text-slate-500">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <EmptyState title={emptyMessage} description={emptySubMessage} />
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={keyExtractor(item, rowIdx)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-dark-900/10 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIdx) => {
                    const value = col.accessor
                      ? typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : item[col.accessor]
                      : null;

                    return (
                      <td
                        key={colIdx}
                        className={`px-6 py-4 text-sm text-slate-700 dark:text-slate-300 ${
                          col.className || ''
                        }`}
                      >
                        {col.render ? col.render(value, item, rowIdx) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
