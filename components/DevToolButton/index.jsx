"use client";

import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import DevAction from "./DevAction";
import UnlockPanel from "./UnlockPanel";
import { DEV_ACTIONS, DEV_ACTION_GROUPS } from "./actions";
import { STATUS, useDevToolAccess } from "./useDevToolAccess";

gsap.registerPlugin(useGSAP);

// Above every z-index in the app (the tallest is z-[999]) and above anything a
// third-party widget parks on top of us, without being INT_MAX — leaving room
// means a future overlay can still be put over this one deliberately.
const Z_INDEX = 2147483000;

const STORAGE_KEY = "hyxora:devtool:pos";
const MARGIN = 12;
const FAB_SIZE = 40;
// Below this, a pointerup is a click; above it, the gesture was a drag. Touch
// never holds perfectly still, so 0 would make the button impossible to tap and
// 20 would swallow deliberate short drags.
const DRAG_THRESHOLD = 5;

// Apple's "response" for a critically damped UI spring is 0.3–0.4s. GSAP has no
// spring ease, and power3 with no overshoot is the honest equivalent: nothing
// here is momentum-driven, so nothing should bounce.
const OPEN_DURATION = 0.34;
const CLOSE_DURATION = 0.22;
const SLIDE_DURATION = 0.42;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clampToViewport = (x, y, el) => {
  const w = el?.offsetWidth ?? FAB_SIZE;
  const h = el?.offsetHeight ?? FAB_SIZE;
  const maxX = Math.max(MARGIN, window.innerWidth - w - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - h - MARGIN);
  return {
    x: Math.min(Math.max(x, MARGIN), maxX),
    y: Math.min(Math.max(y, MARGIN), maxY),
  };
};

// Worst state wins: one failing action should be visible on the collapsed
// button even when another succeeded after it.
const summariseTones = (tones) => {
  const values = Object.values(tones);
  if (values.includes("pending")) return "pending";
  if (values.includes("error")) return "error";
  if (values.includes("success")) return "success";
  return "idle";
};

const TONE_DOT = {
  pending: "animate-pulse bg-[#F5A524]",
  success: "bg-[#17C964]",
  error: "bg-[#F31260]",
  idle: "bg-[#2F363C]",
};

