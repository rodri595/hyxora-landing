import Link from "next/link";
import Icon from "@/components/Icon";

const Field = ({
  className,
  classInput,
  label,
  children,
  textarea,
  type,
  validated,
  forgotPassword,
  ...inputProps
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
            {...inputProps}
          ></textarea>
        ) : (
          <input
            className={`w-full h-12 px-5.5 border-[1.5px] border-s-01 rounded-xl text-[13px] text-primary transition-colors outline-0 focus:border-s-02 ${
              validated ? "pr-10" : ""
            } ${classInput || ""}`}
            type={type || "text"}
            {...inputProps}
          />
        )}
        {validated && (
          <Icon
            className="absolute top-1/2 right-3.5 -translate-y-1/2   fill-secondary"
            name="check"
            // size={24}
          />
        )}
      </div>
      {/* <div className="mt-2 text-body-sm text-red">
        Please enter an email address.
      </div> */}
    </div>
  );
};

export default Field;
