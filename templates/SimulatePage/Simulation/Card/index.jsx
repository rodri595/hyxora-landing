import { cn } from "@/utils";
const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-[16px]  flex-1",
        "rounded-[8px] border border-[#E2E2E2] bg-white shadow-depth-01",
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
