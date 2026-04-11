import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://qkart-backend.onrender.com/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000, // 5 seconds timeout
});

api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired — clear storage and redirect to login
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;