"use client";

import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const SCROLL_OFFSET = -110;
// Reading line for "current section": tied to SCROLL_OFFSET (not viewport
// height) so the highlight always agrees with where rail clicks land, and
// section 1 stays current at scroll 0 on any screen size.
const ACTIVE_OFFSET = -SCROLL_OFFSET + 24;

const SectionRail = () => {
  const wrapRef = useRef(null);
  const railRef = useRef(null);
  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const thumbRef = useRef(null);
  const thumbDotRef = useRef(null);
  const chipRef = useRef(null);
  const chipTextRef = useRef(null);
  const scrimRef = useRef(null);
  const barRef = useRef(null);
  const tickRefs = useRef([]);
  const labelRefs = useRef([]);

  const dataRef = useRef({
    els: [],
    propY: [],
    evenY: [],
    tops: [],
    trackH: 0,
    limit: 1,
  });
  const settersRef = useRef(null);
  const idleRef = useRef(null);
  const expandTlRef = useRef(null);
  const expandedRef = useRef(false);
  const chipShownRef = useRef(false);
  const lastScrollRef = useRef(null);

  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const measure = () => {
    const d = dataRef.current;
    if (!railRef.current) return;
    const els = Array.from(document.querySelectorAll("[data-rail]"));
    const limit = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    d.els = els;
    d.trackH = railRef.current.clientHeight;
    d.limit = limit;
    d.propY = [];
    d.evenY = [];
    d.tops = [];
    els.forEach((el, i) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      d.propY.push(gsap.utils.clamp(0, 1, top / limit) * d.trackH);
      d.evenY.push(els.length > 1 ? (i / (els.length - 1)) * d.trackH : 0);
      d.tops.push(top - ACTIVE_OFFSET);
    });
  };

  const getActiveIndex = (scroll) => {
    const { tops, limit } = dataRef.current;
    if (!tops.length) return 0;
    // At the end of the page there may not be enough scroll left for the
    // last (short) sections to ever reach the reading line.
    if (scroll >= limit - 2) return tops.length - 1;
    let index = 0;
    for (let i = 0; i < tops.length; i += 1) {
      if (scroll >= tops[i]) index = i;
    }
    return index;
  };

  useGSAP(() => {
    measure();
    setItems(
      dataRef.current.els.map((el) => ({
        label: el.dataset.rail,
        accent: el.hasAttribute("data-rail-accent"),
      }))
    );
  });

  const { contextSafe } = useGSAP(
    (_context, ctxSafe) => {
      if (!items.length) return;
      measure();
      const d = dataRef.current;
      const limit = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = gsap.utils.clamp(0, 1, window.scrollY / limit);
      lastScrollRef.current = window.scrollY;

      gsap.set(fillRef.current, {
        xPercent: -50,
        scaleY: progress,
        transformOrigin: "top center",
      });
      gsap.set(thumbRef.current, {
        xPercent: -50,
        yPercent: -50,
        y: progress * d.trackH,
      });
      gsap.set(chipRef.current, { yPercent: -50, x: 8, autoAlpha: 0 });
      gsap.set(scrimRef.current, { autoAlpha: 0 });
      gsap.set(barRef.current, {
        scaleX: progress,
        transformOrigin: "left center",
      });
      tickRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { xPercent: -50, yPercent: -50, y: d.propY[i] });
      });
      for (const el of labelRefs.current) {
        if (el) gsap.set(el, { yPercent: -50, x: 12, autoAlpha: 0 });
      }
      setActiveIndex(getActiveIndex(window.scrollY));

      settersRef.current = {
        fill: gsap.quickTo(fillRef.current, "scaleY", {
          duration: 0.4,
          ease: "power3",
        }),
        thumb: gsap.quickTo(thumbRef.current, "y", {
          duration: 0.4,
          ease: "power3",
        }),
        stretch: gsap.quickTo(thumbDotRef.current, "scaleY", {
          duration: 0.3,
          ease: "power2.out",
        }),
        bar: gsap.quickTo(barRef.current, "scaleX", {
          duration: 0.4,
          ease: "power3",
        }),
        showChip: ctxSafe(() => {
          gsap.to(chipRef.current, {
            x: 0,
            autoAlpha: 1,
            duration: 0.35,
            ease: "power3.out",
            overwrite: "auto",
          });
        }),
      };

      idleRef.current = gsap
        .delayedCall(
          1.6,
          ctxSafe(() => {
            chipShownRef.current = false;
            gsap.to(chipRef.current, {
              x: 8,
              autoAlpha: 0,
              duration: 0.5,
              ease: "power2.in",
              overwrite: "auto",
            });
          })
        )
        .pause();

      // Single reusable timeline: play() to expand, reverse() to collapse.
      // Rapid hover in/out scrubs the same timeline, so no orphaned staggers.
      const expandTl = gsap.timeline({ paused: true });
      expandTl.to(
        [fillRef.current, thumbRef.current],
        { autoAlpha: 0, duration: 0.25, ease: "power2.out" },
        0
      );
      expandTl.to(scrimRef.current, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0);
      tickRefs.current.forEach((el, i) => {
        if (el) {
          expandTl.to(
            el,
            { y: () => d.evenY[i], duration: 0.7, ease: "expo.out" },
            0.02 + i * 0.012
          );
        }
      });
      labelRefs.current.forEach((el, i) => {
        if (el) {
          expandTl.to(
            el,
            { x: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" },
            0.06 + i * 0.018
          );
        }
      });
      expandTlRef.current = expandTl;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ delay: 0.35 })
          .set(wrapRef.current, { autoAlpha: 1 })
          .from(trackRef.current, {
            scaleY: 0,
            transformOrigin: "top center",
            duration: 1.1,
            ease: "expo.inOut",
          })
          .from(
            tickRefs.current.filter(Boolean),
            {
              scale: 0,
              duration: 0.6,
              ease: "back.out(2.5)",
              stagger: 0.025,
            },
            "-=0.55"
          )
          .from(thumbRef.current, { scale: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.4")
          // Greeting: reveal the current-section chip, then hand off to the
          // same idle timer that tucks it away after normal scrolling.
          .to(
            chipRef.current,
            {
              x: 0,
              autoAlpha: 1,
              duration: 0.45,
              ease: "power3.out",
              onComplete: () => {
                chipShownRef.current = true;
                idleRef.current?.restart(true);
              },
            },
            "-=0.15"
          );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(wrapRef.current, { autoAlpha: 1 });
      });

      const onLayoutChange = () => {
        measure();
        const p = gsap.utils.clamp(
          0,
          1,
          window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
        );
        // Reset to the collapsed frame so the timeline re-records fresh
        // start/end positions on its next play().
        expandedRef.current = false;
        if (scrimRef.current) scrimRef.current.style.pointerEvents = "none";
        expandTl.progress(0).pause();
        expandTl.invalidate();
        tickRefs.current.forEach((el, i) => {
          if (el) gsap.set(el, { y: d.propY[i] });
        });
        gsap.set(fillRef.current, { scaleY: p });
        gsap.set(thumbRef.current, { y: p * d.trackH });
        gsap.set(barRef.current, { scaleX: p });
      };
      let raf = 0;
      const requestLayout = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(onLayoutChange);
      };
      window.addEventListener("resize", requestLayout);
      const observer = new ResizeObserver(requestLayout);
      observer.observe(document.body);

      return () => {
        window.removeEventListener("resize", requestLayout);
        observer.disconnect();
        cancelAnimationFrame(raf);
        mm.revert();
      };
    },
    { scope: wrapRef, dependencies: [items.length] }
  );

  useGSAP(
    () => {
      if (!items.length || !chipShownRef.current) return;
      gsap.fromTo(
        chipTextRef.current,
        { y: 7, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }
      );
    },
    { dependencies: [activeIndex] }
  );

  const lenis = useLenis((instance) => {
    const s = settersRef.current;
    const d = dataRef.current;
    if (!s || !d.els.length) return;
    const progress = gsap.utils.clamp(0, 1, instance.scroll / Math.max(instance.limit, 1));

    // Lenis emits on init/refresh with no user input; only a real scroll
    // delta should surface the chip or restart the idle hide timer.
    const prev = lastScrollRef.current;
    lastScrollRef.current = instance.scroll;
    const scrolled = prev !== null && Math.abs(instance.scroll - prev) > 0.5;

    s.fill(progress);
    s.thumb(progress * d.trackH);
    s.bar(progress);
    s.stretch(gsap.utils.clamp(1, 1.6, 1 + Math.abs(instance.velocity) * 0.012));

    if (scrolled && !expandedRef.current) {
      if (!chipShownRef.current) {
        chipShownRef.current = true;
        s.showChip();
      }
      idleRef.current?.restart(true);
    }

    setActiveIndex(getActiveIndex(instance.scroll));
  });

  const expand = contextSafe(() => {
    const tl = expandTlRef.current;
    if (!tl || !dataRef.current.els.length) return;
    // Keep the scrim interactive while open so hovering the labels (or the
    // gaps between them) never counts as leaving the nav.
    if (scrimRef.current) scrimRef.current.style.pointerEvents = "auto";
    if (expandedRef.current) return;
    expandedRef.current = true;
    chipShownRef.current = false;
    idleRef.current?.pause();
    gsap.to(chipRef.current, {
      x: 8,
      autoAlpha: 0,
      duration: 0.2,
      ease: "power2.in",
      overwrite: "auto",
    });
    tl.timeScale(1).play();
  });

  const collapse = contextSafe(() => {
    const tl = expandTlRef.current;
    if (!tl || !expandedRef.current) return;
    expandedRef.current = false;
    if (scrimRef.current) scrimRef.current.style.pointerEvents = "none";
    tl.timeScale(1.35).reverse();
  });

  const scrollToSection = (index) => {
    const el = dataRef.current.els[index];
    if (!el || !lenis) return;
    lenis.scrollTo(el, { offset: SCROLL_OFFSET, duration: 1.4 });
  };

  const active = items[activeIndex] || null;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.75 lg:hidden"
        aria-hidden="true"
      >
        <div
          ref={barRef}
          className="h-full w-full origin-left scale-x-0 bg-primary1 shadow-[0_0_10px_rgba(45,104,255,0.5)]"
        />
      </div>

      <nav
        ref={wrapRef}
        aria-label="Secciones del documento"
        className="invisible fixed top-1/2 right-2 z-30 hidden -translate-y-1/2 py-8 pr-3 pl-12 opacity-0 lg:block"
        onMouseEnter={expand}
        onMouseLeave={collapse}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) collapse();
        }}
      >
        <div
          ref={scrimRef}
          className="pointer-events-none absolute -inset-y-12 -left-64 right-0 bg-linear-to-l from-b-surface1 from-55% via-b-surface1/90 to-transparent"
        />

        <div ref={railRef} className="relative h-[min(58vh,560px)] w-6">
          <div
            ref={trackRef}
            className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 rounded-full bg-stroke1"
          />
          <div
            ref={fillRef}
            className="absolute top-0 left-1/2 h-full w-0.5 rounded-full bg-primary1 shadow-[0_0_12px_rgba(45,104,255,0.55)]"
          />

          {items.map((item, i) => {
            const isActive = i === activeIndex;
            const isPassed = i < activeIndex;
            return (
              <button
                key={item.label}
                ref={(el) => {
                  tickRefs.current[i] = el;
                }}
                type="button"
                onClick={() => scrollToSection(i)}
                onFocus={expand}
                aria-label={`Ir a la sección: ${item.label}`}
                aria-current={isActive ? "true" : undefined}
                className="group absolute top-0 left-1/2 flex h-5 w-10 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus/60"
              >
                <span
                  className={cn(
                    "relative block h-[2.5px] rounded-full transition-[background-color,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-5",
                    item.accent
                      ? "w-3.5 bg-primary2 shadow-[0_0_8px_rgba(0,166,86,0.5)]"
                      : isActive
                        ? "w-5 bg-primary1 shadow-[0_0_8px_rgba(45,104,255,0.55)]"
                        : isPassed
                          ? "w-2.5 bg-primary1/50"
                          : "w-2.5 bg-t-tertiary/50"
                  )}
                >
                  {item.accent && !isActive && (
                    <span className="absolute top-1/2 left-1/2 h-2.5 w-2.5 animate-[rail-ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-primary2/40" />
                  )}
                </span>
                <span
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                  className="absolute top-1/2 right-full mr-2 flex items-baseline gap-1.5 whitespace-nowrap py-1"
                >
                  <span className="text-[9px] font-medium tabular-nums text-t-tertiary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-medium tracking-[-0.01em] transition-colors duration-300",
                      item.accent
                        ? "text-primary2"
                        : isActive
                          ? "text-t-primary"
                          : "text-t-secondary group-hover:text-t-primary"
                    )}
                  >
                    {item.label}
                  </span>
                </span>
              </button>
            );
          })}

          <div
            ref={thumbRef}
            className="pointer-events-none absolute top-0 left-1/2 flex h-5 w-5 items-center justify-center"
          >
            <span
              ref={thumbDotRef}
              className="block h-3 w-3 rounded-full border-2 border-primary1 bg-b-surface2 shadow-[0_0_10px_rgba(45,104,255,0.6)]"
            />
            <div
              ref={chipRef}
              className={cn(
                "absolute top-1/2 right-full mr-4 flex items-center rounded-full border bg-b-surface2/90 px-3.5 py-2 whitespace-nowrap shadow-hover backdrop-blur-md",
                active?.accent ? "border-primary2/40" : "border-stroke1"
              )}
            >
              <span ref={chipTextRef} className="flex items-baseline gap-2">
                <span className="text-[9px] font-semibold tabular-nums tracking-[0.08em] text-t-tertiary">
                  {String(activeIndex + 1).padStart(2, "0")}
                  <span className="opacity-50">/{String(items.length).padStart(2, "0")}</span>
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold tracking-[-0.01em]",
                    active?.accent ? "text-primary2" : "text-t-primary"
                  )}
                >
                  {active?.label}
                </span>
              </span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SectionRail;
