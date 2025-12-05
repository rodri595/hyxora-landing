"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

export default function CustomCursor() {
  const isTablet = useMediaQuery("(max-width: 1023px)");

  const cursorRef = useRef(null);
  const cursorTextContainerRef = useRef(null);
  const [cursorText, setCursorText] = useState("");
  const timelineRef = useRef(null);
  const marqueeTimelineRef = useRef(null);
  const { contextSafe } = useGSAP(
    () => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      const xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3" });

      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        xTo(clientX);
        yTo(clientY);
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    },
    {
      scope: cursorRef,
    }
  );

  // eslint-disable-next-line react-hooks/refs
  const handleMouseEnter = contextSafe((e) => {
    const target = e.currentTarget;
    const text = target.getAttribute("data-cursor-text") || "";
    const cursorContainer = cursorTextContainerRef?.current;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    setCursorText(text);

    const enterTl = gsap.timeline();
    timelineRef.current = enterTl;

    enterTl
      .to(cursorContainer, {
        clipPath: "inset(0% round 50em)",
        duration: 0.3,
        ease: "cubic-bezier(.75, 0, .25, 1)",
      })
      .to(
        ".cursor-content",
        {
          opacity: 1,
          duration: 0.3,
          ease: "cubic-bezier(.75, 0, .25, 1)",
        },
        0
      )
      .add(() => {
        const marqueeInner = document.querySelector(".marquee-inner");
        if (marqueeInner) {
          marqueeTimelineRef.current = gsap.to(marqueeInner, {
            x: "-100%",
            duration: 3,
            ease: "linear",
            repeat: -1,
          });
        }
      });
  }, []);
  // eslint-disable-next-line react-hooks/refs
  const handleMouseLeave = contextSafe(() => {
    const cursorContainer = cursorTextContainerRef?.current;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    if (marqueeTimelineRef.current) {
      marqueeTimelineRef.current.kill();
      gsap.set(".marquee-inner", { x: 0 });
    }
    const leaveTl = gsap.timeline({
      onComplete: () => {
        setCursorText("");
      },
    });
    timelineRef.current = leaveTl;

    leaveTl
      .to(cursorContainer, {
        clipPath: "inset(50% round 50em)",
        duration: 0.3,
        ease: "cubic-bezier(.75, 0, .25, 1)",
      })
      .to(
        ".cursor-content",
        {
          opacity: 0,
          duration: 0.3,
          ease: "cubic-bezier(.75, 0, .25, 1)",
        },
        0
      );
  }, []);

  useGSAP(
    () => {
      const elements = document.querySelectorAll("[data-cursor-text]");
      elements.forEach((el) => {
        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
      });

      return () => {
        elements.forEach((el) => {
          el.removeEventListener("mouseenter", handleMouseEnter);
          el.removeEventListener("mouseleave", handleMouseLeave);
        });
      };
    },
    { dependencies: [handleMouseEnter, handleMouseLeave] }
  );

  if (isTablet) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-3 flex size-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full  bg-blue-600 text-sm font-medium text-white"
    >
      <div
        ref={cursorTextContainerRef}
        className="cursor-text-container marquee absolute flex w-fit items-center justify-center overflow-hidden bg-blue-600 text-nowrap"
        style={{
          clipPath: "inset(50% round 50em)",
          willChange: "clip-path",
        }}
      >
        <div className="marquee-inner relative flex gap-4 will-change-transform">
          <span className="cursor-content px-2 py-1 opacity-0">
            {cursorText}
          </span>
          <span className="cursor-content absolute left-full px-2 py-1 opacity-0">
            {cursorText}
          </span>
        </div>
      </div>
    </div>
  );
}
