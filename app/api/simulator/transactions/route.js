import { db, simTransactions } from "@/db";
import { authErrorResponse, requireUser } from "@/lib/simulator/auth";
import { getCashBalanceCents, getHeldUnits } from "@/lib/simulator/ledger";
import { and, desc, eq, lt } from "drizzle-orm";

export async function GET(request) {
  try {
    const user = await requireUser(request);

    const { searchParams } = new URL(request.url);
    let limit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 50;
    limit = Math.min(limit, 200);

    const cursorRaw = searchParams.get("cursor");
    const cursor = cursorRaw ? Number.parseInt(cursorRaw, 10) : null;

    const conditions = [eq(simTransactions.userId, user.id)];
    if (cursor && Number.isFinite(cursor)) {
      conditions.push(lt(simTransactions.id, cursor));
    }

    const transactions = await db
      .select()
      .from(simTransactions)
      .where(and(...conditions))
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

export async function POST(request) {
  try {
    const user = await requireUser(request);

    if (user.status === "suspended") {
      return Response.json({ error: "Account suspended" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { type, symbol, address, amountCents, units, priceUsd, note } = body;

    // deposit/withdrawal are admin-only flows; reject them here.
    if (type !== "buy" && type !== "sell") {
      return Response.json({ error: "type must be 'buy' or 'sell'" }, { status: 400 });
    }
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return Response.json({ error: "amountCents must be a positive integer" }, { status: 400 });
    }
    if (!symbol || typeof symbol !== "string") {
      return Response.json({ error: "symbol is required" }, { status: 400 });
    }
    if (typeof units !== "number" || !Number.isFinite(units) || units <= 0) {
      return Response.json({ error: "units must be a positive number" }, { status: 400 });
    }

    const tokenAddress = typeof address === "string" && address ? address : null;

    if (type === "buy") {
      const balance = await getCashBalanceCents(user);
      if (amountCents > balance) {
        return Response.json({ error: "Insufficient balance" }, { status: 409 });
      }
    } else {
      const held = await getHeldUnits(user.id, symbol, tokenAddress);
      if (units > held + 1e-9) {
        return Response.json({ error: "Insufficient units" }, { status: 409 });
      }
    }

    const inserted = await db
      .insert(simTransactions)
      .values({
        userId: user.id,
        type,
        symbol,
        address: tokenAddress,
        amountCents,
        units,
        priceUsd: typeof priceUsd === "number" ? priceUsd : null,
        note: typeof note === "string" ? note : null,
      })
      .returning();

    const cashBalanceCents = await getCashBalanceCents(user);

    return Response.json({ data: { transaction: inserted[0], cashBalanceCents } });
  } catch (err) {
    const res = authErrorResponse(err);
    if (res) return res;
    throw err;
  }
}
