"use client";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
import Error from "@/components/Error";
// import Icon from "@/components/Icon";
import { useMemo } from "react";
import Spinner from "@/components/Spinner";
// import Image from "@/components/Image";
// import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ComitePage() {
  const router = useRouter();
  const {
    data: paymentsData,
    isPending: paymentsPending,
    error: paymentsError,
  } = GetMyPayments();

  const HasNft = useMemo(() => {
    if (!paymentsData || paymentsData?.length === 0) return false;
    const filteredPayments = paymentsData?.filter(
      (payment) => payment?.status === "completed" && payment?.tokenId,
    );
    return filteredPayments?.length > 0 ? filteredPayments : false;
  }, [paymentsData]);

  useEffect(() => {
    if (!paymentsPending && !HasNft) {
      router.replace("/");
    }
  }, [paymentsPending, HasNft, router]);

  if (paymentsPending) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (!HasNft) return null;

  return (
    <section
      className="flex-1 flex gap-[16px] justify-start items-start p-4 h-full min-h-0 overflow-y-auto"
      data-lenis-prevent
    >
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
          Comité Consultivo de Hyxora
        </h2>
      </div>
    </section>
  );
}
