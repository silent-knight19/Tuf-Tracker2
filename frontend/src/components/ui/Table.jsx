import PropTypes from 'prop-types';

export default function Table({
  columns,
  data,
  onRowClick,
  emptyState,
  className = '',
}) {
  return (
    <div className={`w-full overflow-x-auto custom-scrollbar rounded-xl border border-border bg-surface-raised/40 shadow-inner-rim ${className}`}>
      <table className="w-full border-collapse text-left text-xs">
        {/* Header */}
        <thead>
          <tr className="border-b border-border bg-surface/80 text-foreground-subtle uppercase text-[10px] font-semibold tracking-wider select-none">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`py-3 px-4 ${col.className || ''}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-border-subtle">
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-surface-hover/70 active:bg-surface-active'
                    : 'hover:bg-surface-hover/40'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`py-3 px-4 text-foreground-muted ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-foreground-subtle"
              >
                {emptyState || 'No records found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.node.isRequired,
      key: PropTypes.string,
      render: PropTypes.func,
      className: PropTypes.string,
      cellClassName: PropTypes.string,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  emptyState: PropTypes.node,
  className: PropTypes.string,
};
