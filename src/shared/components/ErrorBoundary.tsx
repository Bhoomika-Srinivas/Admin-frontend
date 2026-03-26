import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught rendering error:', error)
    console.error('[ErrorBoundary] Component stack:', info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h2 className="text-lg font-display font-bold text-slate-800 mb-1">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-1">An unexpected error occurred while rendering this page.</p>
        {this.state.error?.message && (
          <p className="text-xs font-mono text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2 max-w-md break-all">
            {this.state.error.message}
          </p>
        )}
        <button
          onClick={() => window.location.reload()}
          className="btn-primary mt-6"
        >
          Reload Page
        </button>
      </div>
    )
  }
}
