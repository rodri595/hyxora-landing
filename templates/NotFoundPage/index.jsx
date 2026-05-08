"use client";

import Link from "next/link";
import Layout from "@/components/Layout";

const NotFoundPage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col items-center justify-center gap-6 pt-[100px] pb-[80px] px-6"
    >
      <p className="font-inter text-[13px] font-semibold tracking-[0.1em] uppercase text-[rgba(25,54,63,0.45)]">
        404
      </p>
      <h1 className="font-inter text-[48px] font-semibold tracking-[-1.92px] text-[#19363f] text-center maxmd:text-[36px]">
        Page not found
      </h1>
      <p className="max-w-[420px] text-center font-inter text-[16px] leading-[1.6] tracking-[-0.48px] text-[rgba(25,54,63,0.65)]">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-[12px] bg-[#1b5ffd] px-6 py-3 font-inter text-[14px] font-semibold tracking-[-0.42px] text-white transition-all hover:bg-[#114fdf]"
      >
        Back to home
      </Link>
    </Layout>
  );
};

export default NotFoundPage;
