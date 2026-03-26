import { RouterProvider } from 'react-router-dom'
import { router } from './router/router'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ToastProvider } from '@/shared/context/ToastContext'
import { NotificationProvider } from '@/shared/context/NotificationContext'

// Reads the current user from AuthContext and passes their id to NotificationProvider.
// Must be rendered inside AuthProvider.
function AppWithProviders() {
  const { user } = useAuth()
  return (
    <NotificationProvider userId={user.id}>
      <RouterProvider router={router} />
    </NotificationProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppWithProviders />
      </ToastProvider>
    </AuthProvider>
  )
}
