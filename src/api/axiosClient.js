// src/api/axiosClient.js
import axios from "axios";
import { appConfig } from "../config/appConfig";

const axiosClient = axios.create({
    baseURL: appConfig.baseURL,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => response.data, // return only the data
    async (error) => {
        if (error.response?.status === 401) {
            // Optionally refresh token or redirect to login
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
