"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

// Client footprint — concentrated across South & Central America.
// Panama is present but sized like its neighbors, not highlighted.
// `label` is only set on a curated subset so the dense Andes cluster
// doesn't overlap; the rest render as plain dots.
const MARKERS = [
  // South America (primary clientele) — slightly larger
  { id: "bogota", location: [4.71, -74.07], label: "Bogotá" },
  {
    id: "saopaulo",
    location: [-23.55, -46.63],
    label: "São Paulo",
  },
  {
    id: "buenosaires",
    location: [-34.6, -58.38],
    label: "Buenos Aires",
  },
  { id: "lima", location: [-12.05, -77.04], label: "Lima" },
  { id: "santiago", location: [-33.45, -70.67], label: "Santiago" },
  { id: "caracas", location: [10.48, -66.9] },
  { id: "quito", location: [-0.18, -78.47] },
  { id: "rio", location: [-22.91, -43.17] },
  { id: "lapaz", location: [-16.5, -68.15] },
  { id: "asuncion", location: [-25.3, -57.64] },
  { id: "montevideo", location: [-34.9, -56.16] },
  // Central America / Mexico — blended in
  { id: "panama", location: [8.98, -79.52], label: "Panamá" },
  { id: "sanjose", location: [9.93, -84.08] },
  { id: "mexico", location: [19.43, -99.13], label: "México" },
];

// Money-transfer flows between client cities. The $ label rides each arc
// so the network reads as value moving across the region.
const ARCS = [
  { id: "mx-bog", from: [19.43, -99.13], to: [4.71, -74.07], amount: "$4.2K" },
  {
    id: "pan-sao",
    from: [8.98, -79.52],
    to: [-23.55, -46.63],
    amount: "$2.8K",
  },
  {
    id: "sao-bue",
    from: [-23.55, -46.63],
    to: [-34.6, -58.38],
    amount: "$1.9K",
  },
  {
    id: "lim-scl",
    from: [-12.05, -77.04],
    to: [-33.45, -70.67],
    amount: "$960",
  },
  { id: "bog-pan", from: [4.71, -74.07], to: [8.98, -79.52], amount: "$3.1K" },
];
// Base axial tilt — we look slightly down on the globe so it reads like a
// broadcast/"CNN corner" globe rather than a flat front-on sphere.
const THETA = 0.3;
const ROTATION_SPEED = 0.0025;
// Vertical tilt is clamped to this range; the globe softly springs back in.
const THETA_MIN = -0.4;
const THETA_MAX = 0.4;
const MAX_VELOCITY = 0.15;
const VELOCITY_DECAY = 0.95;
const clamp = (v, max) => Math.max(-max, Math.min(max, v));
const Globe = () => {
  const canvasRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth;

    let phi = -Math.PI / 2;

    // Interaction state — mirrors the cobe showcase momentum model.
    // pointer holds the grab origin; offsets accumulate committed drag;
    // dragOffset is the live (in-progress) drag; velocity carries momentum.
    let pointer = null;
    let lastPointer = null;
    let phiOffset = 0;
    let thetaOffset = 0;
    let dragOffset = { phi: 0, theta: 0 };
    let velocity = { phi: 0, theta: 0 };

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: width * dpr,
      height: width * dpr,
      phi,
      theta: THETA,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 10,
      baseColor: [1, 1, 1],
      markerColor: [0.3, 0.45, 0.85],
      glowColor: [0.94, 0.93, 0.91],
      markerElevation: 0,
      opacity: 0.7,
      markers: MARKERS,
      arcs: ARCS.map(({ id, from, to }) => ({ id, from, to })),
      arcColor: [0.3, 0.45, 0.85],
      arcWidth: 0.5,
      arcHeight: 0.25,
    });

    let rafId = 0;
    let running = false;
    function animate() {
      if (pointer === null) {
        // Auto-spin while idle.
        phi += ROTATION_SPEED;
        // Carry release momentum, decaying each frame.
        if (
          Math.abs(velocity.phi) > 0.0001 ||
          Math.abs(velocity.theta) > 0.0001
        ) {
          phiOffset += velocity.phi;
          thetaOffset += velocity.theta;
          velocity.phi *= VELOCITY_DECAY;
          velocity.theta *= VELOCITY_DECAY;
        }
        // Soft spring back when tilt drifts past its limits.
        if (thetaOffset < THETA_MIN) {
          thetaOffset += (THETA_MIN - thetaOffset) * 0.1;
        } else if (thetaOffset > THETA_MAX) {
          thetaOffset += (THETA_MAX - thetaOffset) * 0.1;
        }
      }
      globe.update({
        phi: phi + phiOffset + dragOffset.phi,
        theta: THETA + thetaOffset + dragOffset.theta,
        width: width * dpr,
        height: width * dpr,
      });
      rafId = requestAnimationFrame(animate);
    }
    function start() {
      if (running) return;
      running = true;
      animate();
    }
    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    // cobe never re-measures the canvas itself, so keep width in sync.
    const ro = new ResizeObserver(() => {
      width = canvas.offsetWidth;
    });
    ro.observe(canvas);

    // Only spin while the globe is actually on screen.
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onPointerDown = (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      lastPointer = null;
      velocity = { phi: 0, theta: 0 };
      canvas.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (pointer === null) return;
      dragOffset = {
        phi: (e.clientX - pointer.x) / 300,
        theta: (e.clientY - pointer.y) / 1000,
      };
      // Track instantaneous velocity (clamped) for release momentum.
      const now = Date.now();
      if (lastPointer) {
        const dt = Math.max(now - lastPointer.t, 1);
        velocity = {
          phi: clamp(((e.clientX - lastPointer.x) / dt) * 0.3, MAX_VELOCITY),
          theta: clamp(((e.clientY - lastPointer.y) / dt) * 0.08, MAX_VELOCITY),
        };
      }
      lastPointer = { x: e.clientX, y: e.clientY, t: now };
    };
    const onPointerUp = () => {
      if (pointer === null) return;
      // Bake the live drag into the committed offsets and let momentum run.
      phiOffset += dragOffset.phi;
      thetaOffset += dragOffset.theta;
      dragOffset = { phi: 0, theta: 0 };
      lastPointer = null;
      pointer = null;
      canvas.style.cursor = "grab";
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });

    canvas.style.opacity = "1";

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      globe.destroy();
    };
  }, []);

  return (
    <div className="relative flex h-[445px] w-[620px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] max-lg:aspect-square max-lg:h-auto max-lg:w-full ">
      <style>
        {
          "@supports not (anchor-name: --test) { .ip-city-label, .ip-arc-label { display: none; } }"
        }
      </style>
      {/* Oversized + offset so the sphere bleeds past the card edges — gives
          the huge, tilted broadcast-globe feel sitting in the corner. */}
      <canvas
        ref={canvasRef}
        className="absolute left-1/2 top-[58%] h-[150%] aspect-square w-auto -translate-x-1/2 -translate-y-1/2 globe-canvas"
        style={{ opacity: 0, transition: "opacity 1.2s ease" }}
      />

      {/* City name labels — only the curated subset with a `label`. */}
      {MARKERS.filter((m) => m.label).map((m) => (
        <div
          key={m.id}
          className="ip-city-label"
          style={{
            positionAnchor: `--cobe-${m.id}`,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
          }}
        >
          {m.label}
        </div>
      ))}
    </div>
  );
};

export default Globe;
