import Link from "next/link";
import Icon from "@/components/Icon";

const Button = ({
  className,
  icon,
  children,
  isPrimary,
  isSecondary,
  isStroke,
  isCircle,
  as = "button",
  ...props
}) => {
  const isLink = as === "link";
  const Component = isLink ? Link : as;

  return (
    <Component
      className={`inline-flex items-center font-inter justify-center h-[38px] px-6 border border-solid rounded-[100px] font-medium text-[16px] leading-6 tracking-[-0.64px] transition-all cursor-pointer disabled:pointer-events-none relative ${
        isPrimary
          ? "bg-[#19363f] border-[rgba(255,255,255,0.2)] text-white fill-white shadow-[0px_0px_10px_0px_inset_rgba(255,255,255,0.4)] hover:shadow-[0px_0px_15px_0px_inset_rgba(255,255,255,0.5)]"
          : ""
      } ${
        isSecondary
          ? "bg-white border-[rgba(25,54,63,0.2)] text-[#19363f] fill-[#19363f] shadow-[0px_0px_10px_0px_inset_rgba(25,54,63,0.4)] hover:shadow-[0px_0px_15px_0px_inset_rgba(25,54,63,0.5)]"
          : ""
      } ${
        isStroke
          ? "backdrop-blur-[10px] bg-[rgba(25,54,63,0.01)] border-[rgba(255,255,255,0.2)] text-white fill-white shadow-[0px_0px_10px_0px_inset_rgba(255,255,255,0.1)] hover:shadow-[0px_0px_15px_0px_inset_rgba(255,255,255,0.15)]"
          : ""
      } ${isCircle ? "gap-0! w-[38px] h-[38px] px-0!" : ""} ${className || ""}`}
      {...(isLink ? props : props)}
    >
      {icon && <Icon className="mr-2 fill-inherit" name={icon} />}
      {children}
    </Component>
  );
};

export default Button;
