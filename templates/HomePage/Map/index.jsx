import Globe from "./Globe";

const MapSection = () => {
  return (
    <section className="flex w-full" id="map">
      <div className="flex gap-[70px] items-start max-w-[1240px] w-full mx-auto max-xl:px-[32px] max-md:px-[16px] max-lg:flex-col max-lg:gap-[40px]">
        {/* Left — globe focused on the Americas */}
        <Globe />

        {/* Right — Content */}
        <div className="flex flex-col gap-[80px] max-md:gap-[48px] items-start pt-[40px] max-md:pt-0 shrink-0 w-[486px] max-lg:w-full">
          {/* Text */}
          <div className="flex flex-col gap-[28px] items-start w-[471px] max-lg:w-full">
            {/* Badge */}
            <div className="relative flex items-center justify-center px-[14px] py-[10px] rounded-[32px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
              <p className="font-medium text-[12px] leading-[normal] text-[rgba(25,54,63,0.7)] tracking-[-0.48px] whitespace-nowrap">
                Instant Swap Feature
              </p>
            </div>
            {/* Title */}
            <p className="font-medium text-[40px] max-md:text-[28px] leading-[normal] tracking-[-1.6px] max-md:tracking-[-1.12px] w-[346px] max-md:w-full">
              <span className="text-[rgba(25,54,63,0.6)]">
                Exchange Tokens{" "}
              </span>
              <span className="text-[#19363f]">in a Flash</span>
            </p>
            {/* Description */}
            <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] w-full">
              Enter the number of tokens you want to swap, select the target
              asset, and perform the swap in a few clicks.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-[30px] items-center w-full max-md:gap-[20px]">
            <div className="flex flex-col gap-[16px] items-start w-[142px]">
              <p className="font-medium text-[34px] leading-[normal] text-[#19363f] tracking-[-1.36px]">
                200x
              </p>
              <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px]">
                Super Fast Process
              </p>
            </div>
            <div className="flex flex-col gap-[16px] items-start w-[142px]">
              <p className="font-medium text-[34px] leading-[normal] text-[#19363f] tracking-[-1.36px]">
                100%
              </p>
              <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px]">
                Full Transparency
              </p>
            </div>
            <div className="flex flex-col gap-[16px] items-start w-[142px]">
              <p className="font-medium text-[34px] leading-[normal] text-[#19363f] tracking-[-1.36px]">
                +500
              </p>
              <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px]">
                Tokens Supported
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
