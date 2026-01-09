// services/laravelApp.js

import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_LARAVEL_URL}/api`;

const laravelApp = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-App-Token': process.env.CLIENT_ACCESS_TOKEN,
    },
});

// Request Interceptor (optional for dynamic token updates)
laravelApp.interceptors.request.use(
    (config) => {
        config.headers['X-App-Token'] = process.env.CLIENT_ACCESS_TOKEN;
        return config;
    },
    (error) => Promise.reject(error)
);

export default laravelApp;
