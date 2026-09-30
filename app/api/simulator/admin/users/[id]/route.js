import { db, simTransactions, simUsers } from "@/db";
import { authErrorResponse, requireAdmin } from "@/lib/simulator/auth";
import { eq } from "drizzle-orm";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const updates = {};

    if (body.role !== undefined) {
      if (body.role !== "user" && body.role !== "admin") {
        return Response.json({ error: "role must be 'user' or 'admin'" }, { status: 400 });
      }
      updates.role = body.role;
    }

    if (body.status !== undefined) {
      if (body.status !== "active" && body.status !== "suspended") {
        return Response.json({ error: "status must be 'active' or 'suspended'" }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.initialBalanceCents !== undefined) {
      if (!Number.isInteger(body.initialBalanceCents) || body.initialBalanceCents < 0) {
        return Response.json(
          { error: "initialBalanceCents must be a non-negative integer" },
          { status: 400 }
        );
      }
      updates.initialBalanceCents = body.initialBalanceCents;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }
    updates.updatedAt = new Date();

    const updated = await db.update(simUsers).set(updates).where(eq(simUsers.id, id)).returning();

    if (updated.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ data: { user: updated[0] } });
  } catch (err) {
    const res = authErrorResponse(err);
    if (res) return res;
    throw err;
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const existing = await db.select().from(simUsers).where(eq(simUsers.id, id)).limit(1);
    if (existing.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Explicit two-step delete: libSQL has FK cascade off by default.
    await db.delete(simTransactions).where(eq(simTransactions.userId, id));
    await db.delete(simUsers).where(eq(simUsers.id, id));

    return Response.json({ data: { deleted: true } });
  } catch (err) {
    const res = authErrorResponse(err);
    if (res) return res;
    throw err;
  }
}
