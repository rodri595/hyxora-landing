import Image from "@/components/Image";
import financeIMG from "@/assets/imgs/misc/02 - IPHONE.png";
// import financeIMG from "@/assets/imgs/misc/02 - IPHONE.png";
import FinanceGridItem from "./FinanceGridItem";

const Finance = () => {
  return (
    <div className="flex flex-col gap-[70px] items-center w-full px-4">
      {/* Header Text Section */}
      <div className="flex flex-col gap-2 items-center justify-center w-full max-w-[700px]">
        {/* Badge */}
        <div
          className="backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex items-center justify-center px-[14px] py-[10px] rounded-[32px]"
          style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
        >
          <p className="font-medium text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px] whitespace-nowrap">
            Buy Crypto Instantly
          </p>
        </div>

        {/* Main Heading */}
        <h2 className="font-medium text-[40px] leading-[38px] tracking-[-0.04em]  text-[#19363f] text-center w-full max-md:text-[20px] max-md:leading-normal max-md:tracking-[-0.8px] ">
          Finanzas descentralizadas DeFi
        </h2>

        {/* Description */}
        <p className="font-normal text-[16px] text-[rgba(25,54,63,0.7)] text-center tracking-[-0.32px] leading-6 w-full max-w-[475px]">
          Las oportunidades del nuevo mundo financiero en tus manos
        </p>
      </div>

      {/* Content Section */}
      <div className="flex gap-4 items-stretch w-full max-w-[1220px] max-lg:flex-col max-lg:items-center">
        {/* Left Column */}
        <div
          className="flex-1 flex items-center justify-center bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] rounded-2xl border-solid overflow-hidden p-2 max-lg:w-full"
          style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
        >
          <Image
            className=" w-auto h-full max-h-[700px] max-lg:max-h-[400px] object-contain "
            src={financeIMG}
            alt="Finance Image"
          />
        </div>

        {/* Right Column - Payment Options */}
        <div
          className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex flex-col gap-10 overflow-hidden p-[30px] rounded-2xl w-[691px] max-lg:w-full max-lg:p-1"
          style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
        >
          {/*  Grid */}
          <div className="flex flex-col gap-[14px]  max-lg:gap-1">
            <FinanceGridItem
              title="Staking"
              description="Haz que tu dinero trabaje por ti. Consigue rendimientos e ingresos pasivos sólo por el hecho de mantener tu capital en Hyxora"
            />
            <FinanceGridItem
              title="Swaps"
              description="Realiza cambios entre Fiat y Criptp en un solo click. Maximiza la rentabilidad de tu dinero"
            />
            <FinanceGridItem
              title="Remesas internacionales"
              description="Envía dinero a otros usuarios en cualquier parte del mundo en segundos y sin coste"
            />
            <FinanceGridItem
              title="Fondos Indexados mixtos"
              description="Invierte en fondos indexados con las mayores rentabilidades que ambos mundos financieros pueden ofrecerte en conjunto. Sé conservador desde la parte tradicional y busca las mayores oportunidades en DEfi, pero desde el mismo fondo."
            />
            <FinanceGridItem
              title="Proximamente"
              description="Pools de liquidez, Lending, etc. etc…."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
