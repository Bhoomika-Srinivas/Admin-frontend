import Modal, { ModalFooter } from './Modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
}

export default function ConfirmDialog({
  open, onClose, onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Confirm',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center gap-4 pb-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
          <AlertTriangle size={28} className={variant === 'danger' ? 'text-red-600' : 'text-amber-600'} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
        >
          {confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  )
}
