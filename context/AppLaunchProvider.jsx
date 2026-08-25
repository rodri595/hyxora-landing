"use client";

import { HYXORA_APP_URL } from "@/constants/links";
import { useLogin } from "@privy-io/react-auth";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Privy keeps every `useLogin` callback in one shared list, so registering
// `onComplete` once here fires for logins started anywhere in the app —
// header, mobile menu, hero CTAs — without touching those call sites.

// How long the avatar hint stays up once the app tab actually opened. If the
// tab was blocked the hint has no timeout: it is the user's way in.
const HINT_TIMEOUT_MS = 20_000;

// Routes where signing in is a step inside something the user is already doing
// — submitting the quiz, opening a gated page — rather than the end of the
// funnel. Stealing focus with a new tab there would interrupt them.
const SILENT_ROUTES = ["/quiz", "/academy", "/admin", "/comite", "/nfts", "/profile"];

const AppLaunchContext = createContext({
  hintOpen: false,
  tabBlocked: false,
  openApp: () => {},
  dismissHint: () => {},
});

export const AppLaunchProvider = ({ children }) => {
  const pathname = usePathname();
  const [hintOpen, setHintOpen] = useState(false);
  const [tabBlocked, setTabBlocked] = useState(false);
  const timeoutRef = useRef(null);

  const clearHintTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearHintTimeout, [clearHintTimeout]);

  const dismissHint = useCallback(() => {
    clearHintTimeout();
    setHintOpen(false);
  }, [clearHintTimeout]);

  // Returns false when the browser swallowed the tab — popup blockers hand
  // back null for a `window.open` that isn't a direct user gesture, and the
  // OAuth flows land back here after a redirect with no gesture left.
  const launchApp = useCallback(() => {
    const tab = window.open(HYXORA_APP_URL, "_blank", "noopener");
    const opened = Boolean(tab);
    setTabBlocked(!opened);
    return opened;
  }, []);

  // Called from the hint's button: a real click, so it is never blocked.
  const openApp = useCallback(() => {
    launchApp();
    dismissHint();
  }, [launchApp, dismissHint]);

  const loginCallbacks = useMemo(
    () => ({
      onComplete: ({ wasAlreadyAuthenticated }) => {
        // Fires on mount for an already-signed-in user — that is not a login.
        if (wasAlreadyAuthenticated) return;
        if (SILENT_ROUTES.some((route) => pathname?.startsWith(route))) return;

        const opened = launchApp();
        setHintOpen(true);
        clearHintTimeout();
        if (opened) {
          timeoutRef.current = setTimeout(() => setHintOpen(false), HINT_TIMEOUT_MS);
        }
      },
    }),
    [launchApp, clearHintTimeout, pathname]
  );

  useLogin(loginCallbacks);

  const value = useMemo(
    () => ({ hintOpen, tabBlocked, openApp, dismissHint }),
    [hintOpen, tabBlocked, openApp, dismissHint]
  );

  return <AppLaunchContext.Provider value={value}>{children}</AppLaunchContext.Provider>;
};

export const useAppLaunch = () => useContext(AppLaunchContext);
