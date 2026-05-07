import { cn } from "@/utils";
const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-[16px] min-w-[300px] h-[128px] flex-1",
        "rounded-[8px] border border-[#E4E9EF] bg-white",
        "p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
