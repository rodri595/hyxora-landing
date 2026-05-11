"use client";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
import Error from "@/components/Error";
import Icon from "@/components/Icon";
import { useMemo } from "react";
import Spinner from "@/components/Spinner";
import Image from "@/components/Image";
import Button from "@/components/Button";
import NftCard from "@/components/NftCard";
const BulletPoint = () => {
  return (
    <div className="flex justify-start items-center gap-[10px] flex-1 ">
      {/* icon */}
      <div className="flex size-[34px] items-center justify-center aspect-square rounded-[8px] bg-[rgba(25, 54, 63, 0.04)] border-[0.7px] bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.06)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] ">
        <Icon name="verification" className="size-[14px]" fill={"white"} />
      </div>
      {/* text */}
      <div className="flex flex-col gap-[10px] items-start">
        <span className="text-[rgba(255,255,255,0.70)] font-inter text-[12px] font-normal leading-[16px] tracking-[-0.24px]">
          Date
        </span>
        <span className="text-white font-inter text-[16px] font-medium leading-[24px] tracking-[-0.32px]">
          27 February 2025
        </span>
      </div>
    </div>
  );
};
export default function NftsPage() {
  const {
    data: paymentsData,
    isPending: paymentsPending,
    error: paymentsError,
  } = GetMyPayments();

  const PurchaseNfts = useMemo(() => {
    if (!paymentsData || paymentsData?.length === 0) return false;
    return paymentsData?.filter(
      (payment) => payment?.status === "completed" && payment?.tokenId,
    );
  }, [paymentsData]);

  return (
    <section className="flex-1 flex gap-[16px] justify-start items-start p-4  h-full  min-h-0 ">
      <div className="flex flex-col flex-1 gap-[16px] ">
        <Error
          error={paymentsError}
          message={
            paymentsError?.response?.data?.message ||
            paymentsError?.message ||
            "Error al cargar datos del usuario"
          }
        />
        <h2 className="text-white leading-[24px] font-inter text-[18px] font-semibold tracking-[-0.72px] ">
          Mis NFTs
        </h2>
        {paymentsPending ? (
          <Spinner />
        ) : !!PurchaseNfts ? (
          <div className="grid grid-cols-3 gap-[56px_16px] items-center justify-center  max-md:grid-cols-2 max-sm:grid-cols-1 pb-[100px]">
            {PurchaseNfts.map((payment) => (
              <NftCard
                key={payment._id}
                payment={payment}
                onVatRefund={(id) => {
                  // TODO: open VAT refund dialog for id
                }}
              />
            ))}
          </div>
        ) : (
          <div className="relative max-w-[886px] mx-auto w-full flex ">
            {/* shadow 2 */}
            <div className="absolute w-[calc(100%-160px)] h-[calc(100%+32px)] top-[20px] left-[80px] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px]  " />
            {/* shadow 1 */}
            <div className="absolute w-[calc(100%-80px)] h-[calc(100%+16px)] top-[4px] left-[40px] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] " />
            {/* //CONTAINER */}
            <div className="flex p-[40px] items-center h-full gap-[20px] w-full flex-1 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-md:flex-col-reverse max-md:gap-[30px] max-md:p-[24px]">
              {/* LEFT */}
              <div className="flex flex-col items-start gap-[48px] w-[447px] max-md:w-full flex-1 h-full">
                <div className="flex flex-col w-[358px] max-md:w-full gap-[28px] items-start">
                  {/* Badge */}
                  <div className="bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.06)] flex items-center justify-center px-[14px] py-[10px] rounded-[32px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
                    <p className="font-medium text-[12px] text-[rgba(255,255,255,0.70)] tracking-[-0.48px] leading-[9px] ">
                      Lista de espera
                    </p>
                  </div>
                  {/* title */}
                  <h3 className="text-white! leading-[40px] tracking-[-1.28px] font-inter text-[32px] font-medium">
                    Tu primer paso en Hyxora
                  </h3>
                  <span className="text-white! font-inter text-[16px] font-normal leading-[24px] tracking-[-0.32px]">
                    Queremos que la comunidad sea el motor de este nacimiento.
                    Registra tu interés a través del QR para entrar en la lista
                    de espera y recibir una invitación vía email para estar
                    dentro.
                  </span>
                </div>

                <div className="flex flex-col gap-[20px] items-start self-stretch w-full">
                  <Button isSecondary>Comprar ahora</Button>
                  <div className="flex items-center gap-[30px] py-[16px] py-0 self-stretch">
                    <BulletPoint />
                    <BulletPoint />
                  </div>
                </div>
              </div>
              <Image
                // src={qrIMG}
                alt="apuntate"
                className="w-[243px] h-auto  rounded-[10px] max-md:w-full"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
