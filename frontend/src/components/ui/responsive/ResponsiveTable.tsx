import React from 'react';

export interface ResponsiveTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  hideOnTablet?: boolean;
  className?: string;
}

interface ResponsiveTableProps<T> {
  columns: ResponsiveTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  renderMobileCard?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

export function ResponsiveTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  renderMobileCard,
  emptyMessage = 'No data available',
  loading = false,
  onRowClick,
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium">Loading records...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-12 px-4 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Card View (< 1024px) */}
      <div className="block lg:hidden space-y-3">
        {data.map((item) => {
          const key = keyExtractor(item);

          if (renderMobileCard) {
            return (
              <div key={key} onClick={() => onRowClick?.(item)}>
                {renderMobileCard(item)}
              </div>
            );
          }

          // Default smart mobile card fallback
          return (
            <div
              key={key}
              onClick={() => onRowClick?.(item)}
              className={`p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5 ${
                onRowClick ? 'cursor-pointer hover:border-blue-300 active:bg-slate-50' : ''
              }`}
            >
              {columns.map((col, idx) => (
                <div key={col.key} className="flex items-center justify-between text-xs gap-3">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    {col.header}
                  </span>
                  <div className="text-right font-medium text-slate-900 truncate">
                    {col.render ? col.render(item) : String(item[col.key] ?? '—')}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= 1024px) */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                    col.hideOnTablet ? 'hidden xl:table-cell' : ''
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((item) => {
              const key = keyExtractor(item);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/40'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-700 ${
                        col.hideOnTablet ? 'hidden xl:table-cell' : ''
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(item) : String(item[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
