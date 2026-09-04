import axios from "axios"

const API_BASE = (import.meta.env.VITE_API_URI as string) || "http://localhost:8000"

const axiosInstance = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    withCredentials: true,
})

export default axiosInstance