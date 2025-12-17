import checkSVG from "@/assets/imgs/icons/check.svg";
import Year from "./year";
import Image from "@/components/Image";
import fireSVG from "@/assets/imgs/icons/fire.svg";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, CustomEase);

CustomEase.create(
  "hop",
  "M0,0 C0.29,0 0.348,0.05 0.422,0.134 0.494,0.217 0.484,0.355 0.5,0.5 0.518,0.662 0.515,0.793 0.596,0.876 0.701,0.983 0.72,0.987 1,1 "
);

const Roadmap = () => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      // Animate years from left to right with stagger
      tl.from(".roadmap-year", {
        opacity: 0,
        x: -50,
        duration: 1,
        stagger: 0.25,
        ease: "hop",
        clearProps: "all",
      });

      // Animate lines with clip-path
      tl.from(
        ".roadmap-line",
        {
          clipPath: "inset(0 100% 0 0)",
          duration: 1.2,
          ease: "hop",
        },
        "-=0.7"
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="flex flex-col gap-[70px] items-center w-full px-4 max-lg:hidden"
    >
      {/* Header Text Section */}
      <div className="flex flex-col gap-2 items-center justify-center w-full max-w-[700px]">
        {/* Main Heading */}
        <h2 className="font-medium text-[40px] leading-[38px] tracking-[-0.04em]  text-[#19363f] text-center w-full max-md:text-[20px] max-md:leading-normal max-md:tracking-[-0.8px] ">
          RoadMap
        </h2>
        {/* Description */}
        <p className="font-normal text-[16px] text-[rgba(25,54,63,0.7)] text-center tracking-[-0.32px] leading-6 w-full max-w-[575px]">
          En breve podrás disfrutar de todas las funcionalidades de Hyxora,
          estate atento a las noticias del lanzamiento
        </p>
      </div>
      <div className="flex flex-col items-center justify-center max-w-[1220px] gap-12">
        {/* First Row */}
        <div className="relative w-full p-4  pl-[212px] flex rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
          {/* Hot Badge */}
          <div
            className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex gap-[10px] items-center px-[12px] py-0 absolute rounded-[32px] left-[8px] top-[-32px]"
            style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
          >
            <p className="font-bold text-[10px] text-[rgba(25,54,63,0.7)] tracking-tight whitespace-nowrap  ">
              Hyxora
            </p>
          </div>
          <div
            className="roadmap-line will-change-[clip-path] w-[calc(100%-460px)] h-0.5 absolute left-[236px] top-[34px]"
            style={{
              backgroundImage: `
                linear-gradient(to right, 
                  rgba(25, 54, 63, 1) 0%,
                  rgba(25, 54, 63, 1) 15%,
                  rgba(25, 54, 63, 0.16) 28%,
                  rgba(25, 54, 63, 0.16) 72%,
                  rgba(25, 54, 63, 1) 85%,
                  rgba(25, 54, 63, 1) 100%
                ),
                repeating-linear-gradient(to right, 
                  transparent, 
                  transparent 8px, 
                  rgba(25, 54, 63, 1) 8px, 
                  rgba(25, 54, 63, 1) 16px
                )
              `,
              backgroundSize: "100% 100%, 16px 100%",
              WebkitMaskImage:
                "repeating-linear-gradient(to right, black 0px, black 8px, transparent 8px, transparent 16px)",
              maskImage:
                "repeating-linear-gradient(to right, black 0px, black 8px, transparent 8px, transparent 16px)",
            }}
          />

          <Year
            className="roadmap-year"
            year="2026"
            rightItems={[
              {
                icon: checkSVG,
                text: "Lanzamiento 1º trimestre",
              },
            ]}
          />

          <Year
            className="roadmap-year"
            year="2027"
            rightItems={[
              {
                icon: checkSVG,
                text: "Modelo Pymes",
              },
              {
                icon: checkSVG,
                text: "Nuevas funcionalidades DeFi",
              },
              {
                icon: checkSVG,
                text: "Internacionalización - Latam",
              },
            ]}
          />

          <Year
            className="roadmap-year"
            year="2028"
            rightItems={[
              {
                icon: checkSVG,
                text: "Crecimiento",
              },
            ]}
          />
        </div>
        {/* Second Row */}
        <div className="relative w-full  p-4 flex rounded-[16px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
          {/* Hot Badge */}
          <div
            className=" backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex gap-[10px] items-center pr-[12px] pl-0 py-0 absolute rounded-[32px] left-[8px] top-[-32px]"
            style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
          >
            {/* Hot Button */}
            <div className="bg-[#1b5ffd] h-[17px] border border-[rgba(255,255,255,0.2)] border-solid  relative rounded-[100px]">
              <div className="flex gap-[3px] h-[17px]  items-center justify-center overflow-hidden px-[4px] relative rounded-[inherit]">
                <Image
                  src={fireSVG}
                  alt="Fire Icon"
                  className="relative w-[10px] h-[10px] "
                />
                <p className="font-medium text-[8px] text-[#f7f8f8] tracking-tight whitespace-nowrap">
                  NFT
                </p>
              </div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                }}
              />
            </div>
            <p className="font-bold text-[10px] text-[rgba(25,54,63,0.7)] tracking-tight whitespace-nowrap">
              Founders
            </p>
          </div>
          <div
            className="roadmap-line will-change-[clip-path] w-[calc(100%-460px)] h-0.5 absolute left-[236px] top-[34px]"
            style={{
              backgroundImage: `
                linear-gradient(to right, 
                  rgba(25, 54, 63, 1) 0%,
                  rgba(25, 54, 63, 1) 15%,
                  rgba(25, 54, 63, 0.16) 28%,
                  rgba(25, 54, 63, 0.16) 72%,
                  rgba(25, 54, 63, 1) 85%,
                  rgba(25, 54, 63, 1) 100%
                ),
                repeating-linear-gradient(to right, 
                  transparent, 
                  transparent 8px, 
                  rgba(25, 54, 63, 1) 8px, 
                  rgba(25, 54, 63, 1) 16px
                )
              `,
              backgroundSize: "100% 100%, 16px 100%",
              WebkitMaskImage:
                "repeating-linear-gradient(to right, black 0px, black 8px, transparent 8px, transparent 16px)",
              maskImage:
                "repeating-linear-gradient(to right, black 0px, black 8px, transparent 8px, transparent 16px)",
            }}
          />

          <Year
            className="roadmap-year items-center!"
            year="2026"
            leftItems={[
              {
                icon: checkSVG,
                text: "Lanzamiento 50 und",
              },
            ]}
            rightItems={[
              {
                icon: checkSVG,
                text: "Lanzamiento 350 und",
              },
            ]}
          />

          <Year
            className="roadmap-year"
            year="2027"
            rightItems={[
              {
                icon: checkSVG,
                text: "Lanzamiento 600 und",
              },
            ]}
          />

          <Year
            className="roadmap-year"
            year="2028"
            rightItems={[
              {
                icon: checkSVG,
                text: "Marketplace NFT abierto",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
