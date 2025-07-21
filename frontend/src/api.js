import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // required to send cookies (refreshToken)
});

// Public routes where accessToken is not required
const noAuthRoutes = ['/login', '/register', '/admin-login', '/refresh-token'];

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  let pathname = '';
  try {
	const fullUrl = new URL(config.url, config.url.startsWith('http') ? undefined : window.location.origin);
	pathname = fullUrl.pathname;
  } catch (e) {
    console.warn('URL parse error:', config.url);
  }

  const isPublic = noAuthRoutes.some(route => pathname.endsWith(route));

  if (token && !isPublic && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

// ✅ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  res => res,
  async (err) => {
    const originalRequest = err.config;

    const shouldRetry =
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith('/refresh-token');

    if (shouldRetry) {
      originalRequest._retry = true;

      try {
        // Request new access token using refresh token
        const refreshRes = await api.post('/refresh-token');
        const newAccessToken = refreshRes.data.accessToken;

        // Save to localStorage
        localStorage.setItem('accessToken', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔁 Refresh token failed:', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/'; // Redirect to home or login
      }
    }

    return Promise.reject(err);
  }
);

export default api;
