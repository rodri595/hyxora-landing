"use client";
import Card from "../Card";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import tokensIMG from "@/assets//imgs/brand/tokens.webp";
import { useMemo } from "react";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
import { cn } from "@/utils";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import Spinner from "@/components/Spinner";

const DataContent = () => {
  const { data: payments } = GetMyPayments();
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
                <p className="text-[24px] font-bold text-[#0D1B2A] leading-[26px]">
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
        )}
        style={
          HasNfts
            ? {
                background:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.20) 100%), radial-gradient(79.3% 79.3% at 50.16% 96.09%, #2C66EF 0%, #091A1F 100%)",
              }
            : undefined
        }
      >
        {HasNfts && (
          <>
            <Image
              src={tokensIMG}
              alt="Tokens"
              className=" absolute w-[80%] h-full bottom-0 right-0 object-cover z-1"
            />
            <div className="absolute w-full h-full  left-0 top-0 z-1 backdrop-blur-[6px]" />
          </>
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
                    <stop stopColor={HasNfts ? "#1B5FFD" : "#000000"} />
                    <stop
                      offset="1"
                      stopColor={HasNfts ? "#1B5FFD" : "#000000"}
                      stopOpacity="0"
                    />
                  </radialGradient>
                </defs>
              </svg>
              <Icon
                name="sparkle"
                size={20}
                className="size-[16px]"
                fill={HasNfts ? "white" : "black"}
              />
            </div>
            <div>
              <p
                className={cn(
                  "text-[18px] text-[#8A9BB0] font-medium leading-[22px]",

                  HasNfts && "text-[rgba(255,255,255,0.60)]",
                )}
              >
                Plan
              </p>
              <p
                className={cn(
                  "text-[24px] font-bold text-[#0D1B2A] leading-[26px]",
                  HasNfts && "text-white",
                )}
              >
                {HasNfts ? "Founder" : "New User"}
              </p>
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
            </div>
          )}
          {/* / */}
        </div>
        <div className="flex  w-full justify-between flex-1"></div>
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
          <div className="flex justify-center items-center flex-col gap-[4px] animate-pulse">
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
          </div>
          {/* / */}
        </div>
        <div className="flex  w-full justify-between flex-1">
          <div className="flex gap-[8px] items-center justify-center ">
            <div>
              <p className="text-[11px] text-[#8A9BB0] font-medium leading-[15px]">
                Fase:
              </p>
              <p className="text-[13px] font-bold text-[#0D1B2A] leading-[15px]">
                Pre-venta
              </p>
            </div>
          </div>
          <div className="flex gap-[8px] items-center justify-center ">
            <div>
              <p className="text-[11px] text-[#8A9BB0] font-medium leading-[15px]">
                Unds en fase:
              </p>
              <p className="text-[13px] font-bold text-[#0D1B2A] leading-[15px]">
                50 und
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataContent;
