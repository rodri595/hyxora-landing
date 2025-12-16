const Roadmap = () => {
  return (
    <section className="flex flex-col gap-[70px] items-center w-full px-4">
      {/* Header Text Section */}
      <div className="flex flex-col gap-2 items-center justify-center w-full max-w-[700px]">
        {/* Main Heading */}
        <h2 className="font-medium text-[40px] leading-[38px] tracking-[-0.04em]  text-[#19363f] text-center w-full max-md:text-[20px] max-md:leading-normal max-md:tracking-[-0.8px] ">
          RoadMap
        </h2>
        {/* Description */}
        <p className="font-normal text-[16px] text-[rgba(25,54,63,0.7)] text-center tracking-[-0.32px] leading-6 w-full max-w-[575px]">
          En breve podrás disfrutar de todas las funcionalidades de Hyxora,
          estate atento a las noticias del lanzamiento
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-between ">
        {/* Left Side - Content */}
        <div className="flex flex-col gap-12 w-[300px] ">
          {/* Header */}
          <div className="flex flex-col gap-7">
            <h2 className="font-medium text-4xl lg:text-[40px] leading-tight tracking-[-0.04em] text-[#19363f]">
              <span className="text-[rgba(25,54,63,0.6)]">Hyxora</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-11 relative">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-[30px] bottom-[30px] w-px bg-gradient-to-b from-transparent via-[rgba(25,54,63,0.15)] to-transparent hidden md:block" />
            {/* Step 01 */}
            <div className="flex gap-[18px] items-start">
              <div className="relative flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#19363f] border border-[rgba(255,255,255,0.2)] shadow-[0px_6px_4px_-4px_rgba(25,54,63,0.15),0px_12px_8px_-4px_rgba(25,54,63,0.15)] shrink-0">
                <span className="text-white text-xs font-medium tracking-[-0.04em] text-center">
                  1
                </span>
                <div className="absolute inset-0 rounded-full shadow-[inset_0px_0px_10px_0px_rgba(255,255,255,0.4)] pointer-events-none" />
              </div>
              <div className="flex flex-col gap-3.5 flex-1">
                <h3 className="text-base font-bold tracking-[-0.04em] text-[#19363f]">
                  2026
                </h3>
                <p className="text-base leading-6 tracking-[-0.02em] text-[rgba(25,54,63,0.7)]">
                  Lanzamiento 1º trimestre
                </p>
              </div>
            </div>
            {/* Step 02 */}
            <div className="flex gap-[18px] items-start">
              <div className="relative flex items-center justify-center w-[30px] h-[30px] rounded-2xl bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] shrink-0">
                <span className="text-[#19363f] text-xs font-medium tracking-[-0.04em] text-center">
                  02
                </span>
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] pointer-events-none" />
              </div>
              <div className="flex flex-col gap-3.5 flex-1">
                <h3 className="text-base font-bold tracking-[-0.04em] text-[#19363f]">
                  2027
                </h3>
                <p className="text-base leading-6 tracking-[-0.02em] text-[rgba(25,54,63,0.7)]">
                  Modelo Pymes
                  <br />
                  Nuevas funcionalidades DeFi
                  <br />
                  Internacionalización - Latam
                </p>
              </div>
            </div>
            {/* Step 03 */}
            <div className="flex gap-[18px] items-start">
              <div className="relative flex items-center justify-center w-[30px] h-[30px] rounded-2xl bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] shrink-0">
                <span className="text-[#19363f] text-xs font-medium tracking-[-0.04em] text-center">
                  03
                </span>
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] pointer-events-none" />
              </div>
              <div className="flex flex-col gap-3.5 flex-1">
                <h3 className="text-base font-bold tracking-[-0.04em] text-[#19363f]">
                  2028
                </h3>
                <p className="text-base leading-6 tracking-[-0.02em] text-[rgba(25,54,63,0.7)]">
                  Crecimiento
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Right Side - Content */}
        <div className="flex flex-col gap-12 w-[300px] ">
          {/* Header */}
          <div className="flex flex-col gap-7">
            <h2 className="font-medium text-4xl lg:text-[40px] leading-tight tracking-[-0.04em] text-[#19363f]">
              <span className="text-[rgba(25,54,63,0.6)]">
                <span className="text-sm">NFT</span> Founders
              </span>
            </h2>
          </div>
          {/* Steps */}
          <div className="flex flex-col gap-11 relative">
            {/* Vertical Line */}

            <div className="absolute left-[15px] top-[30px] bottom-[30px] w-px bg-gradient-to-b from-transparent via-[rgba(25,54,63,0.15)] to-transparent hidden md:block" />
            {/* Step 01 */}
            <div className="flex gap-[18px] items-start">
              <div className="relative flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#19363f] border border-[rgba(255,255,255,0.2)] shadow-[0px_6px_4px_-4px_rgba(25,54,63,0.15),0px_12px_8px_-4px_rgba(25,54,63,0.15)] shrink-0">
                <span className="text-white text-xs font-medium tracking-[-0.04em] text-center">
                  01
                </span>
                <div className="absolute inset-0 rounded-full shadow-[inset_0px_0px_10px_0px_rgba(255,255,255,0.4)] pointer-events-none" />
              </div>
              <div className="flex flex-col gap-3.5 flex-1">
                <h3 className="text-base font-bold tracking-[-0.04em] text-[#19363f]">
                  2026
                </h3>
                <p className="text-base leading-6 tracking-[-0.02em] text-[rgba(25,54,63,0.7)]">
                  Lanzamiento 350 und
                </p>
              </div>
            </div>
            {/* Step 02 */}
            <div className="flex gap-[18px] items-start">
              <div className="relative flex items-center justify-center w-[30px] h-[30px] rounded-2xl bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] shrink-0">
                <span className="text-[#19363f] text-xs font-medium tracking-[-0.04em] text-center">
                  02
                </span>
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] pointer-events-none" />
              </div>
              <div className="flex flex-col gap-3.5 flex-1">
                <p className="text-base leading-6 tracking-[-0.02em] text-[rgba(25,54,63,0.7)]">
                  Lanzamiento 50 und
                </p>
                <h3 className="text-base font-bold tracking-[-0.04em] text-[#19363f]">
                  2027
                </h3>
                <p className="text-base leading-6 tracking-[-0.02em] text-[rgba(25,54,63,0.7)]">
                  Lanzamiento 600 und
                </p>
              </div>
            </div>
            {/* Step 03 */}
            <div className="flex gap-[18px] items-start mt-[10px]">
              <div className="relative flex items-center justify-center w-[30px] h-[30px] rounded-2xl bg-[#f6f7f8] border-[0.7px] border-[rgba(25,54,63,0.04)] shrink-0">
                <span className="text-[#19363f] text-xs font-medium tracking-[-0.04em] text-center">
                  03
                </span>
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] pointer-events-none" />
              </div>
              <div className="flex flex-col gap-3.5 flex-1">
                <h3 className="text-base font-bold tracking-[-0.04em] text-[#19363f]">
                  2028
                </h3>
                <p className="text-base leading-6 tracking-[-0.02em] text-[rgba(25,54,63,0.7)]">
                  Marketplace NFT abierto
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
