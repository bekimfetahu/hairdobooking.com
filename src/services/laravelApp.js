// services/laravelApp.js

import axios from 'axios';

if (typeof window !== 'undefined') {
    // Warn instead of throwing so developer tooling or HMR doesn't hard-fail in unusual bundling setups.
    // This is a protective hint: `laravelApp` is intended for server-side use (SSR/route handlers).
    // For browser requests, use `laravelApi` which includes `withCredentials` and expects cookie auth.
    // Keep the guard non-fatal to avoid crashing dev HMR in mixed environments.
    // eslint-disable-next-line no-console
    console.warn('Warning: laravelApp was imported in a browser environment. Use laravelApi for client requests.');
}

const API_BASE_URL = `${process.env.LARAVEL_INTERNAL_URL || process.env.NEXT_PUBLIC_LARAVEL_URL}/api`;

const laravelApp = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
