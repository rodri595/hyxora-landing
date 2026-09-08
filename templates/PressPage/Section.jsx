"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// One reveal rule for every section: whatever carries `data-reveal` rises in,
// staggered, the first time the section reaches the viewport. Under
// prefers-reduced-motion nothing is ever hidden — the matchMedia branch that
// hides it simply never runs.
const Section = ({ id, rail, index, total, title, description, action, children }) => {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = ref.current.querySelectorAll("[data-reveal]");
        if (!targets.length) return;
        gsap.from(targets, {
          y: 28,
          autoAlpha: 0,
          duration: 0.85,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    // `data-rail` is the only thing SectionRail needs: it collects every
    // element carrying one and builds the floating index from them.
    <section
      ref={ref}
      id={id}
      data-rail={rail}
      className="scroll-mt-[140px] border-[rgba(25,54,63,0.08)] border-t pt-14 first:border-t-0 first:pt-0 max-md:pt-10"
    >
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5 max-md:mb-7">
        <div className="flex max-w-[520px] flex-col gap-3">
          <span
            data-reveal
            className="font-inter font-medium text-[11px] text-[rgba(25,54,63,0.45)] tabular-nums tracking-[0.14em]"
          >
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <h2
            data-reveal
            className="font-inter font-medium text-[32px] text-[#19363f] leading-[1.1] tracking-[-1.28px] max-md:text-[24px] max-md:tracking-[-0.96px]"
          >
            {title}
          </h2>
          {description && (
            <p
              data-reveal
              className="font-inter font-normal text-[15px] text-[rgba(25,54,63,0.7)] leading-6 tracking-[-0.3px]"
            >
              {description}
            </p>
          )}
        </div>
        {action && (
          <div data-reveal className="shrink-0 max-md:w-full">
            {action}
          </div>
        )}
      </div>
      {children}
    </section>
  );
};

export default Section;
