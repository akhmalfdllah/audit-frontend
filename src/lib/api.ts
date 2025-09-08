import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((error) => Promise.reject(error));
      }

      isRefreshing = true;

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        processQueue(null);

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("force-logout"));
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
