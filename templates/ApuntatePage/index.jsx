"use client";

import Layout from "@/components/Layout";
import Image from "@/components/Image";
import Button from "@/components/Button";
import qrIMG from "./qrcode.svg";

// const BulletPoint = () => {
//   return (
//     <div className="flex justify-start items-center gap-[10px] flex-1 ">
//       {/* icon */}
//       <div className="flex size-[34px] items-center justify-center aspect-square rounded-[8px] bg-[rgba(25, 54, 63, 0.04)] border-[0.7px] border-[rgba(25,54,63,0.02)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
//         <Icon name="verification" className="size-[14px]" />
//       </div>
//       {/* text */}
//       <div className="flex flex-col gap-[10px] items-start">
//         <span className="text-[rgba(25, 54, 63, 0.70)] font-inter text-[12px] font-normal leading-[16px] tracking-[-0.24px]">
//           Date
//         </span>
//         <span className="text-[#19363F] font-inter text-[16px] font-medium leading-[24px] tracking-[-0.32px]">
//           27 February 2025
//         </span>
//       </div>
//     </div>
//   );
// };

const ApuntatePage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col gap-[130px] maxmd:gap-[80px] pt-[100px]"
    >
      <section className="w-full flex justify-center px-4 max-md:mb-[100px]">
        <div
          className={`flex flex-col gap-[50px] items-center w-full max-w-[886px] `}
        >
          {/* TITLE */}
          <div className="flex flex-col text-center justify-center items-center gap-[28px]">
            <h2 className="font-inter font-medium text-[40px] leading-[40px] tracking-[-1.6px] text-center max-w-[447px]">
              <span className="text-[rgba(25,54,63,0.6)]">
                Bienvenidos al mañana de{" "}
              </span>
              <span className="text-[#19363f]">Hyxora</span>
            </h2>
            <span className="max-w-[481px] text-[rgba(25,54,63,0.7)] font-inter text-[16px] font-normal leading-[24px] tracking-[-0.32px]">
              Sé parte del nacimiento de Hyxora y descubre todas las opciones de
              la plataforma
            </span>
          </div>
          {/* CONTENT */}
          <div className="relative ">
            {/* shadow 2 */}
            <div className="absolute w-[calc(100%-160px)] h-[calc(100%+32px)] top-[20px] left-[80px] rounded-[16px] border border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px]  " />
            {/* shadow 1 */}
            <div className="absolute w-[calc(100%-80px)] h-[calc(100%+16px)] top-[4px] left-[40px] rounded-[16px] border border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] " />
            {/* //CONTAINER */}
            <div className="flex p-[40px] items-center h-full gap-[20px] w-full max-w-[886px] flex-1 rounded-[16px] border border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.02)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-md:flex-col-reverse max-md:gap-[30px] ">
              {/* LEFT */}
              <div className="flex flex-col items-start gap-[48px] w-[447px] flex-1 h-full">
                <div className="flex flex-col w-[358px] gap-[28px] items-start">
                  {/* Badge */}
                  <div className="bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] flex items-center justify-center px-[14px] py-[10px] rounded-[32px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
                    <p className="font-medium text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.48px] leading-[9px] ">
                      Lista de espera
                    </p>
                  </div>
                  {/* title */}
                  <h3 className="text-[#19363F] leading-[40px] tracking-[-1.28px] font-inter text-[32px] font-medium">
                    Tu primer paso en Hyxora
                  </h3>
                  <span className="text-[rgba(25,54,63,0.7)] font-inter text-[16px] font-normal leading-[24px] tracking-[-0.32px]">
                    Queremos que la comunidad sea el motor de este nacimiento.
                    Registra tu interés a través del QR para entrar en la lista
                    de espera y recibir una invitación vía email para estar
                    dentro.
                  </span>
                </div>

                <div className="flex flex-col gap-[20px] items-start self-stretch w-full">
                  <Button
                    isPrimary
                    onClick={() =>
                      window.open(
                        "https://innovacion.nwc10.com/first-date-hyxora/",
                        "_blank",
                      )
                    }
                  >
                    Regístrate ahora
                  </Button>
                  {/* <div className="flex items-center gap-[30px] py-[16px] py-0 self-stretch">
                    <BulletPoint />
                    <BulletPoint />
                  </div> */}
                </div>
              </div>
              {/* RIGHT */}
              <Image
                src={qrIMG}
                alt="apuntate"
                className="w-[243px] h-auto  rounded-[10px] max-md:w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ApuntatePage;
