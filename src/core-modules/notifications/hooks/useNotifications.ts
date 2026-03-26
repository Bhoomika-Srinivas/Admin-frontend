// Wraps the existing notificationService — extend with GraphQL when backend is ready
import { notificationService } from '../api/notificationsApi'
// Hook implementation TBD
export function useNotificationsHook() {
  // TODO: implement with useEffect + state
  return { notificationService }
}
