import Image from "@/components/Image";
import { cn } from "@/utils";
import spinnerImage from "@/assets/imgs/misc/pattern2.svg";

const Spinner = ({ className }) => {
  return (
    <div
      className={cn(
        "flex mx-auto items-center justify-center overflow-hidden",
        "size-[50px] animate-[spin_2s_linear_infinite]",
        className,
      )}
    >
      <Image src={spinnerImage} alt="" className="size-full " />
    </div>
  );
};

export default Spinner;
