import clsx from "clsx";
import type {
  Column,
  DataTableProps,
} from "../types/Components/DataTable.types";

export type { Column };

const isActionColumn = (header: string) => /^(actions?)?$/i.test(header.trim());

export default function DataTable<T>({
  columns,
  rows,
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const indexed = columns.map((col, i) => ({
    col,
    key: col.id ?? `${col.header}-${i}`,
  }));
  const primary = indexed[0];
  const rest = indexed.slice(1);
  const dataCols = rest.filter(({ col }) => !isActionColumn(col.header));
  const actionCols = rest.filter(({ col }) => isActionColumn(col.header));

  return (
    <div className="@container card-shadow overflow-hidden rounded-md border border-border bg-surface">
      {/* Card list: below 48rem of available width */}
      <ul className="@3xl:hidden">
        {safeRows.map((row, index) => (
          <li
            key={rowKey(row) ?? index}
            onClick={() => onRowClick?.(row)}
            className={clsx(
              "border-b border-border p-4 last:border-0",
              onRowClick && "cursor-pointer active:bg-surface2",
            )}
          >
            {primary && (
              <div className="min-w-0 wrap-break-word text-[13px] text-hi">
                {primary.col.accessor(row)}
              </div>
            )}

            {dataCols.length > 0 && (
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                {dataCols.map(({ col, key }) => (
                  <div key={key} className="min-w-0">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">
                      {col.header}
                    </dt>
                    <dd
                      className={clsx(
                        "mt-1 min-w-0 wrap-break-word text-[13px] text-hi",
                        col.className,
                      )}
                    >
                      {col.accessor(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {actionCols.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                {actionCols.map(({ col, key }) => (
                  <div key={key} className="flex items-center gap-1">
                    {col.accessor(row)}
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}

        {safeRows.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-faint">
            No records match the current filters.
          </li>
        )}
      </ul>

      {/* Table: 48rem of available width and up */}
      <div className="hidden overflow-x-auto @3xl:block">
        <table className="w-full min-w-180 border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface2">
              {indexed.map(({ col, key }) => (
                <th
                  key={key}
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
                {indexed.map(({ col, key }) => (
                  <td
                    key={key}
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
    </div>
  );
}