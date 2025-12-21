"use client";

import Layout from "@/components/Layout";
import Hero from "./Hero";
// import Whatis from "./Whatis";
import Info from "./Info";
import Why from "./Why";
import Finance from "./Finance";
// import Founders from "./Founders";
import Foundersv2 from "./Foundersv2";
import FAQ from "./FAQ";
import CTA from "./CTA";
import Roadmap from "./Roadmap";
import Plans from "./Plans";
const HomePage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-col gap-[130px] maxmd:gap-[80px]"
    >
      <Hero />
      <Info />
      <Why />
      <Finance />
      <Foundersv2 />
      <Roadmap />
      <Plans />
      <FAQ />
      <CTA />
      {/*
       */}
    </Layout>
  );
};

export default HomePage;
