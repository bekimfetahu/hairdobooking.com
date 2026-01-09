// services/laravelApi.js
import axios from 'axios';

// Base API Setup
const API_BASE_URL = `${process.env.NEXT_PUBLIC_LARAVEL_URL}/api`; // Laravel backend URL

const laravelApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies for Laravel Sanctum
});

// Request Interceptor
laravelApi.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
laravelApi.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default laravelApi;

