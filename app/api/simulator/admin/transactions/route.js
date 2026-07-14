import { db, simTransactions, simUsers } from "@/db";
import { authErrorResponse, requireAdmin } from "@/lib/simulator/auth";
import { and, desc, eq, lt } from "drizzle-orm";

export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    let limit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 50;
    limit = Math.min(limit, 200);

    const cursorRaw = searchParams.get("cursor");
    const cursor = cursorRaw ? Number.parseInt(cursorRaw, 10) : null;

    const userId = searchParams.get("userId");

    const conditions = [];
    if (cursor && Number.isFinite(cursor)) {
      conditions.push(lt(simTransactions.id, cursor));
    }
    if (userId) {
      conditions.push(eq(simTransactions.userId, userId));
    }

    // Single LEFT JOIN attaches each tx's user email/wallet (no N+1).
    const transactions = await db
      .select({
        id: simTransactions.id,
        userId: simTransactions.userId,
        userEmail: simUsers.email,
        userWallet: simUsers.wallet,
        type: simTransactions.type,
        symbol: simTransactions.symbol,
        amountCents: simTransactions.amountCents,
        units: simTransactions.units,
        priceUsd: simTransactions.priceUsd,
        note: simTransactions.note,
        createdAt: simTransactions.createdAt,
      })
      .from(simTransactions)
      .leftJoin(simUsers, eq(simTransactions.userId, simUsers.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(simTransactions.id))
      .limit(limit);

    const nextCursor =
      transactions.length === limit ? transactions[transactions.length - 1].id : null;

    return Response.json({ data: { transactions, nextCursor } });
  } catch (err) {
    const res = authErrorResponse(err);
    if (res) return res;
    throw err;
  }
}
