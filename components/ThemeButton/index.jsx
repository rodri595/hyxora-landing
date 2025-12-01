"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Icon from "../Icon";

const ThemeButton = ({ className, isHorizontal }) => {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  return (
    <div
      className={`group relative flex gap-1 p-1.5 bg-b-surface2 rounded-3xl cursor-pointer transition-shadow dark:after:absolute dark:after:inset-0 dark:after:rounded-full dark:after:border-[1.5px] dark:after:border-[#FDFDFD]/7 dark:after:opacity-0 dark:after:transition-opacity dark:hover:after:opacity-100 dark:after:mask-linear-170 dark:after:mask-linear-from-1% dark:after:mask-linear-to-100% ${
        isHorizontal
          ? "flex-row shadow-[inset_0_0_0_1.5px_var(--color-stroke2)] max-md:flex!"
          : "flex-col"
      } ${!isHorizontal ? "hover:shadow-hover" : ""} ${
        pathname === "/" ? "max-md:flex" : "max-md:hidden"
      } ${className || ""}`}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {["dark", "light"].map((theme) => (
        <button
          className="flex items-center justify-center size-9 rounded-[1.125rem] fill-t-secondary group-hover:fill-t-primary! transition-colors last:bg-b-surface1 last:fill-t-primary dark:first:bg-b-surface1 dark:first:fill-t-primary dark:last:bg-transparent dark:last:fill-t-secondary dark:group-hover:fill-t-primary"
          key={theme}
        >
          <Icon
            className="size-4! fill-inherit"
            name={theme === "dark" ? "moon" : "sun"}
          />
        </button>
      ))}
    </div>
  );
};

export default ThemeButton;
