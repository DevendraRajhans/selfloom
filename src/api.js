import axios from "axios";

// Fall back to localhost only if VITE_API_URL is missing
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/auth";
        }
        return Promise.reject(err);
    }
);

export default API;