const Chevron = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const DevToolButton = () => {
  const { status, unlock, lock, dismiss } = useDevToolAccess();

  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const listPaneRef = useRef(null);
  const detailPaneRef = useRef(null);
  const dragRef = useRef(null);

  const [pos, setPos] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [tones, setTones] = useState({});

  const unlocked = status === STATUS.UNLOCKED;
  const selected = useMemo(
    () => DEV_ACTIONS.find((action) => action.id === selectedId) ?? null,
    [selectedId]
  );

  // Restore the saved corner before paint, so the button doesn't flash at the
  // default spot and then jump to where it was left.
  useLayoutEffect(() => {
    if (!unlocked) return;
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      saved = null;
    }
    const fallback = { x: window.innerWidth - 64, y: window.innerHeight - 140 };
    const start = saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? saved : fallback;
    setPos(clampToViewport(start.x, start.y, wrapperRef.current));
  }, [unlocked]);

  // A window that shrank (rotation, devtools opening) can strand the button
  // off-screen with no way left to drag it back.
  useEffect(() => {
    if (!unlocked) return undefined;
    const onResize = () =>
      setPos((current) =>
        current ? clampToViewport(current.x, current.y, wrapperRef.current) : current
      );
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [unlocked]);

  const persist = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Not worth surfacing: the button still works, it just forgets its spot.
    }
  }, []);

  // Stable, so DevAction's reporting effect doesn't refire on every render here.
  const onToneChange = useCallback((id, tone) => {
    setTones((current) => (current[id] === tone ? current : { ...current, [id]: tone }));
  }, []);

  // Set the panel's hidden resting state exactly once, when the node first
  // mounts. A dependency-driven effect can't do this: `pos` changes on every
  // drag frame, and re-running would snap an open panel shut mid-gesture.
  const attachPanel = useCallback((node) => {
    panelRef.current = node;
    if (node && !node.dataset.gsapReady) {
      node.dataset.gsapReady = "1";
      gsap.set(node, { autoAlpha: 0, scale: 0.92, y: 6 });
    }
  }, []);

  // Enter and exit along the same path, anchored at the button — a panel that
  // grows out of its trigger and shrinks back into it reads as one object.
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      const reduced = prefersReducedMotion();
      gsap.to(panel, {
        autoAlpha: panelOpen ? 1 : 0,
        scale: panelOpen ? 1 : 0.92,
        y: panelOpen ? 0 : 6,
        duration: reduced ? 0 : panelOpen ? OPEN_DURATION : CLOSE_DURATION,
        ease: panelOpen ? "power3.out" : "power2.in",
        // Always resolve from the live on-screen value, so toggling mid-flight
        // reverses smoothly instead of jumping to the start of a new tween.
        overwrite: "auto",
      });
    },
    { dependencies: [panelOpen], scope: wrapperRef }
  );

  // List ↔ detail. The two panes sit side by side in a double-width track; the
  // viewport clips and takes the height of whichever pane is showing.
  useGSAP(
    () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      const pane = selectedId ? detailPaneRef.current : listPaneRef.current;
      if (!track || !viewport || !pane) return;
      const reduced = prefersReducedMotion();
      const duration = reduced ? 0 : SLIDE_DURATION;

      gsap.to(track, {
        xPercent: selectedId ? -50 : 0,
        duration,
        ease: "power3.inOut",
        overwrite: "auto",
      });
      gsap.to(viewport, {
        height: pane.offsetHeight,
        duration,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    },
    { dependencies: [selectedId, panelOpen], scope: wrapperRef }
  );

  // A response arriving makes the detail pane taller after the slide is over.
  // Without this the panel would clip its own output.
  useEffect(() => {
    if (!unlocked || !panelOpen) return undefined;
    const pane = selectedId ? detailPaneRef.current : listPaneRef.current;
    const viewport = viewportRef.current;
    if (!pane || !viewport) return undefined;

    const observer = new ResizeObserver(() => {
      gsap.to(viewport, {
        height: pane.offsetHeight,
        duration: prefersReducedMotion() ? 0 : 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
    observer.observe(pane);
    return () => observer.disconnect();
  }, [unlocked, panelOpen, selectedId]);

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    dragRef.current = {
      // Respect where the button was grabbed, so it doesn't jump to centre
      // itself under the pointer.
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > DRAG_THRESHOLD
    ) {
      drag.moved = true;
    }
    if (!drag.moved) return;
    setPos(
      clampToViewport(
        event.clientX - drag.offsetX,
        event.clientY - drag.offsetY,
        wrapperRef.current
      )
    );
  };

  const onPointerUp = (event) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (!drag) return;

    // Toggling from pointerup rather than onClick is what keeps a drag that
    // happens to end over the button from also opening the panel.
    if (drag.moved) {
      setPos((current) => {
        if (current) persist(current);
        return current;
      });
      return;
    }
    setPanelOpen((open) => !open);
  };

  if (status === STATUS.PROMPT) {
    return (
      <UnlockPanel
        onUnlock={unlock}
        onDismiss={dismiss}
        style={{ zIndex: Z_INDEX }}
        className="right-5 bottom-5"
      />
    );
  }

  if (!unlocked || !pos) return null;

  const tone = summariseTones(tones);
  // Flip the panel to whichever side has room, so a button parked against the
  // right edge doesn't push its own readout off-screen.
  const panelOnLeft = pos.x > window.innerWidth / 2;

  return (
    <div
      ref={wrapperRef}
      data-lenis-prevent
      style={{ left: pos.x, top: pos.y, zIndex: Z_INDEX }}
      className="fixed select-none"
    >
      <div
        ref={attachPanel}
        data-lenis-prevent
        style={{ transformOrigin: panelOnLeft ? "100% 100%" : "0% 100%" }}
        className={cn(
          "squircle invisible absolute bottom-0 w-[232px] overflow-hidden rounded-[40px] border border-[#24292D] bg-[#0D0D0D]/95 opacity-0 shadow-2xl backdrop-blur-xl",
          panelOnLeft ? "right-[50px]" : "left-[50px]",
          !panelOpen && "pointer-events-none"
        )}
      >
        <div className="flex h-[38px] items-center gap-1 border-[#1B2024] border-b px-2">
          {selected ? (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="-ml-1 flex shrink-0 items-center gap-0.5 rounded px-1 py-1 text-[#7A838C] transition-colors hover:text-white"
              aria-label="Volver"
            >
              <Chevron className="size-3 rotate-180" />
            </button>
          ) : (
            <span className="w-[18px] shrink-0" aria-hidden="true" />
          )}

          <span className="min-w-0 flex-1 truncate text-center font-semibold text-[11px] text-white tracking-[-0.01em]">
            {selected ? selected.label : "Herramientas"}
          </span>

          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="flex w-[18px] shrink-0 justify-center text-[#7A838C] text-[13px] leading-none transition-colors hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div ref={viewportRef} style={{ height: 0 }} className="overflow-hidden">
          <div ref={trackRef} className="flex w-[200%] items-start">
            <div
              ref={listPaneRef}
              data-lenis-prevent
              className="max-h-[58vh] w-1/2 overflow-y-auto px-2 py-2"
            >
              {DEV_ACTION_GROUPS.map((group) => (
                <div key={group.id} className="mb-1.5 last:mb-0">
                  <p className="px-1.5 pb-1 font-semibold text-[9px] text-[#5A626A] uppercase tracking-[0.06em]">
                    {group.label}
                  </p>
                  <div className="squircle overflow-hidden rounded-[10px] bg-white/[0.03]">
                    {group.actions.map((action, index) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => setSelectedId(action.id)}
                        className={cn(
                          "flex w-full items-center gap-2 px-2 py-[7px] text-left transition-[background-color,transform] duration-100 hover:bg-white/[0.05] active:scale-[0.98]",
                          index > 0 && "border-[#1B2024] border-t"
                        )}
                      >
                        <span
                          className={cn(
                            "size-[5px] shrink-0 rounded-full",
                            TONE_DOT[tones[action.id] ?? "idle"]
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] text-white leading-[1.3]">
                            {action.label}
                          </span>
                          <span className="block truncate text-[9px] text-[#5A626A] leading-[1.3]">
                            {action.detail}
                          </span>
                        </span>
                        <Chevron className="size-2.5 shrink-0 text-[#3F464D]" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* So turning this off never depends on remembering a query
                  param — which is exactly what was broken before. */}
              <button
                type="button"
                onClick={lock}
                className="mt-1.5 w-full rounded-[8px] py-1.5 text-[9px] text-[#5A626A] transition-colors hover:text-[#F31260]"
              >
                Bloquear en este navegador
              </button>
            </div>

            <div
              ref={detailPaneRef}
              data-lenis-prevent
              className="max-h-[58vh] w-1/2 overflow-y-auto px-3 py-2.5"
            >
              {DEV_ACTIONS.map((action) => (
                <DevAction
                  key={action.id}
                  action={action}
                  active={action.id === selectedId}
                  onToneChange={onToneChange}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // Lenis owns touch on the document; without this the drag scrolls the
        // page instead of moving the button.
        style={{ touchAction: "none" }}
        className={cn(
          "squircle flex size-[40px] items-center justify-center rounded-[40px] border-2 bg-[#0D0D0D]/95 shadow-xl backdrop-blur-xl transition-[border-color,transform] duration-100 active:scale-[0.94]",
          dragging ? "cursor-grabbing" : "cursor-grab",
          tone === "pending" && "border-[#F5A524]",
          tone === "success" && "border-[#17C964]",
          tone === "error" && "border-[#F31260]",
          tone === "idle" && "border-[#24292D] hover:border-[#3F464D]"
        )}
        title="Herramientas internas — clic para abrir, arrastra para mover"
      >
        {tone === "pending" ? (
          <span className="size-[14px] animate-spin rounded-full border-2 border-[#F5A524] border-t-transparent" />
        ) : (
          <span className="font-bold text-[9px] text-white leading-none tracking-[-0.02em]">
            DEV
          </span>
        )}
      </button>
    </div>
  );
};

export default DevToolButton;
