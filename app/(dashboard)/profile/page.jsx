"use client";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
import { useMemo } from "react";
//
import Card from "./Card";
const ProfilePage = () => {
  const {
    data: payments,
    // isLoading: isLoadingPayments,
    // error: paymentsError,
  } = GetMyPayments();
  // console.log(payments);
  const HasNfts = useMemo(() => {
    if (!payments || payments.length === 0) return false;
    return payments.some((payment) => payment?.nft);
  }, [payments]);

  return (
    <section className="flex-1 flex gap-[16px] justify-start items-start p-4">
      <div className="flex flex-col flex-1">
        <h2 className="text-[#19363F] leading-[24px] font-inter text-[18px] font-semibold tracking-[-0.72px] ">
          Perfil
        </h2>
        <div className="flex gap-[16px] w-full flex-wrap">
          <Card className={HasNfts ? "bg-green-100" : "bg-red-100"} />
          <Card />
          <Card />
          <Card />
        </div>
        <Card />
      </div>
    </section>
  );
};

export default ProfilePage;
