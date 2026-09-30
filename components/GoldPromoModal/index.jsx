"use client";

import { HYXORA_APP_URL } from "@/constants/links";
import { haptic } from "@/utils/haptics";
import { useGSAP } from "@gsap/react";
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

// CustomEase parses at registration, which is browser-only work. Emil's strong
// ease-out — the curve Orbit calls `snap`, so the motion reads the same.
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("snap", "0.23,1,0.32,1");
}

// «Tu fidelidad es ORO»: anyone registered in the app by 30/10/2026 (Madrid)
// gets the monthly plan fee back in digital gold in Oct, Nov and Dec 2026.
// Once that day is over the invitation to sign up is moot, so it stops.
const PROMO_ENDS_AT = new Date("2026-10-30T00:00:00+02:00");
const STORAGE_KEY = "hyxora:promo-oro-2026";
// Late enough that the hero has landed and hydration (Privy included) is done,
// so the entrance isn't competing with page load for frames.
const OPEN_DELAY_MS = 2000;
const MONTHS = ["Oct", "Nov", "Dic"];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const wasDismissed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const rememberDismissal = () => {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Storage blocked (private mode): it simply shows again next visit.
  }
};

const svgUrl = (markup) => `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;

// A gold watercolour: pools of amber and rose over champagne, lit where the
// coin sits. The blotches are low-frequency noise thresholded into patches,
// like pigment pooling on paper; the grain is the paper itself.
const WASH = [
  "radial-gradient(38% 58% at 50% 40%, rgba(255,252,240,0.95), rgba(255,252,240,0) 70%)",
  "radial-gradient(55% 80% at 92% 4%, rgba(233,178,76,0.8), rgba(233,178,76,0) 70%)",
  "radial-gradient(60% 85% at 4% 100%, rgba(199,134,52,0.72), rgba(199,134,52,0) 72%)",
  "radial-gradient(45% 70% at 100% 100%, rgba(238,166,128,0.5), rgba(238,166,128,0) 70%)",
  "radial-gradient(40% 60% at 0% 0%, rgba(255,243,210,0.95), rgba(255,243,210,0) 70%)",
  "linear-gradient(165deg, #FBF0D4, #F3DCA6 50%, #E5BF76)",
].join(",");

const BLOTCHES = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="210"><filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.011" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 0.62 0 0 0 0 0.38 0 0 0 0 0.1 3 0 0 0 -1.3"/></filter><rect width="100%" height="100%" filter="url(#b)"/></svg>'
);

const GRAIN = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>'
);

// A conic sweep for the rim, so it catches the light as the coin turns in, and
// a radial dome for the face.
const COIN_RIM =
  "conic-gradient(from 210deg, #FBE6AA, #C9933F 14%, #FFF3CC 30%, #B37C2C 48%, #F0CF7A 64%, #BF8937 80%, #FBE6AA)";
const COIN_FACE = "radial-gradient(circle at 34% 28%, #FFF6DA, #F5D993 30%, #DFAF57 62%, #BD8433)";

const SPARKS = [
  { left: "24%", top: "18%", size: 12 },
  { left: "71%", top: "12%", size: 9 },
  { left: "76%", top: "46%", size: 14 },
  { left: "20%", top: "50%", size: 8 },
];

/**
 * The «Tu fidelidad es ORO» promo. Opens by itself once per visitor until the
 * sign-up deadline; `?promo` forces it open, to review it or link to it.
 */
const GoldPromoModal = () => {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).has("promo");
    if (!forced && (Date.now() >= PROMO_ENDS_AT.getTime() || wasDismissed())) return;
    const timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Headless UI unmounts the moment `open` turns false, so closing only flags
  // the exit; the surface plays it and hands back through `onLeft`.
  const close = () => {
    rememberDismissal();
    setLeaving(true);
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      className="relative z-[1001] focus:outline-none"
      data-lenis-prevent
    >
      <Surface
        leaving={leaving}
        onClose={close}
        onLeft={() => {
          setOpen(false);
          setLeaving(false);
        }}
      />
    </Dialog>
  );
};

/*
 * The flow is Orbit's finished step (ConnectDialog → SuccessMark + Burst):
 *
 *   0.00  the scrim fades up and the card grows in from 94%
 *   0.10  the gold blooms inside its frame
 *   0.30  the coin lands with an overshoot; its rim draws itself round
 *   0.42  the burst leaves the coin — a glow that swells and fades, a ring
 *         that travels past every edge — and a warm wash settles under
 *         the copy, so the finished card stays lit
 *   0.44  the copy rises in, staggered
 *   0.95  Oct → Nov → Dic light up in turn along the rail
 *
 * then it idles: the coin breathes, a glint crosses it (and «ORO» with it),
 * sparkles come and go. Reduced motion keeps the finished picture and drops
 * everything that travels.
 */
const Surface = ({ leaving, onClose, onLeft }) => {
  const backdrop = useRef(null);
  const shell = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap
          .timeline({ defaults: { duration: 0.25, ease: "power1.out" } })
          .from(backdrop.current, { opacity: 0 }, 0)
          .from(shell.current, { opacity: 0 }, 0);
        return;
      }

      const q = gsap.utils.selector(shell);
      const [coin] = q("[data-coin]");

      // Measured before anything moves, so the waves are placed in the card's
      // own unscaled space and come out of the coin's centre.
      const box = q("[data-burst]")[0].getBoundingClientRect();
      const dot = coin.getBoundingClientRect();
      const cx = dot.left + dot.width / 2 - box.left;
      const cy = dot.top + dot.height / 2 - box.top;
      // Far enough to clear the corner furthest from the coin.
      const radius = Math.hypot(Math.max(cx, box.width - cx), Math.max(cy, box.height - cy));
      gsap.set(q("[data-wave]"), {
        left: cx - radius,
        top: cy - radius,
        width: radius * 2,
        height: radius * 2,
      });

      const tl = gsap.timeline({ defaults: { ease: "snap" } });

      tl.from(backdrop.current, { opacity: 0, duration: 0.35, ease: "power1.out" }, 0)
        // Opaque long before it stops growing, so the page doesn't ghost through.
        .from(shell.current, { opacity: 0, duration: 0.28, ease: "power1.out" }, 0.04)
        .from(shell.current, { scale: 0.94, y: 16, duration: 0.6 }, 0.04)
        .from(q("[data-bloom]"), { opacity: 0, scale: 1.2, duration: 1.1 }, 0.1)
        .from(
          coin,
          { opacity: 0, scale: 0.3, rotate: -30, duration: 0.6, ease: "back.out(1.8)" },
          0.3
        )
        .from(q("[data-rim]"), { strokeDashoffset: 1, duration: 0.6, ease: "power2.out" }, 0.46)
        .from(
          q("[data-emblem]"),
          { opacity: 0, scale: 0.5, duration: 0.45, ease: "back.out(2.2)" },
          0.5
        )
        // Each wave grows fast and fades slow, so the eye follows it outward
        // instead of seeing a flash. The glow stays nearer the coin than
        // Orbit's: spread over a dark card, a gold haze reads as murk.
        .fromTo(
          q("[data-wave='glow']"),
          { opacity: 1, scale: 0.06 },
          { scale: 0.5, duration: 1, ease: "power2.out", immediateRender: false },
          0.42
        )
        .to(q("[data-wave='glow']"), { opacity: 0, duration: 0.7, ease: "power1.in" }, 0.55)
        .fromTo(
          q("[data-wave='ring']"),
          { opacity: 1, scale: 0.08 },
          { scale: 1.1, duration: 1.2, ease: "power2.out", immediateRender: false },
          0.5
        )
        .to(q("[data-wave='ring']"), { opacity: 0, duration: 0.7, ease: "power1.in" }, 0.9)
        // Gone once the ring has left, so no blend layer sits over the idle loop.
        .set(q("[data-burst]"), { display: "none" }, 1.6)
        .from(q("[data-wash]"), { opacity: 0, duration: 0.9, ease: "power1.out" }, 0.6)
        .from(
          q("[data-rise]"),
          { opacity: 0, y: 10, duration: 0.5, stagger: 0.06, clearProps: "opacity,transform" },
          0.44
        );

      // One month at a time: a node lands, then the rail fills on to the next.
      const fills = q("[data-fill]");
      q("[data-node]").forEach((node, i) => {
        const at = 0.95 + i * 0.34;
        if (i > 0) {
          tl.from(fills[i - 1], { scaleX: 0, duration: 0.32, ease: "power2.inOut" }, at - 0.3);
        }
        tl.from(
          node.querySelector("[data-lit]"),
          { opacity: 0, scale: 0.4, duration: 0.4, ease: "back.out(2)" },
          at
        )
          .fromTo(
            node.querySelector("[data-halo]"),
            { opacity: 0.55, scale: 1 },
            { opacity: 0, scale: 2.8, duration: 0.7, ease: "power2.out", immediateRender: false },
            at
          )
          .from(node.querySelector("[data-label]"), { opacity: 0.4, duration: 0.3 }, at);
      });

      gsap.to(coin, {
        y: -4,
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: tl.duration() - 0.4,
      });

      gsap
        .timeline({ delay: 1.5, repeat: -1, repeatDelay: 3.4 })
        .fromTo(
          q("[data-glint]"),
          { opacity: 1, xPercent: -100 },
          { xPercent: 100, duration: 1.1, ease: "power2.inOut" },
          0
        )
        .fromTo(
          q("[data-sheen]"),
          { backgroundPosition: "100% 50%" },
          { backgroundPosition: "0% 50%", duration: 1.1, ease: "power2.inOut" },
          0.1
        );

      q("[data-spark]").forEach((spark, i) => {
        gsap
          .timeline({ delay: 1 + i * 0.3, repeat: -1, repeatDelay: 1.4 + i * 0.55 })
          .fromTo(
            spark,
            { opacity: 0, scale: 0, rotate: -45 },
            { opacity: 1, scale: 1, rotate: 0, duration: 0.45, ease: "back.out(2)" }
          )
          .to(
            spark,
            { opacity: 0, scale: 0, rotate: 45, duration: 0.5, ease: "power2.in" },
            "+=0.25"
          );
      });
    },
    { scope: shell }
  );

  // Faster out than in, and `overwrite` so a close mid-entrance turns the
  // card round from wherever it has got to.
  useGSAP(
    () => {
      if (!leaving) return;
      const still = prefersReducedMotion();
      gsap
        .timeline({ onComplete: onLeft })
        .to(
          shell.current,
          {
            opacity: 0,
            scale: still ? 1 : 0.97,
            duration: 0.18,
            ease: "power2.in",
            overwrite: "auto",
          },
          0
        )
        .to(
          backdrop.current,
          { opacity: 0, duration: 0.22, ease: "power1.out", overwrite: "auto" },
          0
        );
    },
    { dependencies: [leaving] }
  );

  return (
    <>
      <DialogBackdrop
        ref={backdrop}
        className="fixed inset-0 bg-[rgba(10,10,10,0.6)] backdrop-blur-[6px]"
      />
      <div className="fixed inset-0 flex p-4">
        <DialogPanel ref={shell} className="relative m-auto w-full max-w-[420px]">
          {/* The shadow sits on a plate behind the card: on Safari the squircle
              is a clip, which would cut a box-shadow off the card itself, and a
              drop-shadow filter would be redrawn every frame something inside
              moves. Under a 64px blur nobody can tell its corners are round. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
          />
          <div className="squircle squircle-ring relative isolate flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden [--sq-fill:#161616] [--sq-r:40px] [--sq-ring:rgba(255,255,255,0.08)]">
            {/* Between the art and the copy, so the ring crosses the gold and
                passes under the text. Screen-blended: it adds light, where a
                plain gold overlay on near-black would only muddy it. */}
            <div
              data-burst
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[1] mix-blend-screen"
            >
              <span
                data-wave="glow"
                className="absolute rounded-full bg-[radial-gradient(closest-side,rgba(255,232,180,0.5),rgba(255,200,110,0.14)_55%,transparent)] opacity-0"
              />
              <span
                data-wave="ring"
                className="absolute rounded-full bg-[radial-gradient(closest-side,transparent_58%,rgba(255,224,165,0.38)_79%,rgba(255,224,165,0.08)_92%,transparent)] opacity-0"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="p-3 pb-0">
                <Art
                  onClose={() => {
                    haptic("light");
                    onClose();
                  }}
                />
              </div>
              <Copy onClose={onClose} />
            </div>
          </div>
        </DialogPanel>
      </div>
    </>
  );
};

const Art = ({ onClose }) => (
  // Concentric with the card: 40px outer radius minus the 12px gap.
  <div className="@container squircle relative isolate aspect-[2.1/1] overflow-hidden [--sq-r:28px] sm:aspect-[2/1]">
    <div data-bloom aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-0" style={{ backgroundImage: WASH }} />
      <div
        className="absolute inset-0 opacity-35 mix-blend-multiply"
        style={{ backgroundImage: BLOTCHES, backgroundSize: "100% 100%" }}
      />
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
    </div>

    <div
      aria-hidden="true"
      className="relative flex h-full flex-col items-center justify-center gap-4 sm:gap-5"
    >
      <Coin />
      <MonthRail />
    </div>

    {SPARKS.map((spark) => (
      <svg
        key={spark.left}
        data-spark
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute opacity-0 [filter:drop-shadow(0_0_4px_rgba(255,241,204,0.9))]"
        style={{ left: spark.left, top: spark.top, width: spark.size, height: spark.size }}
      >
        <path
          d="M12 0C12.7 6.2 17.8 11.3 24 12C17.8 12.7 12.7 17.8 12 24C11.3 17.8 6.2 12.7 0 12C6.2 11.3 11.3 6.2 12 0Z"
          fill="#FFFCF2"
        />
      </svg>
    ))}

    <button
      type="button"
      onClick={onClose}
      aria-label="Cerrar"
      className="absolute top-3 right-3 z-[3] grid size-8 place-items-center rounded-full bg-[rgba(52,34,8,0.32)] text-white transition-[background-color,scale] duration-150 ease-out hover:bg-[rgba(52,34,8,0.5)] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 active:scale-[0.92]"
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
        <path
          d="M4 4l8 8M12 4l-8 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  </div>
);

// Sized off the art's width (cqw) so it keeps its margins on a 320px phone.
const Coin = () => (
  <div
    data-coin
    className="relative size-[min(22cqw,88px)] shrink-0 rounded-full"
    style={{
      background: COIN_RIM,
      boxShadow:
        "0 0 0 6px rgba(255,249,232,0.3), 0 14px 26px -10px rgba(122,74,12,0.6), inset 0 1px 1px rgba(255,255,255,0.8)",
    }}
  >
    {/* clip-path rather than overflow + radius: Safari can let a moving
        child escape a rounded overflow clip. */}
    <div
      className="absolute inset-[6%] rounded-full [clip-path:circle(50%)]"
      style={{
        background: COIN_FACE,
        boxShadow: "inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -3px 6px rgba(122,74,12,0.35)",
      }}
    >
      <span
        data-glint
        className="absolute inset-0 bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.85)_50%,transparent_70%)] opacity-0"
      />
    </div>
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className="absolute inset-0 size-full -rotate-90"
    >
      <circle
        cx="50"
        cy="50"
        r="38"
        stroke="rgba(130,84,18,0.4)"
        strokeWidth="1.4"
        strokeDasharray="0.01 3.1"
        strokeLinecap="round"
      />
      <circle
        data-rim
        cx="50"
        cy="50"
        r="46.5"
        pathLength="1"
        strokeDasharray="1"
        stroke="rgba(255,250,232,0.95)"
        strokeWidth="1.4"
      />
    </svg>
    {/* Engraved: dark metal with a light lip under it. */}
    <HyxoraMark
      data-emblem
      className="absolute inset-0 m-auto size-[40%] text-[#8A5B16]/80 [filter:drop-shadow(0_1px_0_rgba(255,246,220,0.75))]"
    />
  </div>
);

// Fixed-width nodes, so the track can run centre to centre at a known inset.
const MonthRail = () => (
  <div className="relative flex w-[58%] max-w-[220px] justify-between">
    <span className="absolute inset-x-[14px] top-[4.5px] h-px bg-[rgba(122,80,20,0.22)]" />
    {[0, 1].map((i) => (
      <span
        key={i}
        data-fill
        className="absolute top-1 h-0.5 origin-left rounded-full bg-[linear-gradient(90deg,#B27B2B,#E4B75C)]"
        style={{ left: `calc(14px + ${i} * (100% - 28px) / 2)`, width: "calc((100% - 28px) / 2)" }}
      />
    ))}
    {MONTHS.map((month) => (
      <span key={month} data-node className="relative flex w-7 flex-col items-center gap-[7px]">
        <span className="relative size-2.5 rounded-full bg-[rgba(122,80,20,0.16)] shadow-[inset_0_0_0_1px_rgba(122,80,20,0.25)]">
          <span data-halo className="absolute inset-0 rounded-full bg-[#F2C76A] opacity-0" />
          <span
            data-lit
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFF5D6,#E8BA5E_55%,#B7802F)] shadow-[0_0_0_2px_rgba(255,251,238,0.9),0_2px_5px_rgba(122,74,12,0.45)]"
          />
        </span>
        <span
          data-label
          className="pl-[0.14em] font-semibold text-[#6B4812] text-[10px] uppercase leading-none tracking-[0.14em]"
        >
          {month}
        </span>
      </span>
    ))}
  </div>
);

const Copy = ({ onClose }) => (
  <div className="relative isolate z-[2] flex flex-col gap-4 px-[18px] pt-5 pb-[18px]">
    <div
      data-wash
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(75%_100%_at_50%_0%,rgba(232,184,90,0.16),rgba(232,184,90,0.05)_45%,transparent_75%)]"
    />

    <div data-rise className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 font-semibold text-[#E2BD72] text-[11px] uppercase leading-none tracking-[0.16em]">
        <HyxoraMark className="size-3" />
        Hyxora Finance
      </p>
      <DialogTitle className="font-semibold text-[24px] text-white leading-[1.15] tracking-[-0.035em]">
        Tu fidelidad es{" "}
        <span
          data-sheen
          className="bg-[length:250%_100%] bg-[linear-gradient(100deg,#E3B55C,#F1CD7E_30%,#FFF4D6_50%,#F1CD7E_70%,#E3B55C)] bg-clip-text text-transparent"
          style={{ WebkitBackgroundClip: "text" }}
        >
          ORO
        </span>
      </DialogTitle>
    </div>

    <Description
      as="div"
      data-rise
      className="flex flex-col gap-2 text-[14px] text-white/60 leading-[21px] tracking-[-0.01em]"
    >
      <p>
        Todos los usuarios de Hyxora registrados en la app hasta el{" "}
        <strong className="font-medium text-white/90">30/10/2026</strong> recibirán a partir de
        octubre con la entrada de los planes de suscripción, el coste de la misma mensual en{" "}
        <strong className="font-medium text-[#E8C375]">ORO DIGITAL</strong> en la app.
      </p>
      <p>
        Esta promoción es para los meses de{" "}
        <strong className="font-medium text-white/90">
          octubre, noviembre y diciembre de 2026
        </strong>
        .
      </p>
    </Description>

    {/* Concentric with the card: 40px minus the 18px gutter. */}
    <dl
      data-rise
      className="squircle flex flex-col divide-y divide-white/[0.06] bg-white/[0.045] [--sq-r:22px]"
    >
      <Term label="Pago mensual">
        En el momento que se efectúe el pago mensual, transferiremos a la cuenta el mismo importe en
        Oro digital.
      </Term>
      <Term label="Pago anual">
        Cada mes recibirás en los 5 primeros días de cada mes, la transferencia en Oro digital
        correspondiente a una mensualidad.
      </Term>
    </dl>

    {/* Sticky, so on a short phone the sign-up stays in reach while the terms
        scroll under it; where nothing scrolls it sits exactly in place. The
        fade is the card's own fill, inherited as --sq-fill. */}
    <div
      data-rise
      className="sticky bottom-0 -mx-[18px] -mt-3 -mb-[18px] flex items-center gap-1 bg-[linear-gradient(to_bottom,transparent,var(--sq-fill)_16px)] px-[18px] pt-4 pb-[18px]"
    >
      <a
        href={HYXORA_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          haptic("medium");
          onClose();
        }}
        className="squircle inline-flex h-10 items-center gap-1.5 bg-white px-4 font-medium text-[#121212] text-[14px] tracking-[-0.01em] transition-[background-color,scale] duration-150 ease-out [--sq-r:14px] hover:bg-[#ECECEC] focus-visible:shadow-[inset_0_0_0_2px_#2d68ff] focus-visible:outline-none active:scale-[0.97]"
      >
        Regístrate en la app
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
          <path
            d="M5 11l6-6M6 5h5v5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      <button
        type="button"
        onClick={() => {
          haptic("light");
          onClose();
        }}
        className="h-10 rounded-[10px] px-3 font-medium text-[14px] text-white/55 tracking-[-0.01em] transition-[color,scale] duration-150 ease-out hover:text-white focus-visible:outline-2 focus-visible:outline-white/60 active:scale-[0.97]"
      >
        Ahora no
      </button>
    </div>
  </div>
);

const Term = ({ label, children }) => (
  <div className="flex flex-col gap-1 px-3.5 py-3">
    <dt className="flex items-center gap-2 font-medium text-[13px] text-white leading-[18px]">
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFF1C8,#D9A24A)]"
      />
      {label}
    </dt>
    <dd className="text-[13px] text-white/55 leading-[19px]">{children}</dd>
  </div>
);

const HyxoraMark = ({ className, ...props }) => (
  <svg
    viewBox="88 84 241 249"
    fill="currentColor"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path d="M208.085 213.9L269.444 286.683L208.085 267.936L145.068 331.897L88 331.117L208.085 213.9Z" />
    <path d="M208.915 201.997L147.556 129.214L208.915 147.961L271.932 84L329 84.7798L208.915 201.997Z" />
    <path d="M328.592 333H287.686L287.686 163.173L328.592 123.473L328.592 333Z" />
    <path d="M88.6842 84.8759H129.59V254.703L88.6842 294.403V84.8759Z" />
  </svg>
);

export default GoldPromoModal;
