import { authClient, readSessionJwt } from "@/utils/axios";

export function useAuth() {
  const authenticate = async (jwt) => {
    const response = await authClient.post(
      "/login",
      {},
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    // Mirrored in every environment, not just dev: the cookie the gateway sets
    // is third-party on a Netlify origin and may never be stored, and this is
    // the credential `apiClient` and `gatewayAdminClient` fall back to.
    const session = readSessionJwt(response.data);
    if (session) {
      sessionStorage.setItem("jwt", session);
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
