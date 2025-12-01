import { useState } from "react";
import Icon from "@/components/Icon";

type FieldProps = {
    className?: string;
    classInput?: string;
    label?: string;
    isTextarea?: boolean;
    type?: string;
    onResetPassword?: () => void;
    isLarge?: boolean;
    currency?: string;
};

const Field = ({
    className,
    classInput,
    label,
    isTextarea,
    type,
    onResetPassword,
    isLarge,
    currency,
    ...inputProps
}: FieldProps &
    React.InputHTMLAttributes<HTMLInputElement> &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const error = false;

    return (
        <div
            className={`relative ${
                label ? `${isLarge ? "pt-2.25" : "pt-1.5"}` : ""
            } ${className || ""}`}
        >
            {label && (
                <div
                    className={`absolute top-0 left-6 z-2 px-1 bg-b-surface1 text-t-primary font-medium pointer-events-none ${
                        isLarge ? "text-hairline" : "text-small"
                    }`}
                >
                    {label}
                </div>
            )}
            <div className={`relative ${isTextarea ? "flex" : ""}`}>
                {isTextarea ? (
                    <textarea
                        className={`w-full px-6.5 py-4 border-[1.5px] border-stroke1 text-t-primary font-medium transition-colors resize-none outline-0 placeholder:text-t-tertiary focus:border-[#A8A8A8]/50! max-md:text-[1rem] ${
                            error ? "border-primary3!" : ""
                        } ${
                            isLarge
                                ? "h-77 rounded-2xl text-heading-thin tracking-normal! max-md:h-65"
                                : "h-32 rounded-3xl text-input"
                        } ${classInput || ""}`}
                        {...inputProps}
                    ></textarea>
                ) : (
                    <input
                        className={`w-full px-6.5 border-[1.5px] border-stroke1 text-t-primary font-medium transition-colors outline-0 placeholder:text-t-tertiary focus:border-[#A8A8A8]/50! max-md:text-[1rem] ${
                            error ? "!border-primary3!" : ""
                        } ${
                            onResetPassword || type === "password"
                                ? "pr-12"
                                : ""
                        } ${
                            isLarge
                                ? "h-16 rounded-2xl text-heading-thin tracking-normal!"
                                : "h-12 rounded-3xl text-input"
                        } ${currency ? "pl-10" : ""} ${classInput || ""}`}
                        type={
                            type === "password"
                                ? isPasswordVisible
                                    ? "text"
                                    : "password"
                                : type
                        }
                        {...inputProps}
                    />
                )}
                {onResetPassword && (
                    <button
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-0 fill-t-tertiary transition-colors hover:fill-t-secondary"
                        onClick={onResetPassword}
                    >
                        <Icon className="fill-inherit" name="question-circle" />
                    </button>
                )}
                {!onResetPassword && type === "password" && (
                    <button
                        className="group absolute top-1/2 right-5 -translate-y-1/2"
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <Icon
                            className="fill-t-tertiary transition-colors group-hover:fill-t-primary"
                            name={isPasswordVisible ? "eye" : "eye-hide"}
                        />
                    </button>
                )}
                {currency && (
                    <div className="absolute top-1/2 left-7 -translate-y-1/2 text-button text-t-tertiary pointer-events-none">
                        {currency}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Field;
