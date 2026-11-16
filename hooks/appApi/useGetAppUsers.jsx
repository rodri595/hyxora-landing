import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import appApiClient from "@/utils/appApiAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { AppApiUser } from "./types" */

/** `limit` has no server cap; 1000 is every account today in one request. */
const PAGE_SIZE = 1000;
const MAX_PAGES = 10;

/**
 * GET /admin/users, every page — the app backend's own user list.
 *
 * Read for what Cerebro's `/users` lacks: the profile name (`firstName`,
 * `lastName`, `name`) and the live membership block (start, last renewal,
 * interval, payment type, cancel date), added in hyxora-app-backend #206 for the
 * CRM export. Cerebro mirrors users into its own Postgres through `sync-users` and
 * does not copy those columns, so they exist only here.
 *
 * Pages until a page comes back empty, never until one comes back short — the same
 * rule as the Cerebro sweep. The proxy projects each row down to the fields above.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<{ users: AppApiUser[], total: number | null, truncated: boolean }>}
 */
export const useGetAppUsers = ({ enabled: wanted = true } = {}) => {
  const { enabled, privyId } = useAppApiAccess();

  return useQuery({
    queryKey: ["appApi", "users", privyId],
    queryFn: async () => {
      const byId = new Map();
      let total = null;
      let truncated = true;

      for (let page = 0; page < MAX_PAGES; page += 1) {
        const response = await appApiClient.get("/admin/users", {
          params: { limit: PAGE_SIZE, offset: byId.size },
        });
        const body = response?.data?.data ?? {};
        const users = Array.isArray(body.users) ? body.users : [];
        if (Number.isFinite(Number(body.total))) total = Number(body.total);

        for (const user of users) byId.set(user?._id ?? `row-${byId.size}`, user);

        if (users.length === 0 || (total !== null && byId.size >= total)) {
          truncated = false;
          break;
        }
      }

      return { users: [...byId.values()], total, truncated };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: enabled && wanted,
  });
};
