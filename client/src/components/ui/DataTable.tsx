import { useState } from 'react';
import type { ReactNode } from 'react';

interface FilterOption {
  label: string
  value: string
  message?: string
}

interface Filter {
  name: string
  label: string
  type: string
  placeholder?: string
  options?: FilterOption[]
}

interface Column {
  header: string
  accessor: string
  checkbox?: {
    handleChange: (checked: boolean, rowData: any) => void
    isChecked?: (rowData: any) => boolean
  }
  render?: (value: any, rowData?: any) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  lineColor?: (rowData: any) => string
  columns: Column[]
  filters?: Filter[]
  isLoading?: boolean
  itemsPerPage?: number
  onRowClick?: (item: T) => void
}

export function DataTable<T>({
  data,
  columns,
  lineColor,
  filters = [],
  isLoading = false,
  itemsPerPage = 10,
  onRowClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const handleClearFilters = () => {
    setFilterValues({})
    setCurrentPage(1)
  }

  const initialIndex = (currentPage - 1) * itemsPerPage
  const finalIndex = initialIndex + itemsPerPage

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredData = Array.isArray(data) 
    ? data.filter((item: any) => {
        return Object.entries(filterValues).every(([key, value]) => {
          if (!value) return true
          const itemValue = item?.[key]
          return itemValue != null && String(itemValue)
            .toLowerCase()
            .includes(String(value).toLowerCase())
        })
      })
    : [] // Adiciona um array vazio como fallback

  const paginatedData = filteredData.slice(initialIndex, finalIndex)
  const total = Math.ceil(filteredData.length / itemsPerPage)
  const totalPages = Math.max(total, 1)

  const handleFilterChange = (name: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }))
    setCurrentPage(1)
  }

  const goToNextPage = () => {
    setCurrentPage((current) => Math.min(current + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage((current) => Math.max(current - 1, 1))
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center">
        <span className="text-xl text-primary">Carregando...</span>
      </div>
    )
  }

  const handleAlert = (message: string) => {
    alert(message)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4 mb-4 md:grid-cols-2 grid-cols-1 sm:w-1/2">
          {filters.map((filter) => (
            <label key={filter.name} className="form-control">
              <div className="label">
                <span className="label-text">{filter.label}</span>
              </div>
              {filter.type === 'select' && filter.options ? (
                <select
                  name={filter.name}
                  value={filterValues[filter.name] || ''}
                  onChange={(e) => {
                    handleFilterChange(filter.name, e.target.value)
                    if (filter.options) {
                      const selectedOption = filter.options.find(
                        (option) => option.value === e.target.value,
                      )
                      if (selectedOption?.message) {
                        handleAlert(selectedOption.message)
                      }
                    }
                  }}
                  className="select select-bordered w-full"
                >
                  <option value="">Selecione</option>
                  {filter.options.map((option) => {
                    return (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <input
                  type={filter.type}
                  name={filter.name}
                  placeholder={filter.placeholder}
                  value={filterValues[filter.name] || ''}
                  onChange={(e) =>
                    handleFilterChange(filter.name, e.target.value)
                  }
                  className="input input-bordered w-full"
                />
              )}
            </label>
          ))}
     
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="table mt-4">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.accessor}>{column.header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData && paginatedData.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              paginatedData.map((item: any, index: number) => (
                <tr
                  style={{
                    backgroundColor: lineColor
                      ? lineColor(item)
                      : 'transparent',
                  }}
                  key={index}
                  onClick={() => onRowClick?.(item)}
                  className={`cursor-pointer hover:bg-base-200 transition-colors ${
                    onRowClick ? 'hover:brightness-90' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td key={column.accessor}>
                      {column.checkbox ? (
                        <input
                          type="checkbox"
                          className="checkbox"
                          defaultChecked={
                            column.checkbox.isChecked
                              ? column.checkbox.isChecked(item)
                              : false
                          }
                          onChange={(e) => {
                            e.stopPropagation() // Evita que o evento de click da row seja disparado
                            column.checkbox?.handleChange(
                              e.target.checked,
                              item,
                            )
                          }}
                        />
                      ) : column.render ? (
                        column.render(item[column.accessor], item)
                      ) : (
                        item[column.accessor]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  {isLoading ? 'Carregando...' : 'Nenhum dado encontrado'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="w-full flex justify-center space-x-4 mt-4">
        <button
          className="btn btn-sm btn-primary text-base-100"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          {currentPage} de {totalPages}
        </span>
        <button
          className="btn btn-sm btn-primary text-base-100"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
          Próximo
        </button>
      </div>
    </div>
  )
}
