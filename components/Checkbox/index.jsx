"use client";

/**
 * Checkbox — option card container
 *
 * Displays a selectable card with a custom radio/checkbox indicator on the left.
 * Shows a blue border outline when checked.
 *
 * Usage:
 *   <Checkbox checked={value} onChange={fn}>Label text</Checkbox>
 */
const Checkbox = ({
  children,
  checked,
  onChange,
  className = "",
  ...props
}) => {
  return (
    <label
      className={`relative flex items-center gap-[12px] p-[16px] rounded-[16px] border border-solid cursor-pointer transition-all select-none bg-white
        shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]
        ${
          checked
            ? "border-[#0062cc] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04),0px_0px_0px_1.5px_#0062cc]"
            : "border-[rgba(25,54,63,0.08)]"
        } ${className}`}
    >
      {/* Hidden native input for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        {...props}
      />

      {/* Custom indicator */}
      <div
        className={`relative shrink-0 size-[20px] rounded-full border-[1.5px] border-solid transition-all flex items-center justify-center
          ${
            checked
              ? "border-[#0062cc] bg-[#0062cc]"
              : "border-[rgba(25,54,63,0.25)] bg-white"
          }`}
      >
        {checked && (
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative shrink-0"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Label */}
      <span className="font-inter text-[12px] font-medium leading-[18px] tracking-[-0.24px] text-[#19363f]">
        {children}
      </span>
    </label>
  );
};

export default Checkbox;
