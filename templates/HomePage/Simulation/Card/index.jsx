import { cn } from "@/utils";
const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-[16px] min-w-[300px] h-[128px] flex-1",
        "rounded-[8px] border border-[#19222C] bg-[#0D0D0D]",
        "p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
