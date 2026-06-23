"use client";

import { useEffect, useRef, useState } from "react";
import { cn, copyToClipboard } from "@/utils";

// Visual variants: "light" = dark icon on light surface, "dark" = light icon on dark surface
const VARIANTS = {
  light: {
    hover: "hover:bg-[rgba(25,54,63,0.08)]",
    background: "rgba(25,54,63,0.05)",
    icon: "rgba(25,54,63,0.40)",
    check: "#16a34a",
  },
  dark: {
    hover: "hover:bg-[rgba(255,255,255,0.12)]",
    background: "rgba(255,255,255,0.06)",
    icon: "rgba(255,255,255,0.50)",
    check: "#4ade80",
  },
};

const CopyButton = ({ text, variant = "light", className, title = "Copiar" }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);
  const styles = VARIANTS[variant] ?? VARIANTS.light;

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = () => {
    // copyToClipboard fires a success toast, and ToastHaptics turns that into
    // a "success" buzz — so no explicit haptic call is needed here.
    copyToClipboard(text);
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "shrink-0 flex items-center justify-center size-5 rounded-md transition-colors",
        styles.hover,
        className,
      )}
      style={{ background: styles.background }}
      title={title}
    >
      {copied ? (
        <svg width="10" height="10" viewBox="0 0 12 10" fill="none">
          <title>Copiado</title>
          <path
            d="M1 5L4.5 8.5L11 1"
            stroke={styles.check}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <title>Copiar</title>
          <rect
            x="5"
            y="5"
            width="9"
            height="9"
            rx="1.5"
            stroke={styles.icon}
            strokeWidth="1.5"
          />
          <path
            d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
            stroke={styles.icon}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
};

export default CopyButton;
