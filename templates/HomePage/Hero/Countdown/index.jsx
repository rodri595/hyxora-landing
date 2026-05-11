"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const TARGET_DATE = new Date("2026-05-15T18:00:00");

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

// digitRef points to the inner <span> so the ticker slides the text inside the clipping box
function CountdownUnit({ value, label, digitRef }) {
  return (
    <div className="unit flex flex-col items-center gap-[3px]">
      <div className="flex items-center justify-center w-9 h-[30px] rounded-[8px] bg-[rgba(25,54,63,0.04)] border border-[rgba(25,54,63,0.07)] overflow-hidden">
        <span
          ref={digitRef}
          className="font-medium text-[13px] text-[#19363f] tracking-[-0.5px] tabular-nums leading-none"
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] font-medium text-[rgba(25,54,63,0.4)] tracking-[0.4px] uppercase">
        {label}
      </span>
    </div>
  );
}

const Countdown = () => {
  const [time, setTime] = useState(null);

  const containerRef = useRef(null);
  const daysRef = useRef(null);
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  const secondsRef = useRef(null);

  // Populate time only on the client to avoid SSR/client hydration mismatch
  useEffect(() => {
    setTime(getTimeLeft());
  }, []);

  // Tick every second
  useEffect(() => {
    if (!time || time.done) return;
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, [time?.done]);

  // Slot-machine ticker: text slides in from above on each change
  const prevTime = useRef(null);
  useEffect(() => {
    if (!time) return;
    const prev = prevTime.current;
    const ticker = (ref) => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { y: -14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" },
      );
    };

    if (prev && prev.seconds !== time.seconds) ticker(secondsRef);
    if (prev && prev.minutes !== time.minutes) ticker(minutesRef);
    if (prev && prev.hours !== time.hours) ticker(hoursRef);
    if (prev && prev.days !== time.days) ticker(daysRef);

    prevTime.current = time;
  }, [time]);

  // Entrance: units stagger in from center with a soft back-out bounce
  useGSAP(
    () => {
      gsap.from(".unit", {
        opacity: 0,
        y: 8,
        scale: 0.88,
        duration: 0.5,
        stagger: { each: 0.07, from: "center" },
        ease: "back.out(1.5)",
        delay: 0.15,
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-2 py-2.5 px-3.5 rounded-2xl bg-[rgba(25,54,63,0.03)] border border-[rgba(25,54,63,0.06)] max-w-fit mx-auto"
    >
      {/* Label */}
      <p className="text-[11px] font-medium text-[rgba(25,54,63,0.55)] tracking-[-0.2px] text-center leading-snug">
        {time?.done
          ? "¡Fase Pública de NFT Founder abierta!"
          : "Fase Pública de NFT Founder abierta en"}{" "}
        <span className="text-[#1b5ffd] font-semibold whitespace-nowrap">
          (Sólo 350 und para todo 2026)
        </span>
      </p>

      {/* Digits row */}
      {time && !time.done && (
        <div className="flex items-center gap-1.5">
          <CountdownUnit value={time.days} label="Días" digitRef={daysRef} />

          <span className="text-[12px] font-medium text-[rgba(25,54,63,0.25)] mb-[13px] leading-none select-none">
            :
          </span>

          <CountdownUnit value={time.hours} label="Horas" digitRef={hoursRef} />

          <span className="text-[12px] font-medium text-[rgba(25,54,63,0.25)] mb-[13px] leading-none select-none">
            :
          </span>

          <CountdownUnit
            value={time.minutes}
            label="Min"
            digitRef={minutesRef}
          />

          <span className="text-[12px] font-medium text-[rgba(25,54,63,0.25)] mb-[13px] leading-none select-none">
            :
          </span>

          <CountdownUnit
            value={time.seconds}
            label="Seg"
            digitRef={secondsRef}
          />
        </div>
      )}
    </div>
  );
};

export default Countdown;
