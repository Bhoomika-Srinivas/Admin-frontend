import { useState } from 'react'

interface UseConfirmDialogReturn<T> {
  isOpen: boolean
  targetId: T | null
  open: (id: T) => void
  close: () => void
}

export function useConfirmDialog<T = string>(): UseConfirmDialogReturn<T> {
  const [targetId, setTargetId] = useState<T | null>(null)

  return {
    isOpen: targetId !== null,
    targetId,
    open: (id: T) => setTargetId(id),
    close: () => setTargetId(null),
  }
}
