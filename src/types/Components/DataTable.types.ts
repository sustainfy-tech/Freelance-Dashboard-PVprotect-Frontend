import type { ReactNode } from "react";

export interface Column<T> {
  id?: string;
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}
