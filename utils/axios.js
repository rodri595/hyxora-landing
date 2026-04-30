import axios from "axios";

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HYXORA_API,
  withCredentials: !isLocalhost,
});

// Add request interceptor to include JWT token for localhost
apiClient.interceptors.request.use(
  (config) => {
    if (isLocalhost) {
      const jwt = sessionStorage.getItem("jwt");
      if (jwt) {
        config.headers.Authorization = `Bearer ${jwt}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
