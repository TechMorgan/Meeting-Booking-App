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
    const fullUrl = new URL(
      config.url,
      config.url.startsWith('http') ? undefined : api.defaults.baseURL
    );
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

    // --- Handle 401 (Token expired) ---
    const shouldRetry401 =
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith('/refresh-token');

    if (shouldRetry401) {
      originalRequest._retry = true;

      try {
        const refreshRes = await api.post('/refresh-token');
        const newAccessToken = refreshRes.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔁 Refresh token failed:', refreshError);

        try {
          await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5s
          const retryRefresh = await api.post('/refresh-token');
          const retryToken = retryRefresh.data.accessToken;
          localStorage.setItem('accessToken', retryToken);
          originalRequest.headers.Authorization = `Bearer ${retryToken}`;
          return api(originalRequest);
        } catch (secondError) {
          console.error('🔁 Retry refresh failed:', secondError);
          localStorage.removeItem('accessToken');
          window.location.href = '/';
        }
      }
    }

    // --- Handle 500 (cold start, internal error) ---
    const shouldRetry500 =
      err.response?.status === 500 &&
      !originalRequest._retry500;

    if (shouldRetry500) {
      originalRequest._retry500 = true;
      console.warn('🔁 Retrying request due to 500 error (cold start suspected)...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s
      return api(originalRequest);
    }

    return Promise.reject(err);
  }
);

export default api;
