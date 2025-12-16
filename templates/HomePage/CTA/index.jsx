"use client";
import { useRef } from "react";
import Image from "@/components/Image";
import Button from "@/components/Button";
import checkSVG from "@/assets/imgs/icons/check.svg";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const CTA = () => {
  const marqueeRef = useRef(null);

  const features = [
    "Acceso anticipado a nuevas funcionalidades",
    "Análisis semanal del mercado cripto",
    "Alertas de oportunidades DeFi",
  ];

  useGSAP(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const firstSet = marquee.children[0];
    const marqueeWidth = firstSet.offsetWidth;

    // Create infinite loop animation
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(marquee, {
      x: -marqueeWidth,
      duration: 20,
      // ease: "none",
      ease: "linear",
      repeat: -1,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      className="flex flex-col gap-10 items-center w-full py-20 max-w-[886px] mx-auto"
      data-cursor-text="Join Now"
    >
      {/* Text Section */}
      <div className="flex flex-col gap-7 items-center text-center w-full max-w-[495px]">
        <h2 className="font-medium text-[40px] leading-normal tracking-[-1.6px] text-[#19363f]">
          <span className="text-[rgba(25,54,63,0.6)]">
            Mantente al día con{" "}
          </span>
          <span className="text-[#19363f]">Hyxora</span>
        </h2>
        <p className="font-normal text-[16px] leading-[24px] tracking-[-0.32px] text-[rgba(25,54,63,0.7)]">
          Suscríbete a nuestra newsletter y recibe las últimas novedades,
          tendencias cripto y oportunidades exclusivas directamente en tu
          correo.
        </p>
      </div>

      {/* Features Section  */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={marqueeRef}
          className="flex gap-6 items-center will-change-transform"
        >
          {/* First set of features */}
          <div className="flex gap-6 items-center shrink-0 ">
            {features.map((feature, index) => (
              <div
                key={`first-${index}`}
                className="flex gap-2.5 items-center shrink-0"
              >
                <Image
                  src={checkSVG}
                  alt="Check"
                  className="relative w-5 h-5"
                />
                <p className="font-medium text-[16px] leading-[24px] tracking-[-0.64px] text-[#19363f] whitespace-nowrap">
                  {feature}
                </p>
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex gap-6 items-center shrink-0">
            {features.map((feature, index) => (
              <div
                key={`second-${index}`}
                className="flex gap-2.5 items-center shrink-0"
              >
                <Image
                  src={checkSVG}
                  alt="Check"
                  className="relative w-5 h-5"
                />
                <p className="font-medium text-[16px] leading-[24px] tracking-[-0.64px] text-[#19363f] whitespace-nowrap">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Left blur */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[140px] h-10 pointer-events-none z-1"
          style={{
            backdropFilter: "blur(2px)",
            background:
              "linear-gradient(90deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%)",
          }}
        />
        {/* Right blur */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[140px] h-10 pointer-events-none z-1"
          style={{
            backdropFilter: "blur(2px)",
            background:
              "linear-gradient(270deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%)",
          }}
        />
      </div>
      <Button isPrimary>Únete</Button>
    </section>
  );
};

export default CTA;
