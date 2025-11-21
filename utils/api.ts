// utils/api.ts
import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
    timeout: 10000,
});

// Tambahkan interceptor untuk handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);