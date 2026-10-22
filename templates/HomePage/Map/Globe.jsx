"use client";
import createGlobe from "cobe";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSpring } from "react-spring";
import { COUNTRIES, RAMPS } from "./countries";

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
  const hoverRef = useRef(false);
  const focusRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
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
      focusRef.current = null;
      setFocused(null);
      // On touch devices, freeze page scroll while dragging the globe so the
      // gesture doesn't fight Lenis and feel glitchy.
      if (e.pointerType === "touch" && lenis) {
        lenis.stop();
        lenisStoppedRef.current = true;
      }
    },
    [lenis]
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
            Math.min(maxVelocity, ((e.clientX - lastPointer.current.x) / dt) * 0.3)
          ),
          theta: Math.max(
            -maxVelocity,
            Math.min(maxVelocity, ((e.clientY - lastPointer.current.y) / dt) * 0.08)
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
    let speed = 1;
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
      // Size 0: the dots are the HTML markers below, cobe only supplies their anchors.
      markers: COUNTRIES.map((m) => ({ location: m.location, size: 0, id: m.id })),
      // arcs: ARCS.map(({ id, from, to }) => ({ id, from, to })),
    });

    let animationId = 0;
    let running = false;
    function animate() {
      const s = springRef.current;
      if (!isPausedRef.current) {
        // Ease to a stop while a country is hovered or picked, so its label holds still.
        const held = hoverRef.current || focusRef.current !== null;
        speed += ((held ? 0 : speedRef.current) - speed) * 0.08;
        phi += 0.003 * speed;
        // Glide the picked country to the front, the short way round.
        if (focusRef.current !== null) {
          const d = focusRef.current - phi - phiOffsetRef.current;
          phiOffsetRef.current += Math.atan2(Math.sin(d), Math.cos(d)) * 0.08;
        }
        // Apply momentum with decay
        if (Math.abs(velocity.current.phi) > 0.0001 || Math.abs(velocity.current.theta) > 0.0001) {
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
        theta: s.theta.get() + thetaOffsetRef.current + dragOffset.current.theta,
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
      { threshold: 0 }
    );
    observer.observe(canvas);

    return () => {
      clearTimeout(fadeId);
      observer.disconnect();
      stop();
      globe.destroy();
    };
  }, []);
  const focusCountry = (c) => {
    // cobe brings longitude λ to the front at phi = 3π/2 − λ (see its U/O projection).
    focusRef.current = 1.5 * Math.PI - (c.location[1] * Math.PI) / 180;
    velocity.current = { phi: 0, theta: 0 };
    setFocused(c.id);
  };

  return (
    <div
      className="flex h-[445px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] max-lg:aspect-square max-lg:h-auto max-lg:w-full "
      onPointerEnter={() => {
        speedRef.current = 0.8;
      }}
      onPointerLeave={() => {
        speedRef.current = 1;
        hoverRef.current = false;
        setHovered(null);
      }}
    >
      <canvas ref={canvasRef} className="showcases-canvas" onPointerDown={handlePointerDown} />
      {COUNTRIES.map((c, i) => (
        <button
          key={c.id}
          type="button"
          className="globe-marker"
          aria-label={`${c.name} · ${RAMPS[c.ramp].legend}`}
          data-active={c.id === hovered || c.id === focused || undefined}
          style={{
            positionAnchor: `--cobe-${c.id}`,
            // cobe sets this var to a non-number when the point faces us, which makes
            // each property fall back to its default (opacity 1, scale none, inherited
            // pointer-events); behind the globe the fallbacks apply.
            opacity: `var(--cobe-visible-${c.id}, 0)`,
            scale: `var(--cobe-visible-${c.id}, 0.2)`,
            pointerEvents: `var(--cobe-visible-${c.id}, none)`,
            "--marker-bg": RAMPS[c.ramp].bg,
            "--marker-fg": RAMPS[c.ramp].fg,
            "--i": i,
          }}
          onPointerEnter={() => {
            hoverRef.current = true;
            setHovered(c.id);
          }}
          onPointerLeave={() => {
            hoverRef.current = false;
            setHovered(null);
          }}
          onFocus={() => focusCountry(c)}
          onClick={() => focusCountry(c)}
        >
          <span className="globe-marker-label">
            {c.label}
            <span>{RAMPS[c.ramp].legend}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default Globe;
