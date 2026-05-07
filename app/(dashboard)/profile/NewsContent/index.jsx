"use client";
import Card from "../Card";
import Error from "@/components/Error";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import Topic from "./Topic";
import NewsItem from "./NewsItem";
import { useMemo } from "react";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
import { useGetAllPolls } from "@/hooks/poll/useGetAllPolls";

const newsData = [
  {
    id: 1,
    icon: "coins-01",
    title: "¿Qué es y para qué sirve la reserva de cripto de Trump?",
    url: "https://cnnespanol.cnn.com/2025/03/12/eeuu/anuncio-trump-reserva-cripto-servir-orix",
  },
  {
    id: 2,
    icon: "currency-dollar-circle",
    title: "Los pagos con Stablecoins ya rivalizan con Paypal y Visa",
    url: "https://cryptonews.com/es/noticias/los-pagos-con-stablecoins-ya-rivalizan-con-paypal-y-visa/",
  },
];
const NewsContent = () => {
  const { data: payments } = GetMyPayments();
  const HasNfts = useMemo(() => {
    if (!payments || payments.length === 0) return false;
    const filtered = payments.filter(
      (payment) => payment?.status === "completed" && payment?.tokenId,
    );
    return filtered.length > 0 ? filtered : false;
  }, [payments]);
  const {
    data: pollsData_data,
    isLoading: pollsData_isLoading,
    error: pollsData_error,
  } = useGetAllPolls();
  return (
    <div className="flex w-full h-full gap-[16px] justify-start items-start max-md:flex-col-reverse">
      <Card className="h-full max-md:w-full">
        <Error
          error={pollsData_error}
          message={
            pollsData_error?.response?.data?.message ||
            pollsData_error?.message ||
            "Error al cargar comite"
          }
        />
        <h3 className="text-[#19363F] leading-[24px] font-inter text-[18px] font-semibold tracking-[-0.72px]">
          Comité Consultivo
        </h3>
        <h3 className="text-[#8A9BB0] leading-[22px] font-inter text-[14px] font-medium tracking-[-0.42px]">
          Últimas consultas del comité consultivo
        </h3>
        <div className="flex flex-1 flex-col gap-[8px] overflow-hidden  w-full">
          {pollsData_isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          ) : pollsData_data?.length > 0 ? (
            pollsData_data.map((poll) => <Topic key={poll._id} poll={poll} />)
          ) : (
            !pollsData_error && (
              <p className="text-[#8A9BB0] font-inter text-[13px] text-center py-4">
                No hay consultas disponibles
              </p>
            )
          )}
        </div>
        {HasNfts && (
          <Button isPrimary className="mt-auto  mx-auto">
            Ir al Comité Consultivo
          </Button>
        )}
      </Card>
      <Card className="h-full max-w-[300px] max-md:max-w-full">
        <h3 className="text-[#19363F] leading-[24px] font-inter text-[18px] font-semibold tracking-[-0.72px]">
          Noticias
        </h3>
        <h3 className="text-[#8A9BB0] leading-[22px] font-inter text-[14px] font-medium tracking-[-0.42px]">
          Últimas noticias del sector cripto
        </h3>
        <div className="flex flex-1 flex-col gap-[10px] overflow-y-auto">
          {newsData.map((item) => (
            <NewsItem key={item.id} item={item} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default NewsContent;
