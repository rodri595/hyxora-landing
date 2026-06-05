"use client";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
import ErrorComp from "@/components/Error";
//
import DataContent from "./DataContent";
import ShareContent from "./ShareContent";
import NewsContent from "./NewsContent";
const ProfilePage = () => {
  const { error: paymentsError } = GetMyPayments();
  return (
    <section
      className="flex-1 flex gap-4 justify-start items-start p-4 h-full min-h-0 overflow-y-auto max-w-360 mx-auto"
      data-lenis-prevent
    >
      <div className="flex flex-col flex-1 gap-[16px] ">
        <ErrorComp
          error={paymentsError}
          message={
            paymentsError?.response?.data?.message ||
            paymentsError?.message ||
            "Error al cargar datos del usuario"
          }
        />
        <h2 className="text-[#19363F] leading-[24px] font-inter text-[18px] font-semibold tracking-[-0.72px] ">
          Perfil
        </h2>
        <DataContent />
        <ShareContent />
        <NewsContent />
      </div>
    </section>
  );
};

export default ProfilePage;
