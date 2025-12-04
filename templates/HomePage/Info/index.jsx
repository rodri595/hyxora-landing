const Info = () => {
  return (
    <section className="flex w-full ">
      <div className="flex gap-[102px] justify-center max-w-[1240px] mx-auto w-full px-6 ">
        {/* Left Content Section */}
        <div className="flex flex-col gap-[50px] items-start w-[495px] shrink-0">
          {/* Header */}
          <div className="flex flex-col gap-7 items-start w-full">
            <h2 className="font-medium text-[40px] leading-[40px] tracking-[-0.04em] w-full ">
              <span className="text-[rgba(25,54,63,0.6)]">
                The Simple Steps to{" "}
              </span>
              <span className="text-[#19363f]">Owning Digital Assets</span>
            </h2>
            <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full ">
              Digital ownership is powered by blockchain technology, a secure,
              transparent, and decentralized system.
            </p>
          </div>
          {/* Steps Container */}
          <div className="flex flex-col gap-11 items-start w-full relative">
            {/* Step 01 */}
            <div className="flex gap-[18px] items-start w-full">
              <div
                className="bg-[#19363f] border border-[rgba(255,255,255,0.2)] flex items-center justify-center px-[14px] py-2 rounded-full w-[30px] h-[30px] shrink-0 relative overflow-hidden"
                style={{
                  boxShadow:
                    "0px 6px 4px -4px rgba(25,54,63,0.15), 0px 12px 8px -4px rgba(25,54,63,0.15)",
                }}
              >
                <p className="font-medium text-xs text-white tracking-[-0.04em] ">
                  01
                </p>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-[14px] items-start w-[447px] shrink-0">
                <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                  Connect Your Wallet
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                  Easily link your crypto wallet to access your assets and
                  identity—securely and instantly.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex gap-[18px] items-start w-full">
              <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-xs text-[#19363f] tracking-[-0.04em]  whitespace-nowrap">
                  02
                </p>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-[14px] items-start w-[447px] shrink-0">
                <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                  Mint or Purchase Digital Items
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                  From art and music to access passes and digital cards—every
                  item is verifiably yours on the blockchain.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex gap-[18px] items-start w-full">
              <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-xs text-[#19363f] tracking-[-0.04em]  whitespace-nowrap">
                  03
                </p>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-[14px] items-start w-[447px] shrink-0">
                <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                  Trade, Sell, or Hold
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                  You can transfer ownership, sell your items on marketplaces,
                  or keep them as digital collectibles.
                </p>
              </div>
            </div>
            <div className="flex gap-[18px] items-start w-full">
              <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-xs text-[#19363f] tracking-[-0.04em]  whitespace-nowrap">
                  04
                </p>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-[14px] items-start w-[447px] shrink-0">
                <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                  Trade, Sell, or Hold
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                  You can transfer ownership, sell your items on marketplaces,
                  or keep them as digital collectibles.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* right Content Section */}
        <div className="flex flex-col gap-[50px] items-start w-[495px] shrink-0">
          {/* Header */}
          <div className="flex flex-col gap-7 items-start w-full">
            <h2 className="font-medium text-[40px] leading-[40px] tracking-[-0.04em] w-full ">
              <span className="text-[rgba(25,54,63,0.6)]">
                The Simple Steps to{" "}
              </span>
              <span className="text-[#19363f]">Owning Digital Assets</span>
            </h2>
            <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full ">
              Digital ownership is powered by blockchain technology, a secure,
              transparent, and decentralized system.
            </p>
          </div>
          {/* Steps Container */}
          <div className="flex flex-col gap-11 items-start w-full relative">
            {/* Step 01 */}
            <div className="flex gap-[18px] items-start w-full">
              <div
                className="bg-[#19363f] border border-[rgba(255,255,255,0.2)] flex items-center justify-center px-[14px] py-2 rounded-full w-[30px] h-[30px] shrink-0 relative overflow-hidden"
                style={{
                  boxShadow:
                    "0px 6px 4px -4px rgba(25,54,63,0.15), 0px 12px 8px -4px rgba(25,54,63,0.15)",
                }}
              >
                <p className="font-medium text-xs text-white tracking-[-0.04em] ">
                  01
                </p>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-[14px] items-start w-[447px] shrink-0">
                <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                  Connect Your Wallet
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                  Easily link your crypto wallet to access your assets and
                  identity—securely and instantly.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex gap-[18px] items-start w-full">
              <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-xs text-[#19363f] tracking-[-0.04em]  whitespace-nowrap">
                  02
                </p>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-[14px] items-start w-[447px] shrink-0">
                <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                  Mint or Purchase Digital Items
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                  From art and music to access passes and digital cards—every
                  item is verifiably yours on the blockchain.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex gap-[18px] items-start w-full">
              <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-xs text-[#19363f] tracking-[-0.04em]  whitespace-nowrap">
                  03
                </p>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-[14px] items-start w-[447px] shrink-0">
                <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                  Trade, Sell, or Hold
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                  You can transfer ownership, sell your items on marketplaces,
                  or keep them as digital collectibles.
                </p>
              </div>
            </div>
            <div className="flex gap-[18px] items-start w-full">
              <div className="bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] rounded-2xl w-[30px] h-[30px] shrink-0 relative overflow-hidden">
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium text-xs text-[#19363f] tracking-[-0.04em]  whitespace-nowrap">
                  04
                </p>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-[14px] items-start w-[447px] shrink-0">
                <p className="font-medium text-base leading-6 text-[#19363f] tracking-[-0.04em] w-full">
                  Trade, Sell, or Hold
                </p>
                <p className="font-normal text-base leading-6 text-[rgba(25,54,63,0.7)] tracking-[-0.02em] w-full">
                  You can transfer ownership, sell your items on marketplaces,
                  or keep them as digital collectibles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Info;
