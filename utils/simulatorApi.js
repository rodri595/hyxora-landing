import { getAccessToken } from "@privy-io/react-auth";
import axios from "axios";

const simulatorClient = axios.create({ baseURL: "/api/simulator" });

simulatorClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default simulatorClient;
