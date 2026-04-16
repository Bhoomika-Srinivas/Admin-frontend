import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toastConfig: Record<
  ToastType,
  { borderColor: string; iconColor: string; bgColor: string; Icon: React.ElementType }
> = {
  success: {
    borderColor: 'border-l-emerald-500',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    Icon: CheckCircle,
  },
  error: {
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
    Icon: XCircle,
  },
  warning: {
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
    Icon: AlertTriangle,
  },
  info: {
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    Icon: Info,
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutsRef = useRef<number[]>([])

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id))
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts(prev => [...prev, { id, type, message }])

      const timeoutId = window.setTimeout(() => {
        removeToast(id)
      }, 3500)

      timeoutsRef.current.push(timeoutId)
    },
    [removeToast]
  )

  const contextValue: ToastContextValue = {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    warning: (message: string) => addToast('warning', message),
    info: (message: string) => addToast('info', message),
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Fixed toast container — bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => {
          const { borderColor, iconColor, Icon } = toastConfig[toast.type]
          return (
            <div
              key={toast.id}
              className={`bg-white shadow-lg rounded-xl border border-slate-200 border-l-4 ${borderColor} px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-sm pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300`}
            >
              <Icon className={`${iconColor} mt-0.5 shrink-0`} size={18} />
              <p className="flex-1 text-sm text-slate-700 leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
