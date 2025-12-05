"use client";

import Layout from "@/components/Layout";
import Hero from "./Hero";
import Whatis from "./Whatis";
import Info from "./Info";
import Why from "./Why";
import FAQ from "./FAQ";
import CTA from "./CTA";
const HomePage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-col gap-[130px] maxmd:gap-[80px]"
    >
      <Hero />
      <Whatis />
      <Info />
      <Why />
      <FAQ />
      <CTA />
      {/*
       */}
    </Layout>
  );
};

export default HomePage;
