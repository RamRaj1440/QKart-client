import axios from "axios";

const api = axios.create({
    baseURL: "https://qkart-server-fkju.onrender.com/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 60000,
});

// ── Request Interceptor ────────────────────────────────
api.interceptors.request.use(
    (config) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "null");
            if (user?.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch {
            // Ignore parse errors
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;