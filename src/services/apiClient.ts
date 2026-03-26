import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Generic CRUD helpers ─────────────────────────────────────────────────────
export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  apiClient.get<T>(url, config).then((r) => r.data)

export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.post<T>(url, data, config).then((r) => r.data)

export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.put<T>(url, data, config).then((r) => r.data)

export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.patch<T>(url, data, config).then((r) => r.data)

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  apiClient.delete<T>(url, config).then((r) => r.data)

// ─── Endpoint builders ────────────────────────────────────────────────────────
export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    list: '/users',
    create: '/users',
    get: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  departments: {
    list: '/departments',
    create: '/departments',
    get: (id: string) => `/departments/${id}`,
    update: (id: string) => `/departments/${id}`,
    delete: (id: string) => `/departments/${id}`,
  },
  news: {
    list: '/news',
    create: '/news',
    get: (id: string) => `/news/${id}`,
    update: (id: string) => `/news/${id}`,
    delete: (id: string) => `/news/${id}`,
    publish: (id: string) => `/news/${id}/publish`,
  },
  events: {
    list: '/events',
    create: '/events',
    get: (id: string) => `/events/${id}`,
    update: (id: string) => `/events/${id}`,
    delete: (id: string) => `/events/${id}`,
  },
  faculty: {
    list: '/faculty',
    create: '/faculty',
    get: (id: string) => `/faculty/${id}`,
    update: (id: string) => `/faculty/${id}`,
    delete: (id: string) => `/faculty/${id}`,
  },
  placements: {
    list: '/placements',
    create: '/placements',
    get: (id: string) => `/placements/${id}`,
    update: (id: string) => `/placements/${id}`,
    delete: (id: string) => `/placements/${id}`,
  },
  alumni: {
    list: '/alumni',
    create: '/alumni',
    get: (id: string) => `/alumni/${id}`,
    update: (id: string) => `/alumni/${id}`,
    delete: (id: string) => `/alumni/${id}`,
  },
  dashboard: {
    stats: '/dashboard/stats',
    recentActivity: '/dashboard/activity',
  },
}

export default apiClient
