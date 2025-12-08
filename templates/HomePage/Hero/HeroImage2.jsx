import Image from "@/components/Image";
import patternIMG from "./pattern.svg";
import layerIMG from "./layer.png";

const HeroImage = () => {
  return (
    <div className="relative w-full h-[405px] pointer-events-none  max-md:h-[344px] max-md:pb-[30.561px] max-2xl:overflow-hidden  grow">
      <div className="absolute w-[1282px] h-[632px] left-1/2 -translate-x-1/2 bottom-[-32px] overflow-hidden max-md:h-[598.439px]">
        <Image
          src={patternIMG}
          alt="pattern"
          width={750}
          height={483}
          priority
          quality={80}
          className="w-[750px] h-[483.261px] absolute  left-1/2 -translate-x-1/2 bottom-[-56px]  opacity-50 max-md:w-[516px] max-md:h-[332px] max-md:bottom-[-30px] "
        />
      </div>
      <Image
        src={layerIMG}
        alt="layer blue Animation"
        width={1282}
        height={224}
        priority
        quality={70}
        className="w-full h-56 absolute bottom-[-36px] blur-[2px] max-md:bottom-[-45px] "
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, white 100%)",
        }}
      />
      {/* Stats Container */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[100px] z-1  w-full max-w-[840px]">
        <div className="grid grid-cols-3  gap-[30px] ">
          <p className="font-medium text-[22px] text-center text-[#19363f] tracking-[-1.36px] leading-normal max-md:text-[28px] ">
            Seguridad y Transparencia
          </p>
          <p className="font-medium text-[22px] text-center text-[#19363f] tracking-[-1.36px] leading-normal max-md:text-[28px] ">
            Sencillez y usabilidad
          </p>
          <p className="font-medium text-[22px] text-center text-[#19363f] tracking-[-1.36px] leading-normal max-md:text-[28px] ">
            Oportunidades DeFi
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroImage;
