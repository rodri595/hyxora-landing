"use client";

import Icon from "@/components/Icon";
import { useAppLaunch } from "@/context/AppLaunchProvider";
import { cn } from "@/utils";
import { useEffect, useState } from "react";

// Sits under the header's right edge — where the avatar is on desktop and the
// burger is on mobile — so the arrow points at the control it talks about.
const AppLaunchHint = () => {
  const { hintOpen, tabBlocked, openApp, dismissHint } = useAppLaunch();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!hintOpen) {
      setShown(false);
      return;
    }
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [hintOpen]);

  if (!hintOpen) return null;

  return (
    <div
      className={cn(
        "absolute top-full right-[50px] mt-3 z-30 w-[320px] max-w-[calc(100vw-2rem)] max-lg:right-4",
        "transition-all duration-300 ease-out",
        shown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
      )}
    >
      {/* Caret pointing back up at the avatar / burger */}
      <div className="absolute -top-[5px] right-[10px] size-[10px] rotate-45 rounded-[2px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgb(250,251,251)]" />

      <div className="relative flex flex-col gap-[10px] rounded-[16px] border-[0.7px] border-solid border-[rgba(25,54,63,0.02)] bg-[rgb(250,251,251)] p-[14px] shadow-[0px_3px_4px_-4px_rgba(25,54,63,0.05),0px_8px_8px_-4px_rgba(25,54,63,0.1)] backdrop-blur-[15px]">
        <button
          type="button"
          onClick={dismissHint}
          aria-label="Cerrar"
          className="absolute right-[10px] top-[10px] flex size-[20px] items-center justify-center rounded-full transition-colors hover:bg-[rgba(25,54,63,0.04)]"
        >
          <Icon name="close-small" className="size-[12px]" fill="rgba(25,54,63,0.7)" />
        </button>

        <p className="pr-[24px] font-inter text-[14px] font-medium leading-[16px] tracking-[-0.56px] text-[#19363f]">
          Tu cuenta ya está lista
        </p>
        <p className="font-inter text-[12px] font-normal leading-[16px] tracking-[-0.24px] text-[rgba(25,54,63,0.7)]">
          {tabBlocked
            ? "Tu navegador bloqueó la pestaña nueva. Entra a tu dashboard desde aquí, o toca tu avatar aquí arriba."
            : "Abrimos tu dashboard en una pestaña nueva. Cuando quieras volver, toca tu avatar aquí arriba."}
        </p>

        <button
          type="button"
          onClick={openApp}
          className="relative mt-[2px] h-[30px] cursor-pointer overflow-hidden rounded-[100px] border border-solid border-[rgba(255,255,255,0.2)] bg-[#1b5ffd]"
        >
          <div className="relative flex h-full items-center justify-center gap-[6px] rounded-[inherit] px-[10px]">
            <Icon name="external-link" className="size-[12px]" fill="#f7f8f8" />
            <span className="font-inter text-[12px] font-medium tracking-[-0.48px] text-[#f7f8f8] whitespace-nowrap">
              Abrir la App
            </span>
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)" }}
          />
        </button>
      </div>
    </div>
  );
};

export default AppLaunchHint;
