import axios from 'axios';

let accessToken = '';

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HTTPOnly cookies
});

// Request Interceptor: Attach Access Token if it exists
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 and attempt token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the response was a 401 due to access token expiry, and we haven't retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data &&
      error.response.data.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Trigger token refresh endpoint (HTTPOnly cookie is sent automatically)
        const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = response.data.accessToken;

        // Save new token in-memory
        setAccessToken(newAccessToken);

        // Update Authorization header and retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear token and dispatch event for AuthProvider to log out
        setAccessToken('');
        window.dispatchEvent(new Event('auth-session-expired'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
