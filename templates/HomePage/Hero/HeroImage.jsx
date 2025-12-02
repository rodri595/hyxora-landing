import Image from "@/components/Image";
import tokensGIF from "@/assets/imgs/brand/tokens.gif";
import patternIMG from "./pattern.svg";
import layerIMG from "./layer.png";

const HeroImage = () => {
  return (
    <div className="relative w-full h-[400px] pointer-events-none ">
      <div
        className="absolute w-[1282px] h-[632px] left-1/2 -translate-x-1/2 overflow-hidden "
        style={{
          bottom: "-32px",
        }}
      >
        <Image
          src={patternIMG}
          alt="pattern"
          className="w-[750px] h-[483.261px] absolute  left-1/2 -translate-x-1/2  opacity-80 "
          style={{
            bottom: "-56px",
          }}
        />
        <Image
          src={tokensGIF}
          alt="Tokens Animation"
          className="absolute w-[1283.556px] h-[722px] left-1/2 -translate-x-1/2  "
          style={{
            bottom: "-198px",
          }}
        />
      </div>
      {/* <div
        className="w-full h-56 absolute isolate opacity-80"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, white 100%)",
            backdropFilter: "blur(2px)",
          bottom: "-34px",
        }}
      /> */}
      <Image
        src={layerIMG}
        alt="layer blue Animation"
        className="w-full h-56 absolute"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, white 100%)",
          backdropFilter: "blur(2px)",
          bottom: "-34px",
        }}
      />
    </div>
  );
};

export default HeroImage;
