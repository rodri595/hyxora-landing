"use client";
import Card from "../Card";
import Icon from "@/components/Icon";
import Video from "@/components/Video";
import Image from "@/components/Image";
import ErrorComp from "@/components/Error";
import { useMemo } from "react";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
import { cn } from "@/utils";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import Spinner from "@/components/Spinner";
import { GetNftsRemaining } from "@/hooks/nfts/GetNftsRemaining";
import { useWeb3 } from "@/context/Web3Provider";
import fireSVG from "@/assets/imgs/icons/fire.svg";

const DataContent = () => {
  const { data: payments } = GetMyPayments();
  const {
    data: nftsRemaining,
    isLoading: isNftsRemainingLoading,
    error: nftsRemainingError,
  } = GetNftsRemaining();
  const { setIsModalPurchaseNFTOpen } = useWeb3();
  const HasNfts = useMemo(() => {
    if (!payments || payments.length === 0) return false;
    const filtered = payments.filter(
      (payment) => payment?.status === "completed" && payment?.tokenId,
    );
    return filtered.length > 0 ? filtered : false;
  }, [payments]);
  const { data: userInformation, isLoading: isLoadingUserInformation } =
    useGetUserInformation({
      enabled: !HasNfts,
    });
  const UserEmail = useMemo(() => {
    if (!userInformation?.information) return "";
    return userInformation?.information?.email || "";
  }, [userInformation]);
  const UserName = useMemo(() => {
    if (!HasNfts || HasNfts.length === 0) return "";
    return HasNfts[0]?.name || "";
  }, [HasNfts]);
  return (
    <>
      <ErrorComp
        error={nftsRemainingError}
        message={
          nftsRemainingError?.response?.data?.message ||
          nftsRemainingError?.message ||
          "Error al cargar la cantidad de NFTs restantes"
        }
      />
      <div className="flex gap-[16px] w-full flex-wrap max-md:flex-col">
        <Card className={cn("p-[16px] max-lg:min-w-[250px] max-md:min-w-full")}>
          <div className="flex  w-full justify-between flex-1">
            {/* / */}
            <div className="flex gap-[8px] items-start justify-center ">
              <div className="relative flex items-center justify-center size-[24px] shrink-0 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="absolute"
                >
                  <title>Perfil de usuario</title>
                  <rect
                    x="0.5"
                    y="0.5"
                    width="23"
                    height="23"
                    rx="2.83333"
                    stroke="url(#paint0_radial_239_27417)"
                    strokeOpacity="0.6"
                  />

                  <defs>
                    <radialGradient
                      id="paint0_radial_239_27417"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(15 8) rotate(132.614) scale(16.9853)"
                    >
                      <stop stopColor="#1B5FFD" />
                      <stop offset="1" stopColor="#1B5FFD" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
                <Icon name="sparkle" size={20} className="size-[16px]" />
              </div>
            </div>
            {/* / */}

            {/* / */}
          </div>
          <div className="flex  w-full justify-between flex-1">
            <div className="flex gap-[8px] items-center justify-center ml-[32px]">
              <div>
                <p className="text-[18px] text-[#8A9BB0] font-medium leading-[22px]">
                  Hola
                </p>
                {UserName ? (
                  <p className="text-[24px] font-bold text-[#0D1B2A] leading-6.5">
                    {UserName}
                  </p>
                ) : isLoadingUserInformation ? (
                  <Spinner />
                ) : (
                  <p className="text-[13px] font-bold text-[#0D1B2A] leading-[15px]">
                    {UserEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
        {/*  */}
        <Card
          className={cn(
            "p-[16px] max-lg:min-w-[250px] max-md:min-w-full overflow-hidden relative max-md:min-h-[120px]",
            HasNfts && "border-[rgba(255,196,50,0.35)]",
          )}
          style={
            HasNfts
              ? {
                  background:
                    "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.30) 100%), radial-gradient(79.3% 79.3% at 50.16% 96.09%, #1a1200 0%, #0a0800 100%)",
                  boxShadow:
                    "0 0 0 1px rgba(255,196,50,0.25), 0 4px 32px rgba(255,196,50,0.12)",
                }
              : undefined
          }
        >
          {HasNfts && (
            <Video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-18 pointer-events-none"
              src="/videos/helix-founder.webm"
            />
          )}

          <div className="flex  w-full justify-between flex-1 relative z-1 ">
            {/* / */}
            <div className="flex gap-[8px] items-start justify-center ">
              <div className="relative flex items-center justify-center size-[24px] shrink-0 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="absolute"
                >
                  <title>Plan del usuario</title>
                  <rect
                    x="0.5"
                    y="0.5"
                    width="23"
                    height="23"
                    rx="2.83333"
                    stroke="url(#paint0_radial_plan)"
                    strokeOpacity="0.8"
                  />

                  <defs>
                    <radialGradient
                      id="paint0_radial_plan"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(15 8) rotate(132.614) scale(16.9853)"
                    >
                      <stop stopColor={HasNfts ? "#FFD970" : "#000000"} />
                      <stop
                        offset="1"
                        stopColor={HasNfts ? "#A37800" : "#000000"}
                        stopOpacity="0"
                      />
                    </radialGradient>
                  </defs>
                </svg>
                <Icon
                  name="sparkle"
                  size={20}
                  className="size-[16px]"
                  fill={HasNfts ? "#FFD970" : "black"}
                />
              </div>
              <div>
                <p
                  className={cn(
                    "text-[18px] text-[#8A9BB0] font-medium leading-[22px]",
                    HasNfts && "text-[rgba(255,196,50,0.55)]",
                  )}
                >
                  Plan
                </p>
                {HasNfts ? (
                  <p
                    className="text-[24px] font-bold leading-6.5"
                    style={{
                      background:
                        "linear-gradient(to right, rgb(255, 217, 112) 0%, rgb(163, 120, 0) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Founder
                  </p>
                ) : (
                  <p className="text-[24px] font-bold text-[#0D1B2A] leading-6.5">
                    New User
                  </p>
                )}
              </div>
            </div>
            {/* / */}
            {!HasNfts && (
              <div className="flex justify-center items-center flex-col gap-[4px]">
                <div className="flex shrink-0 justify-center items-center  size-[30px] p-[4px] bg-[#E4E9EF]  rounded-full">
                  <div className="flex shrink-0 justify-center items-center  size-full bg-[#fff]  rounded-full">
                    <Icon name="sparkle" size={20} className="size-[12px]" />
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="9"
                  viewBox="0 0 28 9"
                  fill="none"
                >
                  <title>Roadmap</title>
                  <g opacity="0.2" filter="url(#filter0_f_plan_shadow)">
                    <ellipse cx="14" cy="4.5" rx="10" ry="0.5" fill="black" />
                  </g>
                  <defs>
                    <filter
                      id="filter0_f_plan_shadow"
                      x="0"
                      y="0"
                      width="28"
                      height="9"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feGaussianBlur
                        stdDeviation="2"
                        result="effect1_foregroundBlur_plan_shadow"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>
            )}
            {/* / */}
          </div>
        </Card>
        {/*  */}
        <Card className={cn("p-[16px] max-lg:min-w-[250px] max-md:min-w-full")}>
          <div className="flex  w-full justify-between flex-1">
            {/* / */}
            <div className="flex gap-[8px] items-start justify-center ">
              <div>
                <p className="text-[11px] text-[#8A9BB0] font-medium leading-[15px]">
                  RoadMap
                </p>
                <p className="text-[13px] font-bold text-[#0D1B2A] leading-[15px]">
                  NFT Founders
                </p>
              </div>
            </div>
            {/* / */}
            <button
              type="button"
              rel="noopener noreferrer"
              onClick={() => setIsModalPurchaseNFTOpen(true)}
              className={cn(
                "bg-[#1b5ffd] border border-[rgba(255,255,255,0.2)] border-solid  relative rounded-[100px] cursor-pointer h-[24px] overflow-hidden",
              )}
            >
              <div className="flex gap-[3px] h-[22px] items-center justify-center overflow-hidden p-[8px_12px]  relative rounded-[inherit] ">
                <Image
                  src={fireSVG}
                  alt="Fire Icon"
                  className="relative size-[8px]"
                />
                <p className="font-medium text-[10px] text-[#f7f8f8] tracking-[-0.48px] whitespace-nowrap">
                  Comprar NFT
                </p>
              </div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                }}
              />
            </button>
            {/* <div className="flex justify-center items-center flex-col gap-[4px] animate-pulse">
              <div className="flex shrink-0 justify-center items-center  size-[30px] p-[4px] bg-[#E4E9EF]  rounded-full">
                <div className="flex shrink-0 justify-center items-center  size-full bg-[#fff]  rounded-full">
                  <Icon name="sparkle" size={20} className="size-[12px] " />
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="9"
                viewBox="0 0 28 9"
                fill="none"
              >
                <title>Roadmap</title>
                <g opacity="0.2" filter="url(#filter0_f_239_27441)">
                  <ellipse cx="14" cy="4.5" rx="10" ry="0.5" fill="black" />
                </g>
                <defs>
                  <filter
                    id="filter0_f_239_27441"
                    x="0"
                    y="0"
                    width="28"
                    height="9"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="2"
                      result="effect1_foregroundBlur_239_27441"
                    />
                  </filter>
                </defs>
              </svg>
            </div> */}
            {/* / */}
          </div>
          <div className="flex  w-full justify-between flex-1">
            <div className="flex gap-[8px] items-center justify-center ">
              <div>
                <p className="text-[11px] text-[#8A9BB0] font-medium leading-[15px]">
                  Fase:
                </p>
                <p className="text-[13px] font-bold text-[#0D1B2A] leading-[15px]">
                  Publica 1 (activa)
                </p>
              </div>
            </div>
            <div className="flex gap-[8px] items-center justify-center ">
              <div>
                <p className="text-[11px] text-[#8A9BB0] font-medium leading-[15px]">
                  Cantidad restante:
                </p>
                <div className="text-[13px] font-bold text-[#0D1B2A] leading-[15px]">
                  {isNftsRemainingLoading ? (
                    <Spinner />
                  ) : nftsRemaining?.remaining > 0 ? (
                    nftsRemaining.remaining
                  ) : (
                    "Agotados"
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default DataContent;
