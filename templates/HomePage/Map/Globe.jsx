"use client";
import createGlobe from "cobe";
import { useEffect, useRef, useCallback } from "react";
import { useSpring } from "react-spring";
import { useLenis } from "lenis/react";

const MARKERS = [
  // { id: "bogota", location: [4.71, -74.07], label: "Bogotá" },
  // {
  //   id: "saopaulo",
  //   location: [-23.55, -46.63],
  //   label: "São Paulo",
  // },
  // {
  //   id: "buenosaires",
  //   location: [-34.6, -58.38],
  //   label: "Buenos Aires",
  // },
  // { id: "caracas", location: [10.48, -66.9], label: "Caracas" },
  // // Central America / Mexico — blended in
  { id: "panama", location: [8.98, -79.52], label: "Panamá" },
  // { id: "mexico", location: [19.43, -99.13], label: "México" },
];

const Globe = () => {
  const lenis = useLenis();
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const lastPointer = useRef(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const velocity = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);
  const speedRef = useRef(1);
  const [spring] = useSpring(() => ({
    theta: 0.2,
    dark: 0,
    mapBrightness: 10,
    mr: 0.3,
    mg: 0.45,
    mb: 0.85,
    br: 1,
    bg: 1,
    bb: 1,
    ar: 0.3,
    ag: 0.45,
    ab: 0.85,
    markerSize: 0.025,
    markerElevation: 0.0,
    mapSamples: 40000,
    config: { mass: 1, tension: 120, friction: 20 },
  }));
  const lenisStoppedRef = useRef(false);
  const handlePointerDown = useCallback(
    (e) => {
      pointerInteracting.current = { x: e.clientX, y: e.clientY };
      if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
      isPausedRef.current = true;
      // On touch devices, freeze page scroll while dragging the globe so the
      // gesture doesn't fight Lenis and feel glitchy.
      if (e.pointerType === "touch" && lenis) {
        lenis.stop();
        lenisStoppedRef.current = true;
      }
    },
    [lenis],
  );

  const handlePointerMove = useCallback((e) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x;
      const deltaY = e.clientY - pointerInteracting.current.y;
      dragOffset.current = { phi: deltaX / 300, theta: deltaY / 1000 };

      // Track velocity (clamped)
      const now = Date.now();
      if (lastPointer.current) {
        const dt = Math.max(now - lastPointer.current.t, 1);
        const maxVelocity = 0.15;
        velocity.current = {
          phi: Math.max(
            -maxVelocity,
            Math.min(
              maxVelocity,
              ((e.clientX - lastPointer.current.x) / dt) * 0.3,
            ),
          ),
          theta: Math.max(
            -maxVelocity,
            Math.min(
              maxVelocity,
              ((e.clientY - lastPointer.current.y) / dt) * 0.08,
            ),
          ),
        };
      }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now };
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
      lastPointer.current = null;
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
    // Resume page scroll once the touch drag ends.
    if (lenisStoppedRef.current && lenis) {
      lenis.start();
      lenisStoppedRef.current = false;
    }
  }, [lenis]);
  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);
  const springRef = useRef(spring);
  useEffect(() => {
    springRef.current = spring;
  }, [spring]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let phi = 0;
    const width = canvas.offsetWidth;

    // Lower geometry density on small / touch-first devices to keep the
    // globe at 60fps. cobe recommends ~8000 samples for mobile, 16000 desktop.
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio, 2),
      width: width,
      height: width,
      phi: 0,
      theta: 0.2,
      dark: 0,
      diffuse: 1.5,
      mapSamples: isMobile ? 8000 : 16000,
      mapBrightness: 10,
      baseColor: [1, 1, 1],
      markerColor: [0.3, 0.45, 0.85],
      glowColor: [0.94, 0.93, 0.91],
      arcColor: [0.3, 0.45, 0.85],
      arcWidth: 0.5,
      arcHeight: 0.1,
      opacity: 0.7,
      markerElevation: 0.0,
      markers: MARKERS.map((m) => ({
        location: m.location,
        size: 0.03,
        id: m.id,
      })),
      // arcs: ARCS.map(({ id, from, to }) => ({ id, from, to })),
    });

    let animationId = 0;
    let running = false;
    function animate() {
      const s = springRef.current;
      if (!isPausedRef.current) {
        phi += 0.003 * speedRef.current;
        // Apply momentum with decay
        if (
          Math.abs(velocity.current.phi) > 0.0001 ||
          Math.abs(velocity.current.theta) > 0.0001
        ) {
          phiOffsetRef.current += velocity.current.phi;
          thetaOffsetRef.current += velocity.current.theta;
          velocity.current.phi *= 0.95;
          velocity.current.theta *= 0.95;
        }
        // Soft spring back for theta limits
        const thetaMin = -0.4;
        const thetaMax = 0.4;
        if (thetaOffsetRef.current < thetaMin) {
          thetaOffsetRef.current += (thetaMin - thetaOffsetRef.current) * 0.1;
        } else if (thetaOffsetRef.current > thetaMax) {
          thetaOffsetRef.current += (thetaMax - thetaOffsetRef.current) * 0.1;
        }
      }
      globe.update({
        phi: phi + phiOffsetRef.current + dragOffset.current.phi,
        theta:
          s.theta.get() + thetaOffsetRef.current + dragOffset.current.theta,
        dark: s.dark.get(),
        mapBrightness: s.mapBrightness.get(),
        markerColor: [s.mr.get(), s.mg.get(), s.mb.get()],
        baseColor: [s.br.get(), s.bg.get(), s.bb.get()],
        arcColor: [s.ar.get(), s.ag.get(), s.ab.get()],
        markerElevation: s.markerElevation.get(),
        // markers: MARKERS,
        // arcs: ARCS.map(({ id, from, to }) => ({ id, from, to })),
      });
      animationId = requestAnimationFrame(animate);
    }

    function start() {
      if (running) return;
      running = true;
      animate();
    }

    function stop() {
      running = false;
      cancelAnimationFrame(animationId);
    }

    const fadeId = setTimeout(() => {
      canvas.style.opacity = "1";
    });

    // Only run the render loop while the globe is on screen — scrolling it out
    // of view stops the RAF loop and frees the GPU.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    return () => {
      clearTimeout(fadeId);
      observer.disconnect();
      stop();
      globe.destroy();
    };
  }, []);
  return (
    <div className="flex h-[445px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] max-lg:aspect-square max-lg:h-auto max-lg:w-full ">
      <canvas
        ref={canvasRef}
        className="showcases-canvas"
        onPointerDown={handlePointerDown}
        onPointerEnter={() => {
          speedRef.current = 0.8;
        }}
        onPointerLeave={() => {
          speedRef.current = 1;
        }}
      />
      {/* City name labels — only the curated subset with a `label`. */}
      {MARKERS.map((m) => (
        <div
          key={m.id}
          className="showcase-default-label "
          style={{
            positionAnchor: `--cobe-${m.id}`,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(var(--cobe-visible-${m.id}, 10px))`,
          }}
        >
          {m.label}
        </div>
      ))}
    </div>
  );
};

export default Globe;
