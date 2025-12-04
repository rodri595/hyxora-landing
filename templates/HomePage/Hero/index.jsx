import Button from "@/components/Button";
import Image from "@/components/Image";
import fireSVG from "@/assets/imgs/icons/fire.svg";
import chevronSVG from "@/assets/imgs/icons/chevron.svg";
import HeroImage from "./HeroImage";
const Hero = () => {
  return (
    <div className="flex flex-col items-center pt-[136px] pb-0 px-0 relative w-full ">
      {/* Content */}
      <div className="flex flex-col gap-[38px] items-center relative w-[657px] max-w-full ">
        {/* Text Content */}
        <div className="flex flex-col gap-7 items-center justify-center relative w-full">
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
                  Hot
                </p>
              </div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                }}
              />
            </div>
            <p className="font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px] whitespace-nowrap">
              Revolutionizing Digital Ownership
            </p>
            <Image
              src={chevronSVG}
              alt="Chevron Icon"
              className="relative w-[12px] h-[12px]"
            />
          </div>

          {/* Main Heading */}
          <h1 className="font-medium text-[54px] text-[#19363f] text-center tracking-[-2.16px] leading-[normal] w-full">
            A New Era of Digital Ownership Starts Now
          </h1>

          {/* Description */}
          <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] text-center tracking-[-0.32px] whitespace-nowrap">
            Empowered by blockchain, the future is decentralized — and it&apos;s
            yours to shape.
          </p>
        </div>
        {/* Get Started Button */}
        <Button isPrimary data-cursor-text="Join Now">
          Get Started
        </Button>
      </div>
      {/* Hero Image Section */}
      <HeroImage />
      {/* Scroll Down Indicator */}
      <div className="backdrop-blur-[10px] bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex gap-[6px] items-center pl-[9px] pr-[12px] py-[8px] relative rounded-[32px] max-h-[34px]">
        <p className="font-normal text-[12px] text-[#19363f] tracking-[-0.48px] whitespace-nowrap">
          Scroll down for more
        </p>
        {/* <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
        /> */}
      </div>
    </div>
  );
};

export default Hero;
