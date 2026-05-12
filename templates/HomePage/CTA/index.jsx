"use client";
import { useRef, useState } from "react";
import Image from "@/components/Image";
import Button from "@/components/Button";
import checkSVG from "@/assets/imgs/icons/check.svg";
import WelcomeModal from "@/components/Header/WelcomeModal";
import { useLogin, usePrivy } from "@privy-io/react-auth";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

const CTA = () => {
  const { login } = useLogin();
  const { authenticated } = usePrivy();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const marqueeRef = useRef(null);
  const features = [
    "Acceso anticipado a nuevas funcionalidades",
    "Análisis semanal del mercado cripto",
    "Alertas de oportunidades DeFi",
  ];
  const handleApuntate = () => setWelcomeOpen(true);
  const handleLogin = () => {
    setWelcomeOpen(false);
    login();
  };

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
    <>
      <section
        className="flex flex-col gap-10 items-center w-full py-20 max-w-[886px] mx-auto"
        data-cursor-text="Join Now"
      >
        {/* Text Section */}
        <div className="flex flex-col gap-7 items-center text-center w-full max-w-[495px]">
          <h2 className="font-medium text-[40px] leading-[40px] tracking-[-1.6px] text-[#19363f]">
            <span className="text-[rgba(25,54,63,0.6)]">
              Mantente al día con{" "}
            </span>
            <span className="text-[#19363f]">Hyxora</span>
          </h2>
          <p className="font-normal text-[16px] leading-[24px] tracking-[-0.32px] text-[rgba(25,54,63,0.7)]">
            Incluir los canales de la Comunidad Hyxora y el Acceso al Podcast
            Elefantedesnudo
          </p>
        </div>

        {/* Features Section  */}
        <div className="relative w-full overflow-hidden  [mask-image:linear-gradient(to_right,transparent,#000_10%_90%,transparent)]">
          <div
            ref={marqueeRef}
            className="flex gap-6 items-center will-change-transform "
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
        </div>
        {!authenticated && (
          <Button isPrimary type="button" onClick={handleApuntate}>
            Únete
          </Button>
        )}
      </section>
      <WelcomeModal
        open={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
};

export default CTA;
