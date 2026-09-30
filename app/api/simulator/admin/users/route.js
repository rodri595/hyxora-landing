import { db, simTransactions, simUsers } from "@/db";
import { authErrorResponse, requireAdmin } from "@/lib/simulator/auth";
import { eq, sql } from "drizzle-orm";

export async function GET(request) {
  try {
    await requireAdmin(request);

    // Single LEFT JOIN + GROUP BY: per-user tx count and ledger net (no N+1).
    const rows = await db
      .select({
        id: simUsers.id,
        email: simUsers.email,
        wallet: simUsers.wallet,
        role: simUsers.role,
        status: simUsers.status,
        initialBalanceCents: simUsers.initialBalanceCents,
        createdAt: simUsers.createdAt,
        updatedAt: simUsers.updatedAt,
        txCount: sql`COUNT(${simTransactions.id})`.mapWith(Number),
        ledgerNetCents: sql`COALESCE(SUM(CASE
          WHEN ${simTransactions.type} IN ('sell', 'deposit') THEN ${simTransactions.amountCents}
          WHEN ${simTransactions.type} IN ('buy', 'withdrawal') THEN -${simTransactions.amountCents}
          ELSE 0 END), 0)`.mapWith(Number),
      })
      .from(simUsers)
      .leftJoin(simTransactions, eq(simUsers.id, simTransactions.userId))
      .groupBy(simUsers.id);

    const users = rows.map(({ ledgerNetCents, ...user }) => ({
      ...user,
      cashBalanceCents: user.initialBalanceCents + ledgerNetCents,
    }));

    return Response.json({ data: { users } });
  } catch (err) {
    const res = authErrorResponse(err);
    if (res) return res;
    throw err;
  }
}
