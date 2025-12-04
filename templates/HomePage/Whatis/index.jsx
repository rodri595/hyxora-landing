import Video from "@/components/Video";

const Whatis = () => {
  return (
    <section className="flex  w-full ">
      <div className="flex flex-col gap-[44px] items-start  max-w-[1240px] w-full mx-auto">
        {/* Text Header */}
        <div className="flex items-end justify-between w-full">
          <h2 className="font-medium text-[40px] text-[#19363f] tracking-[-1.6px] leading-[normal] w-[477px]">
            <span className="text-[rgba(25,54,63,0.6)]">What Does Digital</span>{" "}
            Ownership Mean in Web3?
          </h2>
          <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] w-[353px]">
            Powered by blockchain, every crypto asset and smart contract is
            secure, decentralized.
          </p>
        </div>
        {/* Content Grid */}
        <div className="flex flex-col gap-[20px] w-full">
          <div className="flex gap-[20px]  w-full">
            <div
              className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex flex-col gap-[16px] items-center overflow-hidden   rounded-[16px] w-[529px]"
              style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
            >
              <div className="h-[212px] relative w-full">
                <Video
                  src="/videos/cards_line.mp4"
                  className="h-[212px] w-full"
                  autobuffer="true"
                  playsInline
                  autoPlay
                  muted
                  loop
                />
              </div>
              <div className="flex flex-col gap-[20px] items-start px-[30px] w-full">
                <h3 className="font-medium text-[24px] text-[#19363f] tracking-[-0.96px] leading-[normal] w-full">
                  Own Your Identity
                </h3>
                <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] w-full">
                  With decentralized identities, you control how and where your
                  personal information is used—no more data harvesting.
                </p>
              </div>
            </div>
            <div
              className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex flex-col gap-[16px] items-start overflow-hidden pb-[30px] pt-0 px-0 relative rounded-[16px] w-[691px]"
              style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
            >
              <div className="h-[212px] relative w-full">
                <Video
                  src="/videos/cards_showcase.mp4"
                  className="h-[212px] w-full"
                  autobuffer="true"
                  playsInline
                  autoPlay
                  muted
                  loop
                />
              </div>
              <div className="flex flex-col gap-[20px] items-start px-[30px] py-0 w-full">
                <h3 className="font-medium text-[24px] text-[#19363f] tracking-[-0.96px] leading-[normal] w-full">
                  Own Rare Digital Assets
                </h3>
                <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] w-full">
                  From Bitcoin to altcoins, stablecoins to tokens—crypto makes
                  financial ownership borderless and decentralized.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-[20px]  w-full">
            <div
              className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex flex-col gap-[16px] items-start overflow-hidden pb-[30px] pt-0 px-0 relative rounded-[16px] w-[691px]"
              style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
            >
              <div className="h-[212px] relative w-full">
                <Video
                  src="/videos/cards_stack.mp4"
                  className="h-[212px] w-full"
                  autobuffer="true"
                  playsInline
                  autoPlay
                  muted
                  loop
                />
              </div>
              <div className="flex flex-col gap-[20px] items-start px-[30px] py-0 w-full">
                <h3 className="font-medium text-[24px] text-[#19363f] tracking-[-0.96px] leading-[normal] w-full">
                  Own Rare Digital Assets
                </h3>
                <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] w-full">
                  From Bitcoin to altcoins, stablecoins to tokens—crypto makes
                  financial ownership borderless and decentralized.
                </p>
              </div>
            </div>
            <div
              className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex flex-col gap-[16px] items-center overflow-hidden   rounded-[16px] w-[529px]"
              style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
            >
              <div className="h-[212px] relative w-full">
                <Video
                  src="/videos/cards_rotate_shine.mp4"
                  className="h-[212px] w-full"
                  autobuffer="true"
                  playsInline
                  autoPlay
                  muted
                  loop
                />
              </div>
              <div className="flex flex-col gap-[20px] items-start px-[30px] w-full">
                <h3 className="font-medium text-[24px] text-[#19363f] tracking-[-0.96px] leading-[normal] w-full">
                  Own Your Identity
                </h3>
                <p className="font-normal text-[16px] leading-[24px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] w-full">
                  With decentralized identities, you control how and where your
                  personal information is used—no more data harvesting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Whatis;
