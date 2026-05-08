import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useWeb3 } from "@/context/Web3Provider";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Link from "next/link";
import { cn, shortenAddress, copyToClipboard } from "@/utils";

const MenuItemButton = ({
  title,
  description,
  icon,
  image,
  onClick,
  href,
  className,
  isSpecialPage,
  ...props
}) => {
  const inner = (
    <div className="flex items-center gap-[12px] flex-1">
      {(icon || image) && (
        <div
          className={cn(
            "bg-[rgba(25,54,63,0.04)] group-hover:bg-transparent border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid group-hover:border-transparent transition duration-200 ease-out",
            "rounded-[8px] shrink-0 size-[34px] shadow-[0px_0px_4px_0px_inset_rgba(25,54,63,0.04)] group-hover:shadow-none flex justify-center items-center",
            isSpecialPage &&
              "bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.06)] shadow-[0px_0px_4px_0px_inset_rgba(255,255,255,0.06)]",
          )}
        >
          {icon ? (
            icon
          ) : (
            <Image
              src={image}
              alt=""
              className={cn(
                "size-[12px] aspect-square",
                isSpecialPage && "filter brightness-200",
              )}
            />
          )}
        </div>
      )}
      <div className="flex flex-col gap-[8px] items-start justify-center flex-1">
        <p
          className={cn(
            "font-inter font-medium text-[12px] tracking-[-0.56px] leading-[10px] text-[#19363f]",
            isSpecialPage && "text-[#fff]",
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "font-inter font-normal text-[12px] text-[rgba(25,54,63,0.7)] tracking-[-0.24px] whitespace-nowrap leading-[12px]",
              isSpecialPage && "text-[rgba(255,255,255,0.7)]",
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <MenuItem>
        <Link
          href={href}
          {...props}
          className={cn(
            "group flex flex-1 p-[6px] justify-between items-center cursor-pointer w-full rounded-[12px] border border-solid border-transparent transition duration-200 ease-out",
            "hover:border-[rgba(25,54,63,0.02)] hover:bg-[rgba(25,54,63,0.04)]",
            className,
          )}
          onClick={onClick}
        >
          {inner}
        </Link>
      </MenuItem>
    );
  }

  return (
    <MenuItem>
      <div
        {...props}
        className={cn(
          "group flex flex-1 p-[6px] justify-between items-center cursor-pointer w-full rounded-[12px] border border-solid border-transparent transition duration-200 ease-out",
          "hover:border-[rgba(25,54,63,0.02)] hover:bg-[rgba(25,54,63,0.04)]",
          className,
        )}
        onClick={onClick}
      >
        {inner}
      </div>
    </MenuItem>
  );
};

const UserDashboard = ({ isSpecialPage }) => {
  const { logout, smartWalletAddress } = useWeb3();

  const navigation = [
    {
      id: 0,
      title: !!smartWalletAddress ? shortenAddress(smartWalletAddress) : "...",
      description: "Tu Wallet",
      icon: (
        <Icon
          name="wallet"
          className="size-[16px] aspect-square"
          size={20}
          fill={isSpecialPage ? "#fff" : "black"}
        />
      ),
      onClick: () => copyToClipboard(smartWalletAddress || ""),
    },

    {
      id: 2,
      title: "Sign out",
      description: "Cerrar sesión",
      icon: (
        <Icon
          name="logout"
          className="size-[16px] aspect-square"
          fill={"red"}
        />
      ),
      onClick: () => logout(),
    },
  ];

  return (
    <Menu className="relative outline-none" as="div">
      <MenuButton className="group flex gap-[4px] justify-center items-center outline-none">
        <Icon
          name="chevron"
          size={20}
          className="aspect-square size-[16px] transition-transform duration-200 group-data-[open]:rotate-180"
          fill={isSpecialPage ? "#fff" : "black"}
        />
        <div className="bg-[#1b5ffd] size-[20px] rounded-full flex items-center justify-center shrink-0 p-[4px]">
          <Icon name="profile" className="size-full" size={20} fill="#fff" />
        </div>
        <span
          className={cn(
            "text-[#19363F] font-inter text-[14px] font-bold tracking-[-0.56px] leading-[16px]",
            isSpecialPage && "text-[#fff]",
          )}
        >
          {shortenAddress(smartWalletAddress)}
        </span>
      </MenuButton>
      <MenuItems
        className={cn(
          "[--anchor-gap:1rem] [--anchor-offset:0.5rem] origin-top transition duration-200 ease-out outline-none shadow-popover data-[closed]:scale-95 data-[closed]:opacity-0",
          "flex w-[260px] flex-col items-start gap-0 rounded-[16px] py-[16px] border-[0.7px] border-solid border-[rgba(25,54,63,0.02)]",
          "bg-[rgba(250,251,251,0.80)] backdrop-blur-[15px]",
          isSpecialPage &&
            "bg-[rgba(255,255,255,0.06)]  border-[rgba(255,255,255,0.06)] shadow-[0_6px_14px_-4px_rgba(25,54,63,0.15),0_12px_20px_-4px_rgba(25,54,63,0.15)]",
        )}
        anchor="bottom end"
        data-lenis-prevent
        transition
        modal={false}
      >
        <div className="flex p-[0_20px] pb-[8px] justify-center items-center gap-[10px]">
          <label
            className={cn(
              "text-[#19363F] leading-normal font-inter text-[16px] font-medium tracking-[-0.64px]",
              isSpecialPage && "text-[#fff]",
            )}
          >
            Menu
          </label>
        </div>
        <div className="flex p-[6px_14px] justify-center items-start gap-0 w-full flex-col">
          {navigation.map((item) => (
            <MenuItemButton
              isSpecialPage={isSpecialPage}
              key={item.id}
              {...item}
            />
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default UserDashboard;
