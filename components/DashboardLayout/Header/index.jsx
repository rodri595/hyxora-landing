"use client";
import Link from "next/link";
import Image from "@/components/Image";
// import Button from "@/components/Button";
// import Field from "@/components/Field";
import Icon from "@/components/Icon";
import brandIMG from "@/assets/imgs/brand/logo.svg";
import fireSVG from "@/assets/imgs/icons/fire.svg";
import { cn } from "@/utils";
//
import appleIMG from "@/assets/imgs/misc/apple.svg";
import googleIMG from "@/assets/imgs/misc/google.svg";
import menuIcon from "@/assets/imgs/icons/menu.svg";

//
import User from "./User";
import { useWeb3 } from "@/context/Web3Provider";
const Header = ({
  isSpecialPage,
  isSidebarOpen,
  setIsSidebarOpen,
  extraNav = true,
  headerExtra,
}) => {
  const { setIsModalPurchaseNFTOpen } = useWeb3();
  const toggleMenu = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  return (
    <>
      <header
        className={cn(
          "flex flex-col items-start justify-start w-full shrink-0  border-b border-[#E0E3E6] px-[16px]",
          isSpecialPage && "border-[#24292D]",
        )}
      >
        <div className="w-full flex justify-between items-center py-[12px] gap-[24px]">
          {/* left side */}
          <div className="flex items-center justify-start gap-[24px]  flex-1 max-lg:gap-[8px]">
            <button
              onClick={toggleMenu}
              type="button"
              className={cn(
                "group hidden max-lg:flex rounded-[8px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.04)] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] justify-center items-center shrink-0 !h-[24px] !w-[24px] focus:outline-none",
                isSpecialPage &&
                  "bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.1)] text-[#fff] hover:bg-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.2)]",
              )}
            >
              {isSidebarOpen ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Menu</title>
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke={isSpecialPage ? "#fff" : "#19363F"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <Image
                  src={menuIcon}
                  alt="Menu"
                  className={cn(
                    "w-[12px] h-[12px] -scale-x-100",
                    isSpecialPage && "filter invert",
                  )}
                />
              )}
            </button>
            <Link href="/" className="flex gap-2 items-center shrink-0 ">
              <div className="relative shrink-0 size-6">
                <Image
                  className="w-auto h-[24px] object-contain"
                  src={brandIMG}
                  alt="Logo"
                />
              </div>
              <span
                className={cn(
                  "font-inter font-semibold leading-6 text-[#19363f] text-[18px] whitespace-nowrap tracking-[-0.72px]",
                  isSpecialPage && "text-[#FFF]",
                )}
              >
                Hyxora
              </span>
            </Link>
            {/* <Field type="search" placeholder="Search" className="w-full" /> */}
          </div>
          {/* right side */}
          <div className="flex justify-end items-center gap-[24px] flex-1">
            {/* / */}
            <ul className="flex gap-[8px] items-center justify-center  max-md:hidden">
              <li className=" opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="aspect-square size-[20px]"
                >
                  <title>Chat</title>
                  <path
                    d="M22 12.62V14.68C22 15.24 21.54 15.7 20.97 15.7H19.04C17.96 15.7 16.97 14.91 16.88 13.83C16.82 13.2 17.06 12.61 17.48 12.2C17.85 11.82 18.36 11.6 18.92 11.6H20.97C21.54 11.6 22 12.06 22 12.62Z"
                    fill={isSpecialPage ? "#fff" : "#8294AC"}
                  />
                  <path
                    d="M15.38 13.96C15.29 12.91 15.67 11.88 16.43 11.13C17.07 10.48 17.96 10.1 18.92 10.1H19.49C19.77 10.1 20 9.86999 19.96 9.58999C19.69 7.64999 18.01 6.14999 16 6.14999H6C3.79 6.14999 2 7.93999 2 10.15V17.15C2 19.36 3.79 21.15 6 21.15H16C18.02 21.15 19.69 19.65 19.96 17.71C20 17.43 19.77 17.2 19.49 17.2H19.04C17.14 17.2 15.54 15.78 15.38 13.96ZM13 11.9H7C6.59 11.9 6.25 11.57 6.25 11.15C6.25 10.73 6.59 10.4 7 10.4H13C13.41 10.4 13.75 10.74 13.75 11.15C13.75 11.56 13.41 11.9 13 11.9Z"
                    fill={isSpecialPage ? "#fff" : "#8294AC"}
                  />
                  <path
                    d="M14.2099 3.98001C14.4699 4.25001 14.2399 4.65001 13.8599 4.65001H6.02991C4.93991 4.65001 3.91991 4.97001 3.06991 5.52001C2.67991 5.77001 2.14991 5.50001 2.33991 5.07001C2.89991 3.76001 4.20991 2.85001 5.71991 2.85001H11.3399C12.4999 2.85001 13.5299 3.26001 14.2099 3.98001Z"
                    fill={isSpecialPage ? "#fff" : "#8294AC"}
                  />
                </svg>
              </li>
              <li className=" opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                <Icon
                  name="notification"
                  fill={isSpecialPage ? "#fff" : "#8294AC"}
                  className="aspect-square size-[20px]"
                >
                  <path
                    d="M14.8299 20.01C14.4099 21.17 13.2999 22 11.9999 22C11.2099 22 10.4299 21.68 9.87993 21.11C9.55993 20.81 9.31993 20.41 9.17993 20C9.30993 20.02 9.43993 20.03 9.57993 20.05C9.80993 20.08 10.0499 20.11 10.2899 20.13C10.8599 20.18 11.4399 20.21 12.0199 20.21C12.5899 20.21 13.1599 20.18 13.7199 20.13C13.9299 20.11 14.1399 20.1 14.3399 20.07C14.4999 20.05 14.6599 20.03 14.8299 20.01Z"
                    fill={isSpecialPage ? "#fff" : "#8294AC"}
                  />
                </Icon>
              </li>
              <li className=" opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                <Icon
                  name="setting"
                  fill={isSpecialPage ? "#fff" : "#8294AC"}
                  className="aspect-square size-[24px]"
                />
              </li>
            </ul>
            <User isSpecialPage={isSpecialPage} />
          </div>
        </div>
        {(extraNav || headerExtra) && (
          <>
            <div
              className={cn(
                "w-full shrink-0 h-[1px] bg-[#E0E3E6]",
                isSpecialPage && "bg-[#24292D]",
              )}
            />
            <div
              className={cn(
                "w-full flex justify-between items-center gap-[24px]",
                !headerExtra && "py-3",
              )}
            >
              {headerExtra ? (
                <div className="flex justify-start items-center flex-1">
                  {headerExtra}
                </div>
              ) : (
                <>
                  {/* left side */}
                  <div className="flex justify-start items-center gap-6 flex-1 ">
                    {/* Hot Button */}
                    <button
                      type="button"
                      rel="noopener noreferrer"
                      onClick={() => setIsModalPurchaseNFTOpen(true)}
                      className={cn(
                        "bg-[#1b5ffd] border border-[rgba(255,255,255,0.2)] border-solid h-[30px] relative rounded-[100px] cursor-pointer max-md:h-[24px] overflow-hidden",
                      )}
                    >
                      <div className="flex gap-[3px] h-[30px] max-md:h-[24px] items-center justify-center overflow-hidden p-[8px_16px] max-md:p-[8px_12px]  relative rounded-[inherit]">
                        <Image
                          src={fireSVG}
                          alt="Fire Icon"
                          className="relative size-[10px] max-md:size-[8px]"
                        />
                        <p className="font-medium text-[12px] text-[#f7f8f8] tracking-[-0.48px] whitespace-nowrap">
                          Comprar NFT
                        </p>
                      </div>
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow:
                            "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                        }}
                      />
                    </button>
                  </div>
                  {/* right side */}
                  <div className="flex justify-end items-center gap-[24px] flex-1">
                    <div className="flex justify-end items-center gap-[16px] opacity-50 cursor-not-allowed">
                      <Image
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Próximamente"
                        alt="Download on the App Store"
                        src={appleIMG}
                        className="h-[24px] w-auto max-lg:h-[20px]"
                      />
                      <Image
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Próximamente"
                        src={googleIMG}
                        alt="Get it on Google Play"
                        className="h-[24px] w-auto max-lg:h-[20px]"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </header>
    </>
  );
};

export default Header;
