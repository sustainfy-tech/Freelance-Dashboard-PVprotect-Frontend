import type { ReactNode } from "react";

export interface Column<T> {
  /** Optional stable id for this column, used as the React key when
   * rendering header/cell elements. Falls back to header+index if
   * omitted — but multiple columns sharing the same header (e.g. two
   * icon-only action columns with header: "") should set this
   * explicitly to avoid duplicate-key warnings. */
  id?: string;
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

export default function DataTable<T>({
  columns,
  rows,
  onRowClick,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  /** Returns a stable unique string for each row. Required — different
   * entities use different identifier field names (bookingId, serviceId,
   * etc.), so we don't assume an `id` field exists. */
  rowKey: (row: T) => string;
}) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const getRowKey = (row: any, index: number) => {
    if (typeof rowKey === "function") return rowKey(row);
    if (typeof rowKey === "string") return (row as any)[rowKey];
    return (row as any).id ?? (row as any)._id ?? index;
  };

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
              key={getRowKey(row, index)}
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
