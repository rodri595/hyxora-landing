"use client";

import { useCallback, useEffect, useState } from "react";

// SHA-256 of the passphrase, never the passphrase itself. The word is not in
// the bundle, so searching the shipped JS for it finds nothing — which is the
// point of the extra step, since the query param alone travels in links,
// browser history and referrer headers.
//
// To rotate it without a code change, put a new digest in NEXT_PUBLIC_DEVTOOLS_HASH:
//   node -e "console.log(require('crypto').createHash('sha256').update('nueva').digest('hex'))"
const KEY_HASH =
  process.env.NEXT_PUBLIC_DEVTOOLS_HASH ||
  "68706a94a135904a933e82f3c0945416a523e18a3bec12231fa7829e991f3c88";

// Deliberately not "devtools": a param named after what it opens is the first
// thing anyone tries.
const PARAM = "hx";
const UNLOCK_KEY = "hyxora:hx";

const STATUS = { LOCKED: "locked", PROMPT: "prompt", UNLOCKED: "unlocked" };

const sha256Hex = async (value) => {
  // Available on HTTPS and on localhost. Anywhere else there is no way to check
  // the passphrase, and staying locked is the right failure.
  if (!globalThis.crypto?.subtle) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Three states, one path through them, and the same path in every environment.
 *
 * `?hx=1` opens the passphrase prompt; a correct passphrase latches the unlock
 * in localStorage so it survives reloads and navigation. `?hx=0` clears it.
 *
 * There is no NODE_ENV bypass on purpose: the previous version short-circuited
 * to "enabled" in development *before* reading the param, so `?hx=0` could
 * never turn anything off on a dev server. Dev and prod behave identically now,
 * and the passphrase only has to be typed once per browser.
 *
 * What this is: a lock on the UI, so the button is not discoverable by anyone
 * who notices a query param. What it is not: a security boundary. The digest
 * ships in the bundle and localStorage is editable, so a determined person gets
 * past it. The actual authorisation is the gateway rejecting a request that
 * carries no admin session — that is what makes this safe, not the passphrase.
 */
export const useDevToolAccess = () => {
  const [status, setStatus] = useState(STATUS.LOCKED);

  useEffect(() => {
    let param = null;
    try {
      param = new URLSearchParams(window.location.search).get(PARAM);
    } catch {
      param = null;
    }

    // Checked first and unconditionally, so locking always works — including on
    // a dev server, and including while already unlocked.
    if (param === "0") {
      try {
        localStorage.removeItem(UNLOCK_KEY);
      } catch {
        // Nothing stored means nothing to clear.
      }
      setStatus(STATUS.LOCKED);
      return;
    }

    if (readStorage(UNLOCK_KEY) === KEY_HASH) {
      setStatus(STATUS.UNLOCKED);
      return;
    }

    setStatus(param === "1" ? STATUS.PROMPT : STATUS.LOCKED);
  }, []);

  /** @return {Promise<boolean>} whether the passphrase was accepted. */
  const unlock = useCallback(async (passphrase) => {
    const digest = await sha256Hex(passphrase.trim().toLowerCase());
    if (digest !== KEY_HASH) return false;
    try {
      // Storing the digest rather than a truthy flag, so the value has to be
      // the real one — setting the key to "1" by hand does nothing.
      localStorage.setItem(UNLOCK_KEY, KEY_HASH);
    } catch {
      // Unlocked for this page load only; it just will not be remembered.
    }
    setStatus(STATUS.UNLOCKED);
    return true;
  }, []);

  const lock = useCallback(() => {
    try {
      localStorage.removeItem(UNLOCK_KEY);
    } catch {
      // Already gone.
    }
    setStatus(STATUS.LOCKED);
  }, []);

  const dismiss = useCallback(() => setStatus(STATUS.LOCKED), []);

  return { status, unlock, lock, dismiss };
};

export { STATUS };
