"use client";

import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { useWeb3 } from "@/context/Web3Provider";
import trendingIcon from "@/assets//imgs/icons/trending.png";

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
          "group flex flex-1 p-[6px] px-[8px] justify-between items-center cursor-pointer w-full rounded-[12px] border-[1px] border-solid transition-colors border-transparent transition duration-200 ease-out ",
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

const Sidebar = () => {
  const { logout } = useWeb3();
  const pathname = usePathname();
  const navigation = [
    {
      id: 1,
      title: "Admin Panel",
      description: "Gestionar plataforma",
      icon: (
        <Icon name="diamond" className="size-[16px] aspect-square" size={20} />
      ),
      href: "/admin",
    },
    {
      id: 2,
      title: "Mi Perfil",
      description: "Tu perfil personal",
      icon: (
        <Icon name="profile" className="size-[16px] aspect-square" size={20} />
      ),
      href: "/profile",
    },
    {
      id: 3,
      title: "Comitee",
      description: "Únete al comité",
      icon: <Icon name="documents" className="size-[16px] aspect-square" />,
      href: "/comite",
    },
    {
      id: 4,
      title: "Mis NFTs",
      description: "Tus NFTs coleccionables",
      icon: (
        <Icon name="sparkle" className="size-[16px] aspect-square" size={20} />
      ),
      href: "/nfts",
    },
    {
      id: 5,
      title: "Founders",
      description: "Programa de fundadores",
      image: trendingIcon,
      href: "https://founder.hyxora.com/",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      id: 6,
      title: "Sign out",
      description: "Cerrar sesión",
      icon: (
        <Icon fill="red" name="logout" className="size-[16px] aspect-square" />
      ),
      onClick: () => logout(),
    },
  ];
  return (
    <aside className="flex flex-col w-[250px] py-[24px] items-start justify-start gap-[8px] bg-[#F5F7F9]">
      {/*  */}
      <div className="flex items-center justify-start px-[16px] mb-2">
        <p className="font-inter text-[#19363F] text-[12px] tracking-[-0.56px] leading-[14px] font-bold ">
          Explorar
        </p>
      </div>
      {/* ////////////////////// */}
      <div className="flex flex-col gap-2 mb-6 w-full px-[8px]">
        {navigation?.map((item) => (
          <MenuItemButton
            key={item.id}
            {...item}
            active={!!item.href && pathname === item.href}
          />
        ))}
      </div>
      {/*  */}
    </aside>
  );
};

export default Sidebar;
