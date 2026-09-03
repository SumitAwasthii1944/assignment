import axios from "axios"

const API_BASE = (import.meta.env.VITE_API_URI as string) || "http://localhost:8000"

const axiosInstance = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    withCredentials: true,
})

//refresh state so parallel 401s don't trigger multiple refresh calls
let isRefreshing = false
let failedQueue: { resolve: (value?: unknown) => void; reject: (err: unknown) => void }[] = []

const processQueue = (error: unknown) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error)
        else resolve()
    })
    failedQueue = []
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: any) => {
        const originalRequest = error.config

        // Network level failures (no server response at all) have no error.response.
        // Don't attempt a refresh/retry cycle for these, just reject.
        if (!error.response) {
            return Promise.reject(new Error(error.message || "Network error"))
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes("/refresh-token")) {
                return Promise.reject(error)
            }

            // Don't try to refresh if we're checking auth on the login page itself 
            // a 401 there just means "not logged in", not "session expired".
            const onLoginPage = window.location.pathname.startsWith("/login")

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(() => axiosInstance(originalRequest))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                await axiosInstance.post("/users/refresh-token")
                processQueue(null)
                return axiosInstance(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError)
                // Only force-navigate if we're not already on /login 
                // otherwise this causes an infinite reload loop.
                if (!onLoginPage) {
                    window.location.href = "/login"
                }
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        const message =
            error.response?.data?.message || error.message || "Something went wrong"
        return Promise.reject(new Error(message))
    }
)

export default axiosInstance

