import { authClient } from "@/utils/axios";

export function useAuth() {
    const authenticate = async (jwt) => {
        const response = await authClient.post(
            "/login",
            {},
            { headers: { Authorization: jwt } }
        );
        if (response.data?.data?.jwt) {
            sessionStorage.setItem("jwt", response.data.data.jwt);
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
