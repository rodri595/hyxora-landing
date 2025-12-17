import Image from "@/components/Image";
import Button from "@/components/Button";
import phoneIMG from "@/assets/imgs/misc/demo.png";
import WalletItem from "./item";
import triangleIMG from "@/assets/imgs/icons/triangle.svg";
import xIMG from "@/assets/imgs/icons/x.svg";
import circleIMG from "@/assets/imgs/icons/circle.svg";
import squareIMG from "@/assets/imgs/icons/square.svg";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Finance = () => {
  const phoneRef = useRef(null);
  const containerRef = useRef(null);

  useGSAP(
    () => {
      gsap.to(phoneRef.current, {
        y: -50,
        scrollTrigger: {
          trigger: phoneRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="flex w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-2 lg:gap-12 max-w-[1240px] w-full mx-auto px-4 md:px-8 xl:px-8">
        {/* Left Section - Empty for customization */}
        <div className="flex flex-col gap-[40px] items-start pt-[40px] w-full lg:w-[486px] lg:shrink-0 xl:w-[486px]">
          {/* Text Section */}
          <div className="flex flex-col gap-[24px] items-start w-full lg:w-[471px]">
            {/* Badge */}
            <div className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] flex items-center justify-center px-[14px] py-[10px] rounded-[32px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
              <p className="font-medium text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px]">
                Finanzas DeFi
              </p>
            </div>
            {/* Title */}
            <h2 className="font-medium text-[28px] sm:text-[35px] tracking-[-1.6px] w-full leading-[1.2] flex flex-col">
              <span className="text-[rgba(25,54,63,0.6)]">
                Finanzas descentralizadas
              </span>
              <span className="text-[#19363f]"> DeFi</span>
            </h2>

            {/* Description */}
            <p className="font-normal leading-[24px] text-[14px] sm:text-[16px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] w-full">
              Las oportunidades del nuevo mundo financiero en tus manos{" "}
            </p>
          </div>

          {/* Wallet List Section */}
          <div className="flex flex-col gap-[10.913px] w-full">
            <WalletItem
              title="Staking"
              description="Consigue rendimientos e ingresos pasivos sólo por el hecho de mantener tu capital en Hyxora"
              iconSrc={circleIMG}
            />

            <WalletItem
              title="Swaps"
              description="Realiza cambios entre Fiat y Criptp en un solo click. Maximiza la rentabilidad de tu dinero"
              iconSrc={squareIMG}
            />

            <WalletItem
              title="Remesas internacionales"
              description="Envía dinero a otros usuarios en cualquier parte del mundo en segundos y sin coste"
              iconSrc={triangleIMG}
            />

            <WalletItem
              title="Fondos Indexados mixtos"
              description="Invierte en fondos indexados con las mayores rentabilidades que ambos mundos financieros pueden ofrecerte en conjunto. 
              "
              iconSrc={xIMG}
            />

            <WalletItem
              title="Proximamente"
              description="Pools de liquidez, Lending, etc. etc…."
              iconSrc={circleIMG}
            />
            <Button isPrimary>Get Started</Button>
          </div>
        </div>
        {/* Right Section -  */}
        <div className="w-full hidden lg:flex relative items-center justify-center rounded-[16px] flex-1 min-h-[746px] ">
          <Image
            ref={phoneRef}
            src={phoneIMG}
            alt="Finance Demo"
            className="min-w-[497px] max-w-[497px] h-[746px] absolute left-1/2 lg:left-[calc(50%-150px)] top-[10%] -translate-x-1/2 lg:translate-x-0"
          />
        </div>
      </div>
    </section>
  );
};

export default Finance;
