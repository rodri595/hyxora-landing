// import Button from "@/components/Button";
import Image from "@/components/Image";
import fireSVG from "@/assets/imgs/icons/fire.svg";
import chevronSVG from "@/assets/imgs/icons/chevron.svg";
import mouseSVG from "@/assets/imgs/icons/mouse.svg";
import appleIMG from "@/assets/imgs/misc/apple.svg";
import googleIMG from "@/assets/imgs/misc/google.svg";
import app1IMG from "@/assets/imgs/misc/01 - IPHONE.png";
import app2IMG from "@/assets/imgs/misc/02 - IPHONE.png";
import item1IMG from "@/assets/imgs/misc/swap.png";
import item2IMG from "@/assets/imgs/misc/graph.png";
import item3IMG from "@/assets/imgs/misc/staking.png";
import item4IMG from "@/assets/imgs/misc/tx-container.png";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import layerIMG from "./layer.png";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const containerRef = useRef(null);
  const rightItemRef = useRef(null);
  const leftItemRef = useRef(null);
  const topLeftItemRef = useRef(null);
  const bottomRightItemRef = useRef(null);

  useGSAP(
    () => {
      // Only apply parallax effects on desktop (screens larger than 1024px)
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // Parallax effect on scroll for right item - move down with rotation
        gsap.to(rightItemRef.current, {
          y: 60,
          x: -10,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 5,
          },
        });

        // Parallax effect on scroll for left item - move up with counter rotation
        gsap.to(leftItemRef.current, {
          y: -50,
          x: 10,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 5,
          },
        });

        // Parallax effect for top left item - slow diagonal movement
        gsap.to(topLeftItemRef.current, {
          y: 40,
          x: 20,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 5,
          },
        });

        // Parallax effect for bottom right item - fast upward movement
        gsap.to(bottomRightItemRef.current, {
          y: -70,
          x: -15,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 5,
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center pt-[136px] max-md:pt-[92px] pb-0 px-0 relative w-full max-md:overflow-hidden min-h-dvh "
    >
      {/* Content */}
      <div className="flex flex-col gap-[38px] w-full  max-md:gap-[34px] max-md:justify-between grow  overflow-hidden">
        <div className="flex flex-col gap-[38px] w-full items-center  max-md:gap-[16px]  ">
          <div className="flex flex-col gap-7 items-center justify-center relative w-full max-md:gap-[16px]">
            {/* Hot Badge */}
            <div
              className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex gap-[10px] items-center pr-[12px] pl-0 py-0 relative rounded-[32px]"
              style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
            >
              {/* Hot Button */}
              <div className="bg-[#1b5ffd] border border-[rgba(255,255,255,0.2)] border-solid h-[30px] relative rounded-[100px]">
                <div className="flex gap-[3px] h-[30px] items-center justify-center overflow-hidden p-[8px] relative rounded-[inherit]">
                  <Image
                    src={fireSVG}
                    alt="Fire Icon"
                    className="relative w-[10px] h-[10px]"
                  />
                  <p className="font-medium text-[12px] text-[#f7f8f8] tracking-[-0.48px] whitespace-nowrap">
                    Proximamente
                  </p>
                </div>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                  }}
                />
              </div>
              <p className="font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px] whitespace-nowrap max-md:tracking-[-0.24px] max-md:leading-[20px]">
                Quieres unirte a Hyxora?
              </p>
              <Image
                src={chevronSVG}
                alt="Chevron Icon"
                className="relative w-[12px] h-[12px]"
              />
            </div>
            {/* Main Heading */}
            <h1 className="flex items-center  gap-2 font-medium text-[50px] text-[#19363f] text-center tracking-[-4.16px] leading-[normal] max-md:text-[28px] max-md:tracking-[-1.12px]">
              Tu dinero. Tu control
            </h1>
            {/* Description */}
            <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] text-center tracking-[-0.32px] whitespace-nowrap max-md:text-[12px] max-md:tracking-[-0.24px] max-md:leading-[20px] max-md:whitespace-normal">
              Hyxora es el puente entre la banca tradicional y las finanzas del
              futuro
            </p>
          </div>

          {/* Download buttons stores */}
          <div className="flex gap-2 items-center justify-center opacity-60 cursor-not-allowed ">
            <Image
              alt="Download on the App Store"
              src={appleIMG}
              className="h-[44px] w-auto max-md:h-[40px]"
            />

            <Image
              src={googleIMG}
              alt="Get it on Google Play"
              className="h-[44px] w-auto max-md:h-[40px]"
            />
          </div>
        </div>
        <div className="flex items-start justify-center relative mx-auto gap-2 pb-[80px] max-md:gap-1 max-md:pb-[40px] max-md:h-[500px] max-md:overflow-hidden">
          <Image
            src={app1IMG}
            alt="App Landing"
            priority
            className="w-[280px] h-auto max-md:w-[220px]"
          />
          <Image
            src={app2IMG}
            alt="App Landing"
            priority
            className="w-[280px] h-auto mt-[80px] max-md:mt-[30px] max-md:w-[220px]"
          />
          <Image
            ref={rightItemRef}
            src={item2IMG}
            alt="Item Option"
            priority
            className="absolute top-[80px] right-[-240px]  w-auto h-[300px] rotate-0.1! max-lg:hidden"
          />
          <Image
            ref={leftItemRef}
            src={item3IMG}
            alt="Item Option"
            priority
            className="absolute bottom-[130px] left-[-320px] h-[200px] w-auto z-1 -rotate-0.1! max-lg:hidden"
          />
          <Image
            ref={topLeftItemRef}
            src={item1IMG}
            alt="Item Option"
            priority
            className="absolute top-[50px] left-[-400px] h-[80px] w-auto max-lg:hidden"
          />
          <Image
            ref={bottomRightItemRef}
            src={item4IMG}
            alt="Item Option"
            priority
            className="absolute bottom-[100px] right-[-500px]  h-[200px] w-auto max-lg:hidden"
          />
          <Image
            src={layerIMG}
            alt="layer blue Animation"
            priority
            className="w-full h-56 absolute bottom-0 blur-[2px] max-md:h-[15%] max-md:bottom-[-10px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, white 100%)",
            }}
          />
        </div>
      </div>
      {/* Scroll Down Indicator */}
      <div
        data-cursor-text="Scroll Down"
        className="backdrop-blur-[10px] bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex gap-[6px] items-center pl-[9px] pr-[12px] py-[8px] relative rounded-[32px] max-h-[34px] max-md:py-[9px]"
      >
        <Image
          src={mouseSVG}
          alt="Mouse Icon"
          className="relative w-[12px] h-[15px] max-md:w-[16px] max-md:h-[16px]"
        />
        <p className="font-normal text-[12px] text-[#19363f] tracking-[-0.48px] whitespace-nowrap">
          Scroll down for more
        </p>
      </div>
    </div>
  );
};

export default Hero;
