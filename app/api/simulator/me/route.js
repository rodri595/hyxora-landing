import { authErrorResponse, requireUser } from "@/lib/simulator/auth";
import { getCashBalanceCents, getHoldings } from "@/lib/simulator/ledger";

export async function GET(request) {
  try {
    const user = await requireUser(request);
    const [cashBalanceCents, holdings] = await Promise.all([
      getCashBalanceCents(user),
      getHoldings(user.id),
    ]);
    return Response.json({ data: { user, cashBalanceCents, holdings } });
  } catch (err) {
    const res = authErrorResponse(err);
    if (res) return res;
    throw err;
  }
}
