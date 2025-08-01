import axios from "axios"

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true, // ini penting agar cookie refresh token terkirim
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
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

      try {
        await axios.post(
          "http://localhost:3000/auth/refresh",
          {},
          { withCredentials: true }
        )

        isRefreshing = false
        processQueue(null)

        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        processQueue(refreshError, null)
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(err)
  }
)

export default api
