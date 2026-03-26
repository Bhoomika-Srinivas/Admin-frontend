import EmptyState from '../common/EmptyState'
import Pagination from '../common/Pagination'
import clsx from 'clsx'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  keyExtractor: (row: T) => string
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="table-td">
          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export default function DataTable<T>({
  columns, data, loading = false, keyExtractor,
  total, page = 1, limit = 10, onPageChange, onRowClick,
  emptyTitle, emptyDescription
}: DataTableProps<T>) {
  const totalPages = total ? Math.ceil(total / limit) : 1

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              {columns.map(col => (
                <th key={col.key} className={clsx('table-th', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map(row => (
                <tr
                  key={keyExtractor(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={clsx('hover:bg-slate-50/60 transition-colors', onRowClick && 'cursor-pointer')}
                >
                  {columns.map(col => (
                    <td key={col.key} className={clsx('table-td', col.className)}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {total !== undefined && onPageChange && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
