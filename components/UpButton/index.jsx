import { usePathname } from "next/navigation";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import { useScrollPosition } from "@/hooks";
const UpButton = () => {
  const scrollPosition = useScrollPosition();
  const pathname = usePathname();
  const goTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <Button
      className={`fixed! right-5 bottom-5 z-5 px-0! [&_svg]:-rotate-90 transition-all! max-md:hidden max-md:bottom-4 max-md:right-4 ${
        scrollPosition > 100 ? "opacity-100" : "opacity-0"
      } ${pathname === "/" ? "max-md:flex!" : ""}`}
      onClick={goTop}
      isPrimary
      isCircle
    >
      <Icon name="arrow" />
    </Button>
  );
};

export default UpButton;
