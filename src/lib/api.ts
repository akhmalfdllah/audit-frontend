import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // WAJIB
});

// Kalau token invalid → frontend paksa logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new Event("force-logout"));
    }
    return Promise.reject(err);
  }
);

export default api;
