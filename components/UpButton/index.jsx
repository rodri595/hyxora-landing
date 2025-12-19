import { usePathname } from "next/navigation";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import { useScrollPosition } from "@/hooks";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const UpButton = () => {
  const scrollPosition = useScrollPosition();

  const pathname = usePathname();

  const goTop = () => {
    gsap.to(window, {
      scrollTo: {
        y: 0,
        autoKill: true,
      },
      duration: 1.2,
      ease: "power3.inOut",
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
