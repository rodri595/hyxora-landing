import Image from "@/components/Image";
import tokensIMG from "@/assets/imgs/brand/tokens.webp";
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
          className="w-[750px] h-[483.261px] absolute  left-1/2 -translate-x-1/2 bottom-[-56px]  opacity-80 max-md:w-[516px] max-md:h-[332px] max-md:bottom-[-30px] "
        />
        <Image
          src={tokensIMG}
          alt="Tokens Animation"
          width={1284}
          height={722}
          priority
          quality={75}
          sizes="(max-width: 768px) 0px, 1284px"
          className="absolute w-[1283.556px] h-[722px] left-1/2 -translate-x-1/2 bottom-[-198px] max-md:w-[816px] max-md:h-[459px] max-md:bottom-[-100.56px] max-md:hidden"
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
    </div>
  );
};

export default HeroImage;
