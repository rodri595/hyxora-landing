import Link from "next/link";
import Icon from "@/components/Icon";
import { cn } from "@/utils";
const Field = ({
  className,
  classInput,
  label,
  children,
  textarea,
  type,
  validated,
  forgotPassword,
  ...props
}) => {
  return (
    <div className={`${className || ""}`}>
      {label && (
        <div className="flex items-center mb-2 font-inter">
          <div className="mr-auto text-[12px] font-medium tracking-[-0.12px] ">
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
            className={`w-full h-20 px-5.5 py-4 border-[1.5px] border-s-01 rounded-xl text-[13px] text-primary transition-colors resize-none outline-0 focus:border-s-02 ${
              validated ? "pr-10" : ""
            }  ${classInput || ""}`}
            {...props}
          ></textarea>
        ) : (
          <input
            className={cn(
              "w-full h-[32px] px-5.5 border-[0.7px] border-[rgba(25,54,63,0.02)] rounded-[8px] text-[12px] text-[#5E7279] transition-colors outline-0",
              "bg-[rgba(25,54,63,0.02)] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] focus:bg-white focus:border-[rgba(25,54,63,0.04)] focus:shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)]",
              validated && "pr-10",
              classInput,
            )}
            type={type || "text"}
            {...props}
          />
        )}
        {validated && (
          <Icon
            className="absolute top-1/2 right-3.5 -translate-y-1/2  size-[20px]"
            name="check"
            fill="green"
          />
        )}
      </div>
    </div>
  );
};

export default Field;
