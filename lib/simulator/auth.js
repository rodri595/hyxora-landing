import { db, simUsers } from "@/db";
import { eq } from "drizzle-orm";
import { createRemoteJWKSet, jwtVerify } from "jose";

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

// Privy access tokens are ES256 JWTs signed with the app's rotating keys.
const JWKS = createRemoteJWKSet(new URL(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`));

// Thrown by requireUser/requireAdmin; routes translate .status into a Response.
export class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

// Returns a Response for AuthErrors, or null so the caller can rethrow.
export function authErrorResponse(err) {
  if (err instanceof AuthError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  return null;
}

function getTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    for (const part of cookieHeader.split(";")) {
      const [name, ...rest] = part.trim().split("=");
      if (name === "privy-token") {
        return decodeURIComponent(rest.join("="));
      }
    }
  }

  return null;
}

function getAdminDids() {
  return (process.env.SIMULATOR_ADMIN_DIDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Verifies the Privy access token, provisions the sim_users row on first login,
 * and returns the current user row. Client-supplied data (email/wallet) is stored
 * as display metadata only and can NEVER change role or balance.
 */
export async function requireUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new AuthError("Missing authentication token", 401);
  }

  let did;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: "privy.io",
      audience: appId,
    });
    did = payload.sub;
  } catch {
    throw new AuthError("Invalid authentication token", 401);
  }

  if (!did) {
    throw new AuthError("Invalid authentication token", 401);
  }

  // Display metadata supplied by the client — never influences role/balance.
  const email = request.headers.get("x-user-email") || null;
  const wallet = request.headers.get("x-user-wallet") || null;

  const existing = await db.select().from(simUsers).where(eq(simUsers.id, did)).limit(1);

  if (existing.length === 0) {
    // Admin bootstrap: DID comes from the verified token, so it cannot be spoofed.
    // Admins are provisioned active so they can manage the whitelist; everyone else
    // relies on the schema defaults (role "user", status "suspended") until activated.
    const values = getAdminDids().includes(did)
      ? { id: did, email, wallet, role: "admin", status: "active" }
      : { id: did, email, wallet };
    const inserted = await db.insert(simUsers).values(values).returning();
    return inserted[0];
  }

  const user = existing[0];

  // Refresh display metadata when the client provides newer values.
  if ((email && email !== user.email) || (wallet && wallet !== user.wallet)) {
    const updated = await db
      .update(simUsers)
      .set({
        email: email || user.email,
        wallet: wallet || user.wallet,
        updatedAt: new Date(),
      })
      .where(eq(simUsers.id, did))
      .returning();
    return updated[0];
  }

  return user;
}

export async function requireAdmin(request) {
  const user = await requireUser(request);
  if (user.role !== "admin") {
    throw new AuthError("Forbidden", 403);
  }
  return user;
}
