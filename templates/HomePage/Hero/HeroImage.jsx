import Image from "@/components/Image";
import tokensGIF from "@/assets/imgs/brand/tokens.gif";
import patternIMG from "./pattern.svg";
import layerIMG from "./layer.png";

const HeroImage = () => {
  return (
    <div className="relative w-full h-[405px] pointer-events-none  max-md:h-[344px] max-md:pb-[30.561px] max-2xl:overflow-hidden  grow">
      <div className="absolute w-[1282px] h-[632px] left-1/2 -translate-x-1/2 bottom-[-32px] overflow-hidden max-md:h-[598.439px]">
        <Image
          src={patternIMG}
          alt="pattern"
          className="w-[750px] h-[483.261px] absolute  left-1/2 -translate-x-1/2 bottom-[-56px]  opacity-80 max-md:w-[516px] max-md:h-[332px] max-md:bottom-[-30px]"
        />
        <Image
          src={tokensGIF}
          alt="Tokens Animation"
          className="absolute w-[1283.556px] h-[722px] left-1/2 -translate-x-1/2 bottom-[-198px] max-md:w-[816px] max-md:h-[459px] max-md:bottom-[-100.56px] "
        />
      </div>
      <Image
        src={layerIMG}
        alt="layer blue Animation"
        className="w-full h-56 absolute bottom-[-34px] blur-[2px] max-md:bottom-[-45px] "
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, white 100%)",
        }}
      />
    </div>
  );
};

export default HeroImage;
