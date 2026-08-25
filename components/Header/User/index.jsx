"use client";

import trendingIcon from "@/assets//imgs/icons/trending.png";
import ErrorComp from "@/components/Error";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Spinner from "@/components/Spinner";
import { HYXORA_APP_URL } from "@/constants/links";
import { roleNames } from "@/constants/roles";
import { useAppLaunch } from "@/context/AppLaunchProvider";
import { useWeb3 } from "@/context/Web3Provider";
import { GetMyPayments } from "@/hooks/nfts/GetMyPayments";
//
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import { cn, copyToClipboard, shortenAddress } from "@/utils";
import { haptic } from "@/utils/haptics";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

// Fires a haptic whenever the menu opens or closes — regardless of whether it
// was triggered by the button, an outside click, or selecting an item.
const MenuOpenHaptic = ({ open }) => {
  const wasOpen = useRef(open);
  useEffect(() => {
    if (open !== wasOpen.current) {
      haptic(open ? "light" : "soft");
      wasOpen.current = open;
    }
  }, [open]);
  return null;
};
const MenuItemButton = ({
  title = "Title",
  description = "Description",
  disabled = false,
  icon,
  image,
  onClick,
  href,
  className,
  ...props
}) => {
  if (href) {
    return (
      <MenuItem>
        <Link
          href={href}
          {...props}
          rel="noopener noreferrer"
          className={cn(
            "group flex flex-1 p-[6px] justify-between items-center cursor-pointer w-full rounded-[12px] border-[1px] border-solid transition-colors border-transparent transition duration-200 ease-out ",
            "hover:border-[rgba(25,54,63,0.02)] hover:bg-[rgba(25,54,63,0.04)] hover:box-shadow-[0_0_4px_0_rgba(25,54,63,0.04)_inset] ",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          onClick={onClick}
        >
          <div className="flex items-center gap-[12px] flex-1">
            {(icon || image) && (
              <div
                className={cn(
                  "bg-[rgba(25,54,63,0.04)] group-hover:bg-transparent border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid group-hover:border-transparent transition duration-200 ease-out ",
                  "rounded-[8px] shrink-0 size-[34px] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] group-hover:shadow-[none] flex justify-center items-center"
                )}
              >
                {icon ? (
                  icon
                ) : image ? (
                  <Image src={image} alt="Fire Icon" className="size-[12px] aspect-square" />
                ) : null}
              </div>
            )}
            <div className="flex flex-col gap-[8px] items-start justify-center flex-1 ">
              <p
                className={`font-inter font-medium text-[12px] tracking-[-0.56px] leading-[10px] ${
                  disabled ? "text-[rgba(25,54,63,0.4)]" : "text-[#19363f]"
                }`}
              >
                {title}
              </p>
              {description && (
                <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] whitespace-nowrap leading-[12px]">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div />
        </Link>
      </MenuItem>
    );
  }
  return (
    <MenuItem>
      <div
        {...props}
        className={cn(
          "group flex flex-1 p-[6px] justify-between items-center cursor-pointer w-full rounded-[12px] border-[1px] border-solid transition-colors border-transparent transition duration-200 ease-out ",
          "hover:border-[rgba(25,54,63,0.02)] hover:bg-[rgba(25,54,63,0.04)] hover:box-shadow-[0_0_4px_0_rgba(25,54,63,0.04)_inset] ",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-[12px] flex-1">
          {(icon || image) && (
            <div
              className={cn(
                "bg-[rgba(25,54,63,0.04)] group-hover:bg-transparent border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid group-hover:border-transparent transition duration-200 ease-out ",
                "rounded-[8px] shrink-0 size-[34px] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] group-hover:shadow-[none] flex justify-center items-center"
              )}
            >
              {icon ? (
                icon
              ) : image ? (
                <Image src={trendingIcon} alt="Fire Icon" className="size-[12px] aspect-square" />
              ) : null}
            </div>
          )}
          <div className="flex flex-col gap-[8px] items-start justify-center flex-1 ">
            <p
              className={`font-inter font-medium text-[12px] tracking-[-0.56px] leading-[10px] ${
                disabled ? "text-[rgba(25,54,63,0.4)]" : "text-[#19363f]"
              }`}
            >
              {title}
            </p>
            {description && (
              <p className="font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] whitespace-nowrap leading-[12px]">
                {description}
              </p>
            )}
          </div>
        </div>
        <div />
      </div>
    </MenuItem>
  );
};

const User = () => {
  const { logout, smartWalletAddress } = useWeb3();
  const { hintOpen, dismissHint } = useAppLaunch();
  const {
    data: userInformation,
    isLoading: isLoadingUserInformation,
    error: userInformationError,
  } = useGetUserInformation();
  const isAdmin = useMemo(() => {
    return userInformation?.information?.role?.includes(roleNames?.admin ?? "") ?? false;
  }, [userInformation]);
  const { data: paymentsData } = GetMyPayments();
  const hasNft = useMemo(() => {
    if (!paymentsData || paymentsData?.length === 0) return false;
    return paymentsData.some((payment) => payment?.status === "completed" && payment?.tokenId);
  }, [paymentsData]);
  const navigation = [
    {
      id: 0,
      title: "Mi Wallet",
      description: smartWalletAddress ? shortenAddress(smartWalletAddress) : "...",
      icon: smartWalletAddress ? (
        <Icon name="wallet" className="size-[16px] aspect-square" size={20} />
      ) : (
        <Spinner />
      ),
      onClick: () => copyToClipboard(smartWalletAddress || ""),
    },
    {
      id: 3,
      title: "Mi Perfil",
      description: "Tu perfil personal",
      icon: <Icon name="profile" className="size-[16px] aspect-square" size={20} />,
      href: "/profile",
    },
    {
      id: 4,
      title: "Comité  Consultivo",
      description: "Únete al comité",
      icon: <Icon name="documents" className="size-[16px] aspect-square" />,
      href: hasNft ? "/comite" : undefined,
      disabled: !hasNft,
    },
    {
      id: 5,
      title: "Mis NFTs",
      description: "Tus NFTs coleccionables",
      icon: <Icon name="sparkle" className="size-[16px] aspect-square" size={20} />,
      href: "/nfts",
      // disabled: true,
    },
    {
      id: 10,
      title: "Sign out",
      description: "Cerrar sesión",
      icon: <Icon fill="red" name="logout" className="size-[16px] aspect-square" />,
      onClick: () => logout(),
    },
  ];
  return (
    <>
      <Menu className="relative" as="div">
        {({ open }) => (
          <>
            <MenuOpenHaptic open={open} />
            {/* Post-login halo — drops the moment the menu is opened, since
                by then the user has found the control it was pointing at. */}
            {hintOpen && !open && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[100px] bg-[#1b5ffd] opacity-40 animate-ping"
              />
            )}
            <MenuButton
              onClick={dismissHint}
              className={cn(
                "bg-[#1b5ffd] border border-[rgba(255,255,255,0.2)] border-solid h-[30px] relative rounded-[100px] cursor-pointer overflow-hidden aspect-square",
                hintOpen && "ring-2 ring-[#1b5ffd] ring-offset-2 ring-offset-white"
              )}
            >
              <div className="flex gap-[3px] h-[30px] items-center justify-center overflow-hidden p-[8px] relative rounded-[inherit]">
                <Icon name="profile" className="size-full" size={20} fill="#fff" />
              </div>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "0px 0px 10px 0px inset rgba(255,255,255,0.4)",
                }}
              />
            </MenuButton>

            <MenuItems
              className={cn(
                "[--anchor-gap:1rem] [--anchor-offset:0.5rem] origin-top transition duration-200 ease-out outline-none shadow-popover after:absolute after:inset-0  after:pointer-events-none  data-[closed]:scale-95 data-[closed]:opacity-0",
                "flex w-[307px] flex-col items-start gap-[0px] rounded-[16px] py-[16px] border-[0.7px] border-solid border-[rgba(25,54,63,0.02)]",
                "bg-[rgba(250, 251, 251, 0.80)] box-shadow-[0_3px_4px_-4px_rgba(25,54,63,0.05),0_8px_8px_-4px_rgba(25,54,63,0.10),0_0_4px_0_rgba(25,54,63,0.04)_inset] backdrop-blur-[15px]",
                "overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.10)] scrollbar-track-transparent scrollbar-thumb-rounded-full "
              )}
              anchor="bottom end"
              data-lenis-prevent
              transition
              modal={false}
            >
              <div className="flex p-[0_20px] justify-center items-center gap-[10px]">
                <label className="text-[#19363F] leading-[normal] text-edge-[cap] font-inter text-[16px] font-medium tracking-[-0.64px]">
                  Menu
                </label>
              </div>
              <div className="flex p-[6px_14px] justify-center items-start gap-[0px] w-full flex-col">
                {isLoadingUserInformation ? (
                  <Spinner />
                ) : (
                  isAdmin && (
                    <MenuItemButton
                      key={1}
                      title="Admin Panel"
                      description="Gestionar plataforma"
                      icon={<Icon name="diamond" className="size-[16px] aspect-square" size={20} />}
                      href="/admin"
                    />
                  )
                )}
                <MenuItemButton
                  title="Ir a la App"
                  description="Abre tu dashboard"
                  icon={<Icon name="external-link" className="size-[16px] aspect-square" />}
                  href={HYXORA_APP_URL}
                  target="_blank"
                  onClick={dismissHint}
                />
                {navigation?.map((item) => (
                  <MenuItemButton key={item.id} {...item} />
                ))}
              </div>
              {userInformationError && (
                <div className="flex p-[0_20px] justify-center items-center gap-[10px]">
                  <ErrorComp
                    error={userInformationError}
                    message={
                      userInformationError?.response?.data?.message ||
                      userInformationError?.message ||
                      "Failed to load user information"
                    }
                  />
                </div>
              )}
              <div className="flex p-[0_20px] justify-center items-center gap-[10px]">
                <span className=" text-[rgba(25,54,63,0.70)] leading-[18px] font-inter text-[12px] font-normal tracking-[-0.24px]">
                  Al usar la plataforma aceptas nuestros{" "}
                  <Link href="/terms" target="_blank" className="text-[#19363F] font-bold">
                    Términos de Uso
                  </Link>{" "}
                  y nuestra{" "}
                  <Link href="/privacy" target="_blank" className="text-[#19363F] font-bold">
                    Política de Privacidad
                  </Link>
                </span>
              </div>
            </MenuItems>
          </>
        )}
      </Menu>
    </>
  );
};

export default User;
