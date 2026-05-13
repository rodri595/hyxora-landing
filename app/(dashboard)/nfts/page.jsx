"use client";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
import Error from "@/components/Error";
import Icon from "@/components/Icon";
import { useMemo } from "react";
import Spinner from "@/components/Spinner";
import Button from "@/components/Button";
import NftCard from "@/components/NftCard";
import VatReturnModal from "@/components/VatReturnModal";
import { useState } from "react";
import { LAUNCH_DATE } from "@/constants/dates";
const BulletPoint = ({ label = "Date", value = "27 February 2025" }) => {
  return (
    <div className="flex justify-start items-center gap-[10px] flex-1 min-w-[160px]">
      {/* icon */}
      <div className="flex size-[34px] items-center justify-center aspect-square rounded-[8px] bg-[rgba(25, 54, 63, 0.04)] border-[0.7px] bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.06)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] shrink-0">
        <Icon name="verification" className="size-[14px]" fill={"white"} />
      </div>
      {/* text */}
      <div className="flex flex-col gap-[4px] items-start">
        <span className="text-[rgba(255,255,255,0.70)] font-inter text-[12px] font-normal leading-[16px] tracking-[-0.24px]">
          {label}
        </span>
        <span className="text-white font-inter text-[14px] font-medium leading-[20px] tracking-[-0.32px]">
          {value}
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
    const filteredPayments = paymentsData?.filter(
      (payment) => payment?.status === "completed" && payment?.tokenId,
    );
    return filteredPayments.length > 0 ? filteredPayments : false;
  }, [paymentsData]);
  const [isOpen, setIsOpen] = useState(false);
  const [tokenId, setTokenId] = useState(null);

  return (
    <section
      className="flex-1 flex gap-[16px] justify-start items-start p-4 h-full min-h-0 overflow-y-auto"
      data-lenis-prevent
    >
      <div className="flex flex-col flex-1 gap-[16px] ">
        {" "}
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
          <div
            id="nft-grid"
            className="grid grid-cols-3 gap-[56px_16px] items-center justify-center  max-md:grid-cols-2 max-sm:grid-cols-1 pb-[100px] flex-1 "
          >
            {PurchaseNfts.map((payment) => (
              <NftCard
                key={payment._id}
                payment={payment}
                onVatRefund={(id) => {
                  setIsOpen(true);
                  setTokenId(id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="relative max-w-[886px] mx-auto w-full flex">
            {/* shadow 2 */}
            <div className="absolute w-[calc(100%-160px)] h-[calc(100%+32px)] top-[20px] left-[80px] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-sm:hidden" />
            {/* shadow 1 */}
            <div className="absolute w-[calc(100%-80px)] h-[calc(100%+16px)] top-[4px] left-[40px] rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-sm:hidden" />
            {/* CONTAINER */}
            <div className="flex p-[40px] items-center h-full gap-[20px] w-full flex-1 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(30,30,30,0.80)] shadow-[inset_0_0_4px_0_rgba(25,54,63,0.04)] backdrop-blur-[8px] max-md:flex-col max-md:gap-[30px] max-md:p-[24px]">
              {/* LEFT */}
              <div className="flex flex-col items-start gap-[32px] w-[447px] max-md:w-full flex-1 h-full">
                <div className="flex flex-col w-full gap-[20px] items-start">
                  {/* Badge */}
                  <div className="bg-[rgba(255,255,255,0.06)] border-[0.7px] border-[rgba(255,255,255,0.06)] flex items-center justify-center px-[14px] py-[10px] rounded-[32px] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)]">
                    <p className="font-medium text-[12px] text-[rgba(255,255,255,0.70)] tracking-[-0.48px] leading-[9px]">
                      Sin NFTs
                    </p>
                  </div>
                  {/* title */}
                  <h3 className="text-white! leading-[36px] tracking-[-1.28px] font-inter text-[28px] max-sm:text-[22px] max-sm:leading-[28px] font-medium">
                    Aún no tienes ningún NFT
                  </h3>
                  <span className="text-[rgba(255,255,255,0.70)] font-inter text-[15px] max-sm:text-[14px] font-normal leading-[24px] tracking-[-0.32px]">
                    Todavía no has adquirido ningún NFT de Hyxora. Podrás
                    comprarlos a partir del{" "}
                    <span className="text-white font-medium">
                      {LAUNCH_DATE.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      a las{" "}
                      {LAUNCH_DATE.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    .
                  </span>
                </div>

                <div className="flex flex-col gap-[16px] items-start self-stretch w-full">
                  <Button isSecondary>Comprar ahora</Button>
                  <div className="flex flex-wrap items-center gap-[16px] self-stretch max-sm:flex-col max-sm:items-start">
                    <BulletPoint
                      label="Disponible"
                      value={LAUNCH_DATE.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    />
                    {/* <BulletPoint label="Colección" value="Hyxora" /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <VatReturnModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        tokenId={tokenId}
      />
    </section>
  );
}
