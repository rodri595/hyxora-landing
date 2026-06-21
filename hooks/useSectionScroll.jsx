"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const animateScrollTo = (element) => {
  gsap.to(window, {
    scrollTo: {
      y: element,
      offsetY: 100,
      autoKill: true,
    },
    duration: 1.5,
    ease: "power3.inOut",
  });
};

/**
 * Scroll to a section on the current page.
 * `sectionId` is a CSS id selector, e.g. "#opportunities-section".
 * Returns false if the target element is not in the DOM.
 */
export const scrollToSection = (sectionId) => {
  const element = document.querySelector(sectionId);
  if (!element) return false;
  animateScrollTo(element);
  return true;
};

/**
 * Returns a function that scrolls to a section identified by a CSS id selector
 * (e.g. "#opportunities-section"). If the user is not on the home page, it
 * navigates to `/<#id>` (the id lives in the URL) and the scroll runs once the
 * home page mounts (see `consumePendingScroll`).
 */
export const useSectionScroll = () => {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (sectionId) => {
      if (pathname === "/") {
        // Already home: scroll and reflect the target in the URL.
        if (scrollToSection(sectionId)) {
          window.history.replaceState(null, "", sectionId);
        }
        return;
      }

      // Other route: carry the id in the URL. `scroll: false` lets us run the
      // animated scroll ourselves on arrival instead of Next's instant jump.
      router.push(`/${sectionId}`, { scroll: false });
    },
    [pathname, router],
  );
};

/**
 * Run on home page mount: if the URL carries a section id (#hash), scroll to it
 * once the section is in the DOM. Returns a cleanup function.
 */
export const consumePendingScroll = () => {
  const sectionId = window.location.hash;
  if (!sectionId) return;

  let raf;
  let attempts = 0;
  const tryScroll = () => {
    if (scrollToSection(sectionId)) return;
    // Sections may not be laid out yet right after navigation; retry briefly.
    if (attempts++ < 120) raf = requestAnimationFrame(tryScroll);
  };

  // Small delay so the home page has a chance to render before we measure.
  const timeout = setTimeout(() => {
    raf = requestAnimationFrame(tryScroll);
  }, 100);

  return () => {
    clearTimeout(timeout);
    if (raf) cancelAnimationFrame(raf);
  };
};
