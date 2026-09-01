import { authClient } from "@/utils/axios";

export function useAuth() {
  const authenticate = async (jwt) => {
    const response = await authClient.post(
      "/login",
      {},
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    if (response.data?.token) {
      sessionStorage.setItem("jwt", response.data.token);
    }
    return response.data;
  };

  const invalidateSession = async () => {
    const response = await authClient.post("/logout", {});
    sessionStorage.removeItem("jwt");
    return response.data;
  };

  return { authenticate, invalidateSession };
}
