import { type ReactNode, useState } from "react";

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], rowData: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  lineColor?: (rowData: T) => string;
  columns: Column<T>[];
  isLoading?: boolean;
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Table<T extends Record<string, any>>({
  data,
  columns,
  lineColor,
  isLoading = false,
  itemsPerPage = 10,
  onRowClick,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const initialIndex = (currentPage - 1) * itemsPerPage;
  const finalIndex = initialIndex + itemsPerPage;

  const paginatedData = data?.slice(initialIndex, finalIndex) || [];
  const total = Math.ceil((data?.length || 0) / itemsPerPage);
  const totalPages = total === 0 ? 1 : total;

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full max-h-3/5 sm:px-4">
      <div className="card bg-base-100 shadow-xl ">
        <div className="overflow-auto">
          <table className="table table-zebra">
            <thead className="bg-base-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.accessor)}
                    className="text-base-content"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  style={{
                    backgroundColor: lineColor ? lineColor(item) : undefined,
                  }}
                  className={`${onRowClick ? "hover cursor-pointer" : ""}`}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.accessor)}
                      className="text-base-content"
                    >
                      {column.render ? (
                        column.render(item[column.accessor], item)
                      ) : (
                        item[column.accessor]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t bg-base-200 px-4 py-3">
          <div className="text-sm text-base-content">
            Página {currentPage} de {totalPages}
          </div>
          <div className="join">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline join-item"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline join-item"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;
export type { Column, TableProps };