import Button from "@/components/Button";
import Image from "@/components/Image";
import shieldCheckSVG from "@/assets/imgs/icons/shield-check.svg";
import eyeSVG from "@/assets/imgs/icons/eye.svg";
import sparklesSVG from "@/assets/imgs/icons/sparkles.svg";

const Why = () => {
  return (
    <section className="flex w-full  ">
      <div
        className="flex flex-col gap-[10px] items-center pb-[70px] pt-[90px] px-[57px] relative rounded-2xl w-full overflow-hidden max-w-[1440px] mx-auto"
        style={{
          borderRadius: "16px",
          background:
            "radial-gradient(118.36% 105.73% at 50% 105.73%, #497BEF 0%, #1144BA 24.49%, #091A1F 100%)",
        }}
      >
        {/* Content */}
        <div className="flex flex-col gap-[50px] items-center relative w-full max-w-[1240px] z-10">
          {/* Title */}
          <h2 className="font-medium text-[40px] leading-normal tracking-[-0.04em] text-center text-white w-[440px]">
            <span className="text-[rgba(255,255,255,0.6)]">Why Digital </span>
            <span>Ownership Truly Matters</span>
          </h2>

          {/* Cards Container */}
          <div className="flex gap-5 items-center w-full">
            {/* Card 1 - True Ownership */}
            <div
              className="backdrop-blur-[25px] bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.02)] flex flex-col gap-6 flex-1 pb-[30px] pt-5 px-[26px] rounded-2xl relative overflow-hidden"
              style={{
                boxShadow:
                  "0px 6px 4px -4px rgba(0,0,0,0.05), 0px 12px 8px -4px rgba(0,0,0,0.05), 0px 0px 4px 0px inset rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="bg-[rgba(255,255,255,0.3)] border-[0.6px] border-[rgba(25,54,63,0.02)] flex items-center justify-center p-[14px] rounded-[14px] w-12 h-12 shrink-0 relative"
                style={{
                  boxShadow: "0px 0px 6px 0px inset rgba(255,255,255,0.2)",
                }}
              >
                <Image
                  src={shieldCheckSVG}
                  alt="Shield Check Icon"
                  className="w-5 h-5"
                />
              </div>
              <div className="flex flex-col gap-5 items-start w-full">
                <p className="font-medium text-[20px] leading-normal text-white tracking-[-0.04em] whitespace-nowrap">
                  True Ownership
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(255,255,255,0.7)] tracking-[-0.02em] w-full">
                  You don&apos;t rent digital goods—you own them. No platform
                  can take them away.
                </p>
              </div>
            </div>

            {/* Card 2 - Transparency */}
            <div
              className="backdrop-blur-[25px] bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.02)] flex flex-col gap-6 flex-1 pb-[30px] pt-5 px-[26px] rounded-2xl relative overflow-hidden"
              style={{
                boxShadow:
                  "0px 6px 4px -4px rgba(0,0,0,0.05), 0px 12px 8px -4px rgba(0,0,0,0.05), 0px 0px 4px 0px inset rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="bg-[rgba(255,255,255,0.3)] border-[0.6px] border-[rgba(25,54,63,0.02)] flex items-center justify-center p-[14px] rounded-[14px] w-12 h-12 shrink-0 relative"
                style={{
                  boxShadow: "0px 0px 6px 0px inset rgba(255,255,255,0.2)",
                }}
              >
                <Image src={eyeSVG} alt="Eye Icon" className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-5 items-start w-full">
                <p className="font-medium text-[20px] leading-normal text-white tracking-[-0.04em] w-full">
                  Transparency
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(255,255,255,0.7)] tracking-[-0.02em] w-full">
                  Every action is recorded and publicly verifiable. No hidden
                  edits or centralized control.
                </p>
              </div>
            </div>

            {/* Card 3 - Creator Empowerment */}
            <div
              className="backdrop-blur-[25px] bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.02)] flex flex-col gap-6 flex-1 pb-[30px] pt-5 px-[26px] rounded-2xl relative overflow-hidden"
              style={{
                boxShadow:
                  "0px 6px 4px -4px rgba(0,0,0,0.05), 0px 12px 8px -4px rgba(0,0,0,0.05), 0px 0px 4px 0px inset rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="bg-[rgba(255,255,255,0.3)] border-[0.6px] border-[rgba(255,255,255,0.1)] flex items-center justify-center p-[14px] rounded-[14px] w-12 h-12 shrink-0 relative"
                style={{
                  boxShadow:
                    "0px 6px 8px -4px rgba(0,0,0,0.08), 0px 6px 4px -4px rgba(0,0,0,0.04), 0px 0px 6px 0px inset rgba(255,255,255,0.2)",
                }}
              >
                <Image
                  src={sparklesSVG}
                  alt="Sparkles Icon"
                  className="w-5 h-5"
                />
              </div>
              <div className="flex flex-col gap-5 items-start w-full">
                <p className="font-medium text-[20px] leading-normal text-white tracking-[-0.04em] w-full">
                  Creator Empowerment
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(255,255,255,0.7)] tracking-[-0.02em] w-full">
                  Artists, developers, and creators can earn royalties
                  forever—automatically.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col gap-[30px] items-center w-[477px]">
            <div className="flex gap-[10px] items-center">
              <Button isSecondary>Connect Wallet</Button>
              <Button isStroke>Explore Marketplace</Button>
            </div>
            <p className="font-medium text-base leading-6 text-center text-white tracking-[-0.04em] w-full">
              Web3 puts the power back in the hands of users. No gatekeepers, no
              boundaries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Why;
