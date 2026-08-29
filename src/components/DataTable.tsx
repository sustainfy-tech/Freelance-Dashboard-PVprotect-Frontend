import type {
  Column,
  DataTableProps,
} from "../types/Components/DataTable.types";

export type { Column };

export default function DataTable<T>({
  columns,
  rows,
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="card-shadow overflow-x-auto rounded-md border border-border bg-surface">
      <table className="w-full min-w-180 border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-surface2">
            {columns.map((col, i) => (
              <th
                key={col.id ?? `${col.header}-${i}`}
                className="whitespace-nowrap px-4 py-3 font-mono text-[10.5px] font-medium uppercase tracking-widest text-faint"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.map((row, index) => (
            <tr
              key={rowKey(row) ?? index}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border last:border-0 ${
                onRowClick ? "cursor-pointer hover:bg-surface2" : ""
              }`}
            >
              {columns.map((col, i) => (
                <td
                  key={col.id ?? `${col.header}-${i}`}
                  className={`whitespace-nowrap px-4 py-3.5 text-[13px] text-hi ${
                    col.className ?? ""
                  }`}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}

          {safeRows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-faint"
              >
                No records match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
