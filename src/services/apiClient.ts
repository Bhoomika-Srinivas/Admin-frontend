import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { getCurrentToken } from '@/api/cognitoClient'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is required')
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor - get token from Cognito (memory, not localStorage)
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getCurrentToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor - handle 401
let isRedirecting = false
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// CRUD helpers
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

export default apiClient
