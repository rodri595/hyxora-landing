"use client";
import Link from "next/link";
import Icon from "@/components/Icon";
import CopyButton from "@/components/CopyButton";
import { useIsIOS } from "@/hooks";
import { cn } from "@/utils";
const Field = ({
  className,
  classInput,
  classLabel,
  label,
  children,
  textarea,
  type,
  validated,
  mono,
  hint,
  copy,
  copyVariant,
  icon = "check",
  iconFill = "green",
  iconSize = 24,
  iconHandler = null,
  forgotPassword,
  iconClassName,
  isDark,
  ...props
}) => {
  // Trailing copy button — same slot pattern as `validated`. Pass `copy` as the
  // text to copy; it renders a CopyButton only when there's something to copy.
  const showCopy = Boolean(copy) && copy !== "N/A";
  const hasTrailing = validated || showCopy;
  // iOS Safari zooms in when focusing a control under 16px; bump the font only
  // on iOS so the compact design is preserved on every other platform.
  const isIOS = useIsIOS();
  const noZoomText = isIOS ? "text-[16px]" : "";
  return (
    <div className={`${className || ""}`}>
      {label && (
        <div className="flex items-center mb-2 font-inter">
          <div
            className={cn(
              "mr-auto text-[12px] font-medium tracking-[-0.12px]",
              isDark ? "text-white" : "",
              classLabel,
            )}
          >
            {label}
          </div>
          {forgotPassword && (
            <Link
              className="text-[12px] text-secondary transition-colors hover:text-primary"
              href="/reset-password"
            >
              Forgot password?
            </Link>
          )}
        </div>
      )}
      <div className={`relative ${textarea ? "text-0" : ""}`}>
        {children}
        {textarea ? (
          <textarea
            className={cn(
              "w-full h-20 px-5.5 py-4 border-[1.5px] border-s-01 rounded-xl text-[13px] text-primary transition-colors resize-none outline-0 focus:border-s-02",
              hasTrailing && "pr-10",
              mono && "font-mono",
              noZoomText,
              classInput,
            )}
            {...props}
          />
        ) : (
          <input
            className={cn(
              "w-full h-[32px] px-[16px] border-[0.7px] rounded-[8px] text-[12px] transition-colors outline-0",
              isDark
                ? "bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.06)] text-[#cdcdcd] placeholder:text-[#cdcdcd] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] focus:bg-[rgba(255,255,255,0.10)] focus:border-[rgba(255,255,255,0.12)]"
                : "bg-[rgba(25,54,63,0.02)] border-[rgba(25,54,63,0.02)] text-[#5E7279] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] focus:bg-white focus:border-[rgba(25,54,63,0.04)] focus:shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]",
              hasTrailing && "pr-10",
              mono && "font-mono",
              noZoomText,
              classInput,
            )}
            type={type || "text"}
            {...props}
          />
        )}
        {validated && (
          <Icon
            className={cn(
              "absolute top-1/2 right-3.5 -translate-y-1/2",
              iconClassName,
            )}
            name={icon}
            fill={iconFill}
            size={iconSize}
            onClick={iconHandler}
          />
        )}
        {showCopy && (
          <CopyButton
            text={copy}
            variant={copyVariant ?? (isDark ? "dark" : "light")}
            className="absolute top-1/2 right-2 -translate-y-1/2"
          />
        )}
      </div>
      {hint && (
        <span
          className={cn(
            "mt-1.5 block font-inter text-[10px] tracking-[-0.4px]",
            isDark
              ? "text-[rgba(255,255,255,0.4)]"
              : "text-[rgba(25,54,63,0.4)]",
          )}
        >
          {hint}
        </span>
      )}
    </div>
  );
};

export default Field;
