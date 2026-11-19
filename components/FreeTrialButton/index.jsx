"use client";

import { HYXORA_APP_URL } from "@/constants/links";
import { haptic } from "@/utils/haptics";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

// Late enough that the hero's own entrance has landed, so the two don't compete.
const ENTER_DELAY = 0.9;
// Rest between idle beats (sheen + the gift lid hopping), so it calls for
// attention now and then instead of fidgeting.
const BEAT_REST = 4.5;

// Every marketing page mounts its own Layout, so without this the pill would
// replay its entrance on each navigation. Once per visit is enough.
let hasEntered = false;

/**
 * «Un mes gratis en Premium» (Nov 2026): new sign-ups get a free month of
 * Premium instead of the old Freemium, so this only needs to send people to the
 * app — it grants the month on registration, and an existing account is asked
 * to subscribe there.
 *
 *   0.00  the pill rises out of a blur
 *   0.18  it unfolds from a circle at its centre, Dynamic Island style
 *   0.30  the gift chip lands with an overshoot
 *   0.38  the copy rises in, line by line; the arrow and the shadow follow
 *
 * then it idles: every few seconds a sheen crosses it and the gift's lid hops.
 * Hovering lifts the lid and swaps the arrow. Reduced motion only fades in.
 */
const FreeTrialButton = () => {
  const root = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      // GSAP writes SVG transforms itself, so the hinge is set here, not in CSS:
      // the lid tips open from its bottom-left corner instead of spinning.
      gsap.set(q("[data-lid], [data-lid-hover]"), { transformOrigin: "0% 100%" });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to(root.current, {
          autoAlpha: 1,
          duration: 0.3,
          delay: hasEntered ? 0 : ENTER_DELAY,
        });
        hasEntered = true;
        return;
      }

      const beat = () =>
        gsap
          .timeline({ repeat: -1, repeatDelay: BEAT_REST })
          .fromTo(
            q("[data-sheen]"),
            { opacity: 1, xPercent: -100 },
            { xPercent: 100, duration: 1.2, ease: "power2.inOut" },
            0
          )
          .to(q("[data-lid]"), { rotate: -20, y: -2.5, duration: 0.22, ease: "power2.out" }, 0.15)
          .to(q("[data-lid]"), { rotate: 0, y: 0, duration: 0.5, ease: "bounce.out" }, 0.37);

      if (hasEntered) {
        gsap.set(root.current, { autoAlpha: 1 });
        beat();
        return;
      }

      const [pill] = q("[data-pill]");
      // Collapsed to a circle as tall as the pill, around its centre. Measured
      // in px, so the clip keeps its round ends however wide the copy is.
      const h = pill.offsetHeight;
      const side = Math.max(0, (pill.offsetWidth - h) / 2);

      const tl = gsap.timeline({
        delay: ENTER_DELAY,
        defaults: { ease: "expo.out" },
        onComplete: () => {
          hasEntered = true;
        },
      });

      tl.fromTo(
        root.current,
        { autoAlpha: 0, y: 28, scale: 0.9, filter: "blur(8px)" },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.7,
          clearProps: "transform,filter",
        },
        0
      )
        .fromTo(
          pill,
          { clipPath: `inset(0px ${side}px round ${h}px)` },
          {
            clipPath: `inset(0px 0px round ${h}px)`,
            duration: 0.9,
            clearProps: "clipPath",
          },
          0.18
        )
        .from(
          q("[data-chip]"),
          { scale: 0.6, rotate: -25, duration: 0.6, ease: "back.out(2.2)" },
          0.3
        )
        .from(
          q("[data-line]"),
          {
            autoAlpha: 0,
            y: 8,
            filter: "blur(4px)",
            duration: 0.5,
            stagger: 0.07,
            clearProps: "all",
          },
          0.38
        )
        .from(q("[data-arrow]"), { autoAlpha: 0, x: -10, duration: 0.5, clearProps: "all" }, 0.55)
        // The clip would cut a shadow off the pill itself, so it lives on a
        // plate behind it and arrives once the pill has opened.
        .from(q("[data-plate]"), { opacity: 0, duration: 0.6 }, 0.6);

      // Scheduled now rather than from onComplete, so it belongs to this
      // context and is killed with it on unmount.
      beat().delay(ENTER_DELAY + tl.duration() + 0.8);
    },
    { scope: root }
  );

  // Its own group, nested over the one the beat moves, so a hover never fights
  // the idle loop for the same transform.
  const peek = contextSafe((open) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(root.current.querySelector("[data-lid-hover]"), {
      rotate: open ? -24 : 0,
      y: open ? -3 : 0,
      duration: open ? 0.3 : 0.45,
      ease: open ? "back.out(2)" : "bounce.out",
      overwrite: "auto",
    });
  });

  return (
    <div
      ref={root}
      className="group/cta invisible fixed inset-x-0 bottom-5 z-5 mx-auto w-fit max-w-[calc(100%-124px)] max-md:bottom-3"
    >
      <span
        data-plate
        aria-hidden="true"
        className="absolute inset-0 rounded-full shadow-[0_12px_28px_-10px_rgba(25,54,63,0.6)] transition-shadow duration-200 ease-out group-hover/cta:shadow-[0_18px_36px_-10px_rgba(25,54,63,0.7)]"
      />
      <a
        data-pill
        href={HYXORA_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic("medium")}
        onMouseEnter={() => peek(true)}
        onMouseLeave={() => peek(false)}
        className="group/pill relative flex items-center gap-3 overflow-hidden rounded-full border border-white/15 bg-[#19363f] p-1.5 font-inter text-white shadow-[inset_0_0_12px_rgba(255,255,255,0.28)] transition-[translate,scale,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-[inset_0_0_16px_rgba(255,255,255,0.36)] focus-visible:outline-2 focus-visible:outline-[#1b5ffd] focus-visible:outline-offset-2 active:scale-[0.97] max-md:gap-2.5 max-md:pr-3.5 max-[359px]:pl-3.5"
      >
        <span
          data-sheen
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,0.2)_50%,transparent_70%)] opacity-0"
        />

        <span
          data-chip
          aria-hidden="true"
          className="relative grid size-10 shrink-0 place-items-center rounded-full border border-white/20 bg-[#1b5ffd] shadow-[inset_0_0_10px_rgba(255,255,255,0.4)] max-md:size-8 max-[359px]:hidden"
        >
          <GiftIcon className="size-5 max-md:size-4" />
        </span>

        {/* Two lines on a phone — the hook, then the detail — and one sentence
            from md up. The space between them is for screen readers: flex drops
            it from layout, but without it the name reads «gratisen». */}
        <span className="relative flex min-w-0 flex-col text-left leading-tight tracking-[-0.3px] md:flex-row md:gap-[0.28em] md:whitespace-nowrap md:pr-1">
          <span
            data-line
            className="font-semibold text-[13px] md:font-normal md:text-[15px] md:text-white/80"
          >
            Disfruta de <strong className="font-semibold text-white">un mes gratis</strong>
          </span>{" "}
          <span data-line className="text-[11.5px] text-white/75 md:text-[15px] md:text-white/80">
            en <strong className="font-semibold text-white">Premium</strong> para probar HYXORA
          </span>
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </span>

        {/* Two arrows: on hover the first leaves up and right while the second
            arrives from below left, so the arrow seems to go and come back. */}
        <span
          data-arrow
          aria-hidden="true"
          className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-[#19363f] max-md:hidden"
        >
          <ArrowIcon className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/pill:translate-x-5 group-hover/pill:-translate-y-5" />
          <ArrowIcon className="absolute size-4 -translate-x-5 translate-y-5 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/pill:translate-x-0 group-hover/pill:translate-y-0" />
        </span>
      </a>
    </div>
  );
};

const GiftIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={`overflow-visible ${className}`}
  >
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M12 12v9" />
    <g data-lid-hover>
      <g data-lid>
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v4M12 8C11 5.5 9.6 3.5 7.5 3.5a2.25 2.25 0 0 0 0 4.5M12 8c1-2.5 2.4-4.5 4.5-4.5a2.25 2.25 0 0 1 0 4.5" />
      </g>
    </g>
  </svg>
);

const ArrowIcon = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M5 11l6-6M6 5h5v5" />
  </svg>
);

export default FreeTrialButton;
