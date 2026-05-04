import axios from "axios";

const isDev = process.env.NODE_ENV === "development";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HYXORA_API,
  withCredentials: !isDev,
});

// Add request interceptor to include JWT token in development
apiClient.interceptors.request.use(
  (config) => {
    if (isDev) {
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
