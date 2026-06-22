"use client";

import Link from "next/link";
import Layout from "@/components/Layout";
import Button from "@/components/Button";

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
        Pagina no encontrada
      </h1>
      <p className="max-w-[420px] text-center font-inter text-[16px] leading-[1.6] tracking-[-0.48px] text-[rgba(25,54,63,0.65)]">
        La página que estás buscando no existe o ha sido movida.
      </p>
      <Link href="/">
        <Button isPrimary>Volver al inicio</Button>
      </Link>
    </Layout>
  );
};

export default NotFoundPage;
