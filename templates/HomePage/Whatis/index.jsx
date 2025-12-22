import FeatureCard from "@/components/FeatureCard";

const Whatis = () => {
  return (
    <section className="flex w-full" id="porque">
      <div className="flex flex-col gap-[44px] max-md:gap-[34px] items-start  max-w-[1240px] w-full mx-auto max-md:max-none  max-xl:px-[32px] max-md:px-[16px]">
        {/* Text Header */}
        <div className="flex items-end justify-between w-full max-md:flex-col max-md:items-start max-md:gap-[24px]">
          <h2 className="font-medium text-[40px] max-md:text-[20px] text-[#19363f] tracking-[-1.6px] max-md:tracking-[-0.8px] leading-[normal] max-w-[477px] max-md:max-w-[244px]">
            <span className="text-[rgba(25,54,63,0.6)]">¿Por qué Hyxora?</span>
          </h2>
          <p className="font-normal text-[16px] max-md:text-[12px] leading-[24px] max-md:leading-[20px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] max-md:tracking-[-0.24px] max-w-[353px] max-md:max-w-full italic max-md:not-italic">
            El nuevo mundo financiero en tus manos
          </p>
        </div>
        {/* Content Grid */}
        <div className="flex flex-col gap-[20px] max-md:gap-[10px] w-full">
          <div className="flex gap-[20px] max-md:flex-col max-md:gap-[10px]  w-full">
            <FeatureCard
              videoSrc="/videos/cards_line.mp4"
              title="Multiproducto Financiero"
              description="Dispóndras de información de todos tus activos y funcionalidades dentro de la app en tiempo real"
              className="max-w-[529px] grow max-lg:w-full"
              data-cursor-text="Multiproducto Financiero"
            />
            <FeatureCard
              videoSrc="/videos/cards_showcase.mp4"
              title="Seguridad y Autocustodia"
              description="Tu controlas tu dinero y tus acciones. Sin intermediarios pero con la tranquilidad de sistemas de recuperación de claves encriptados."
              className="max-w-[691px] pb-[30px] max-md:pb-[20px] max-lg:w-full"
              data-cursor-text="Seguridad y Autocustodia"
            />
          </div>
          <div className="flex gap-[20px] max-md:flex-col max-md:gap-[10px]  w-full">
            <FeatureCard
              videoSrc="/videos/cards_stack.mp4"
              title="Oportunidades DeFi"
              description="Las oportunidades del nuevo mundo descentralizado (DeFi) en tus manos. Intercambios, fondos indexados, ingresos pasivos, y muchas más."
              className="max-w-[691px] pb-[30px] max-md:pb-[20px] max-lg:w-full"
              data-cursor-text="Oportunidades DeFi"
            />
            <FeatureCard
              videoSrc="/videos/cards_rotate_shine.mp4"
              title="El centro del negocio eres tú"
              description="Academia, Comité Consultivo, Founder solution"
              className="max-w-[529px] grow max-lg:w-full"
              data-cursor-text="El centro del negocio eres tú"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Whatis;
