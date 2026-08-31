import Globe from "./Globe";
import Link from "next/link";
import fireSVG from "@/assets/imgs/icons/fire.svg";
import Image from "@/components/Image";
import chevronSVG from "@/assets/imgs/icons/chevron.svg";

const MapSection = () => {
  return (
    <section className="flex w-full" id="map">
      <div className="flex gap-[40px] items-start max-w-[1340px] w-full mx-auto max-xl:px-[32px] max-md:px-[16px] max-lg:flex-col ">
        {/* Left — globe focused on the Americas */}
        <Globe />

        {/* Right — Content */}
        <div className="flex flex-col gap-[80px] max-md:gap-[48px] items-start pt-[40px] max-md:pt-0 ">
          {/* Text */}
          <div className="flex flex-col gap-[28px] items-start max-w-[471px] w-full max-sm:gap-5">
            {/* Badge */}
            {/* Hot Badge */}
            <Link
              target="_blank"
              href="https://app.hyxora.com/"
              rel="noopener noreferrer"
              className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex gap-[10px] items-center pr-[12px] pl-0 py-0 relative rounded-[32px]"
              style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
            >
              {/* Hot Button */}
              <div className="bg-[#1b5ffd] border border-[rgba(255,255,255,0.2)] border-solid h-[30px] relative rounded-[100px]">
                <div className="flex gap-[3px] h-[30px] items-center justify-center overflow-hidden p-[8px] relative rounded-[inherit]">
                  <Image src={fireSVG} alt="Fire Icon" className="relative w-[10px] h-[10px]" />
                  <p className="font-medium text-[12px] text-[#f7f8f8] tracking-[-0.48px] whitespace-nowrap">
                    Acceso a la Plataforma
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
                Hyxora
              </p>
              <Image src={chevronSVG} alt="Chevron Icon" className="relative w-[12px] h-[12px]" />
            </Link>

            {/* Title */}
            <p className="font-medium text-[40px] max-lg:text-[32px] max-md:text-[28px] max-sm:text-[24px] leading-[normal] tracking-[-1.6px] max-lg:tracking-[-1.28px] max-md:tracking-[-1.12px] max-sm:tracking-[-0.96px] w-[346px] max-md:w-full">
              <span className="text-[rgba(25,54,63,0.6)]">Hyxora </span>
              <span className="text-[#19363f]">en el mundo</span>
            </p>
            {/* Description */}
            <p className="font-normal text-[16px] max-md:text-[14px] max-sm:text-[13px] leading-6 max-sm:leading-5 text-[rgba(25,54,63,0.7)] tracking-[-0.32px] max-sm:tracking-[-0.26px] w-full">
              Estamos abriendo colaboraciones por todo el planeta. ¿Quieres formar parte de la
              expansión de Hyxora?{" "}
              <a href="mailto:future@hyxora.com" className="text-[#19363f] underline">
                Contáctanos
              </a>
            </p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-7.5 items-start  max-xl:grid-cols-1 w-full">
            <div className="flex flex-col gap-[16px] items-start max-sm:w-full">
              <p className="font-medium text-[28px] max-lg:text-[24px] max-md:text-[22px] max-sm:text-[20px] leading-[normal] text-[#19363f] tracking-[-1.36px] max-sm:tracking-[-1px]">
                100% Autocustodia
              </p>
              <p className="font-normal text-[16px] max-md:text-[14px] max-sm:text-[13px] leading-6 max-sm:leading-5 text-[rgba(25,54,63,0.7)] tracking-[-0.32px] max-sm:tracking-[-0.26px]">
                Sé el dueño de tus fondos
              </p>
            </div>
            <div className="flex flex-col gap-[16px] items-start max-sm:w-full">
              <p className="font-medium text-[28px] max-lg:text-[24px] max-md:text-[22px] max-sm:text-[20px] leading-[normal] text-[#19363f] tracking-[-1.36px] max-sm:tracking-[-1px]">
                39 Países
              </p>
              <p className="font-normal text-[16px] max-md:text-[14px] max-sm:text-[13px] leading-6 max-sm:leading-5 text-[rgba(25,54,63,0.7)] tracking-[-0.32px] max-sm:tracking-[-0.26px]">
                Retiros en moneda local{" "}
              </p>
            </div>
            <div className="flex flex-col gap-[16px] items-start max-sm:w-full">
              <p className="font-medium text-[28px] max-lg:text-[24px] max-md:text-[22px] max-sm:text-[20px] leading-[normal] text-[#19363f] tracking-[-1.36px] max-sm:tracking-[-1px]">
                {/* +10 Comunididades */}
                +55 NFT Founders
              </p>
              <p className="font-normal text-[16px] max-md:text-[14px] max-sm:text-[13px] leading-6 max-sm:leading-5 text-[rgba(25,54,63,0.7)] tracking-[-0.32px] max-sm:tracking-[-0.26px]">
                creciendo con founders de todo el mundo
                {/* Hyxora por todo el mundo, con más de 50 NFT-Founder */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
