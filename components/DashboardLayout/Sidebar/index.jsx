"use client";

import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { useWeb3 } from "@/context/Web3Provider";
import trendingIcon from "@/assets//imgs/icons/trending.png";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import { useMemo } from "react";
import { roleNames } from "@/constants/roles";

const MenuItemButton = ({
  title = "Title",
  description = "Description",
  disabled = false,
  icon,
  image,
  onClick,
  href,
  active = false,
  ...props
}) => {
  if (href) {
    return (
      <Link
        href={href}
        {...props}
        rel="noopener noreferrer"
        className={cn(
          "group flex  p-[6px] px-[8px] justify-between items-center cursor-pointer w-full rounded-[12px] border-[1px] border-solid transition-colors border-transparent transition duration-200 ease-out ",
          "hover:border-[rgba(25,54,63,0.02)] hover:bg-[rgba(25,54,63,0.04)] hover:box-shadow-[0_0_4px_0_rgba(25,54,63,0.04)_inset] ",
          disabled && "cursor-not-allowed opacity-50",
          active &&
            "bg-white! border-[rgba(25,54,63,0.04))]! shadow-[0px_1px_6px_0px_rgba(25,54,63,0.07)]! ",
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-[12px] flex-1">
          {(icon || image) && (
            <div
              className={cn(
                "bg-[rgba(25,54,63,0.04)] group-hover:bg-transparent border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid group-hover:border-transparent transition duration-200 ease-out ",
                "rounded-[8px] shrink-0 size-[34px] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] group-hover:shadow-[none] flex justify-center items-center",
              )}
            >
              {icon ? (
                icon
              ) : image ? (
                <Image
                  src={image}
                  alt="Fire Icon"
                  className="size-[12px] aspect-square"
                />
              ) : null}
            </div>
          )}
          <div className="flex flex-col gap-[8px] items-start justify-center flex-1 ">
            <p
              className={cn(
                "font-inter font-medium text-[12px] tracking-[-0.56px] leading-[10px]",
                disabled && "text-[rgba(25,54,63,0.4)]",
              )}
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
    );
  }
  return (
    <div
      {...props}
      className={cn(
        "group flex flex-1 p-[6px] px-[8px] justify-between items-center cursor-pointer w-full rounded-[12px] border-[1px] border-solid transition-colors border-transparent transition duration-200 ease-out ",
        "hover:border-[rgba(25,54,63,0.02)] hover:bg-[rgba(25,54,63,0.04)] hover:box-shadow-[0_0_4px_0_rgba(25,54,63,0.04)_inset] ",
        disabled && "cursor-not-allowed opacity-50",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-[12px] flex-1">
        {(icon || image) && (
          <div
            className={cn(
              "bg-[rgba(25,54,63,0.04)] group-hover:bg-transparent border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid group-hover:border-transparent transition duration-200 ease-out ",
              "rounded-[8px] shrink-0 size-[34px] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] group-hover:shadow-[none] flex justify-center items-center",
            )}
          >
            {icon ? (
              icon
            ) : image ? (
              <Image
                src={trendingIcon}
                alt="Fire Icon"
                className="size-[12px] aspect-square"
              />
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
  );
};

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { logout } = useWeb3();
  const pathname = usePathname();
  const { data: userInformation, isLoading: isLoadingUserInformation } =
    useGetUserInformation();
  const toggleMenu = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  const isAdmin = useMemo(() => {
    return (
      userInformation?.information?.role?.includes(roleNames?.admin ?? "") ??
      false
    );
  }, [userInformation]);
  const navigation = [
    {
      id: 2,
      title: "Mi Perfil",
      description: "Tu perfil personal",
      icon: (
        <Icon name="profile" className="size-[16px] aspect-square" size={20} />
      ),
      href: "/profile",
    },
    // {
    //   id: 3,
    //   title: "Comitee",
    //   description: "Únete al comité",
    //   icon: <Icon name="documents" className="size-[16px] aspect-square" />,
    //   href: "/comite",
    // },
    // {
    //   id: 4,
    //   title: "Mis NFTs",
    //   description: "Tus NFTs coleccionables",
    //   icon: (
    //     <Icon name="sparkle" className="size-[16px] aspect-square" size={20} />
    //   ),
    //   href: "/nfts",
    // },
    {
      id: 5,
      title: "Founders",
      description: "Programa de fundadores",
      image: trendingIcon,
      href: "https://founder.hyxora.com/profile",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  ];
  return (
    <aside
      className={cn(
        "flex flex-col items-start justify-start gap-[8px] max-w-[250px] py-[24px] bg-[#F5F7F9] flex-1 overflow-hidden ",
        "max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:transition-transform max-lg:duration-300 max-lg:ease-out relative",
        isSidebarOpen && "max-lg:translate-x-0",
        !isSidebarOpen && "max-lg:-translate-x-full",
      )}
      data-lenis-prevent
    >
      <button
        onClick={() => toggleMenu()}
        type="button"
        className="group hidden max-lg:flex rounded-[8px] border-[0.7px] border-[rgba(25,54,63,0.02)] bg-[rgba(25,54,63,0.04)] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] justify-center items-center shrink-0 !h-[32px] !w-[32px] focus:outline-none absolute top-[16px] right-[16px] z-50"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="#19363f"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/*TOP SECTION  */}
      <div className="flex items-center justify-start px-[16px] mb-2 shrink-0">
        <p className="font-inter text-[#19363F] text-[12px] tracking-[-0.56px] leading-[14px] font-bold ">
          Explorar
        </p>
      </div>
      {/*MIDDLE SECTION SCROLLABLE  */}
      <div
        className="flex flex-col gap-2 w-full px-[8px] flex-1  overflow-auto h-full   min-h-0"
        data-lenis-prevent
      >
        {isLoadingUserInformation ? (
          <Spinner />
        ) : (
          isAdmin && (
            <MenuItemButton
              title="Admin Panel"
              description="Gestionar plataforma"
              icon={
                <Icon
                  name="diamond"
                  className="size-[16px] aspect-square"
                  size={20}
                />
              }
              href="/admin"
              active={pathname === "/admin"}
            />
          )
        )}
        {navigation?.map((item) => (
          <MenuItemButton
            key={item.id}
            {...item}
            active={!!item.href && pathname === item.href}
          />
        ))}
      </div>
      {/*BOTTOM SECTION PINNED  */}
      <div className="w-full px-[8px] mt-auto shrink-0">
        <MenuItemButton
          title="Sign out"
          description="Cerrar sesión"
          icon={
            <Icon
              fill="red"
              name="logout"
              className="size-[16px] aspect-square"
            />
          }
          onClick={() => logout()}
          className="shrink-0"
        />
      </div>
      {/*  */}
    </aside>
  );
};

export default Sidebar;
