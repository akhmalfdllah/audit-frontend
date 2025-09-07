import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // ini penting agar cookie refresh token terkirim
})

let isRefreshing = false
let failedQueue: {
  resolve: (token: string | null) => void
  reject: (err: any) => void
}[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch(error => Promise.reject(error))
      }

      isRefreshing = true

      const originalError = err

      try {
        await axios.post("http://localhost:3000/auth/refresh", {}, { withCredentials: true })
        isRefreshing = false
        processQueue(null)
        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        processQueue(refreshError, null)
        window.location.href = "/login"
        return Promise.reject(originalError) // <== kirim error awal, bukan error refresh
      }

    }

    return Promise.reject(err)
  }
)

export default api
