import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import Icon from "../../Icon";
import Link from "next/link";
import { useWeb3 } from "@/context/Web3Provider";
import { shortenAddress, copyToClipboard } from "@/utils";

const styleItem =
  "flex items-center w-full gap-2 h-10 px-1 rounded-xl fill-secondary transition-colors data-[focus]:bg-surface-03 data-[focus]:fill-primary font-inter font-medium text-[14px] tracking-[-0.56px] leading-[14px] ";

const User = () => {
  const { logout, smartWalletAddress } = useWeb3();

  const navigation = [
    {
      id: 0,
      title: "Founders Club",
      icon: "verification",
      href: "https://founder.hyxora.com/profile",
    },
    {
      id: 1,
      title: shortenAddress(smartWalletAddress),
      icon: "cube",
      onClick: () => copyToClipboard(smartWalletAddress || ""),
    },
    {
      id: 2,
      title: "Sign out",
      icon: "logout",
      onClick: () => logout(),
    },
  ];
  return (
    <>
      <Menu className="relative" as="div">
        <MenuButton className="inline-flex items-center font-inter justify-center size-[30px] border border-solid rounded-[100px] cursor-pointer outline-0 transition-all bg-white border-[rgba(25,54,63,0.2)] text-[#19363f] fill-[#19363f] shadow-[0px_0px_10px_0px_inset_rgba(25,54,63,0.4)] hover:shadow-[0px_0px_15px_0px_inset_rgba(25,54,63,0.5)]">
          <Icon name="profile" className="size-3!" />
        </MenuButton>
        <MenuItems
          className="z-30 w-50 p-2 rounded-[1.25rem] bg-surface-01 outline-none shadow-popover [--anchor-gap:0.75rem] [--anchor-offset:0.5rem] origin-top transition duration-200 ease-out after:absolute after:inset-0 after:rounded-[1.25rem] after:border after:border-[#E5E5E5] after:mask-b-from-0% after:pointer-events-none data-[closed]:scale-95 data-[closed]:opacity-0"
          anchor="bottom end"
          transition
          modal={false}
        >
          {navigation.map((item) => (
            <MenuItem key={item.id}>
              {item.href ? (
                <a
                  className={styleItem}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="fill-inherit size-5!" name={item.icon} />
                  {item.title}
                </a>
              ) : item.url ? (
                <Link className={styleItem} href={item.url}>
                  <Icon className="fill-inherit size-5!" name={item.icon} />
                  {item.title}
                </Link>
              ) : (
                <button className={styleItem} onClick={item.onClick}>
                  <Icon className="fill-inherit size-5!" name={item.icon} />
                  {item.title}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </>
  );
};

export default User;
