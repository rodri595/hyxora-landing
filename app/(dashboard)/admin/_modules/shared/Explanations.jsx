"use client";

import { cn } from "@/utils";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hx:cerebro:explanations";

/**
 * Whether every panel shows its description and methodology notes, or keeps them
 * behind its ⓘ.
 *
 * The default outside a provider is "shown", so a Panel rendered anywhere else keeps
 * the behaviour it always had.
 */
const ExplanationsContext = createContext({ shown: true, toggle: undefined });

/**
 * Per-panel: whether this panel's notes are open, and how a note tells the panel it
 * exists — so the ⓘ appears on a panel whose only prose is a footnote.
 */
export const PanelNoteContext = createContext({ visible: true, register: undefined });

export const useExplanations = () => useContext(ExplanationsContext);

/**
 * Holds the explanations switch for one dashboard.
 *
 * Cerebro is read by two audiences: people who want the numbers, and the team, who
 * also want to know how each one is computed and where it is known to be wrong. The
 * prose is for the second group and was drowning the first, so it starts folded and
 * the switch is remembered per browser — anyone who wants it on sets it once.
 *
 * Read after mount rather than in the initializer: the server has no storage, and a
 * different first render on the client is a hydration mismatch.
 */
export const ExplanationsProvider = ({ children }) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    try {
      setShown(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Blocked storage just means the default.
    }
  }, []);

  const toggle = useCallback(() => {
    const next = !shown;
    setShown(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // Still toggles for this visit.
    }
  }, [shown]);

  const value = useMemo(() => ({ shown, toggle }), [shown, toggle]);

  return <ExplanationsContext.Provider value={value}>{children}</ExplanationsContext.Provider>;
};

/** The dashboard-wide switch. Renders nothing outside a provider. */
export const ExplanationsToggle = ({ className }) => {
  const { shown, toggle } = useExplanations();
  if (!toggle) return null;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={shown}
      onClick={toggle}
      title="Muestra en cada panel cómo se calcula y sus limitaciones conocidas"
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-[rgba(25,54,63,0.75)] transition-colors hover:text-[#19363F]",
        className
      )}
    >
      <span
        className={cn(
          "relative h-3.5 w-6 shrink-0 rounded-full transition-colors",
          shown ? "bg-[#19363F]" : "bg-[rgba(25,54,63,0.2)]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
            shown && "translate-x-2.5"
          )}
        />
      </span>
      Explicaciones
    </button>
  );
};

/**
 * The ⓘ next to a panel title, shown only while explanations are folded.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClick
 */
export const ExplanationButton = ({ open, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={open}
    aria-label={open ? "Ocultar explicación" : "Ver cómo se calcula"}
    title={open ? "Ocultar explicación" : "Ver cómo se calcula"}
    className={cn(
      "inline-flex size-5 shrink-0 items-center justify-center self-center rounded-full transition-colors",
      open
        ? "bg-[#19363F] text-white"
        : "text-[rgba(25,54,63,0.68)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F]"
    )}
  >
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.2v3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.85" fill="currentColor" />
    </svg>
  </button>
);

/**
 * A methodology footnote: how a figure is computed, what the endpoint can't do.
 * Folds with the panel's explanation.
 *
 * Only for prose that explains. A line carrying a figure of its own — a share, a
 * change over the window — or warning that the data is partial is part of the answer
 * and stays a plain paragraph, always visible.
 *
 * @param {Object} props
 * @param {string} [props.className] Spacing only; the type style is fixed here.
 * @param {React.ReactNode} props.children
 */
export const PanelNote = ({ className, children }) => {
  const { visible, register } = useContext(PanelNoteContext);

  useEffect(() => register?.(), [register]);

  if (!visible) return null;

  return (
    <p
      className={cn(
        "font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.68)]",
        className
      )}
    >
      {children}
    </p>
  );
};
