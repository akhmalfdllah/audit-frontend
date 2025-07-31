// src/lib/api.ts
import axios from "axios"

const instance = axios.create({
  baseURL: "http://localhost:3000", // Ganti jika backend URL berbeda
  withCredentials: true,            // Untuk mengirim dan menerima cookie
})

export default instance
