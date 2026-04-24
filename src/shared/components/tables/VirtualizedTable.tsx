import { useRef, useState, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import EmptyState from '../common/EmptyState'
import { Column } from './DataTable'

interface VirtualizedTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  rowHeight?: number
  maxHeight?: number
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
}

/** Virtualized table for large datasets (1000+ rows) */
export default function VirtualizedTable<T>({
  columns,
  data,
  keyExtractor,
  rowHeight = 48,
  maxHeight = 600,
  onRowClick,
  emptyTitle,
  emptyDescription,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
    enabled: mounted,
  })

  const virtualItems = virtualizer.getVirtualItems()

  if (data.length === 0) {
    return (
      <div className="py-12">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto border border-slate-200 rounded-lg"
      style={{ height: Math.min(data.length * rowHeight + 48, maxHeight) }}
    >
      <table className="w-full text-left">
        <thead className="bg-slate-50 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`table-th ${col.className || ''}`}
                style={{ width: col.className?.includes('w-') ? undefined : 'auto' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className="divide-y divide-slate-100 relative"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualItems.map((virtualItem) => {
            const row = data[virtualItem.index]
            return (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`hover:bg-slate-50/60 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } absolute w-full`}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`table-td ${col.className || ''}`}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
