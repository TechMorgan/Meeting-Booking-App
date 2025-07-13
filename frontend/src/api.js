import axios from 'axios';

const api = axios.create({
  baseURL: 'https://anudip-production.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // Exclude token from /login and /register requests
  const noAuthRoutes = ['/login', '/register', '/admin-login'];
  const isAuthRoute = noAuthRoutes.some(route => config.url.endsWith(route));

  if (token && !isAuthRoute) {
    config.headers.Authorization = token;
  }

  return config;
});

export default api;
