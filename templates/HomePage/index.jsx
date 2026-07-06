"use client";

import { useEffect } from "react";
import { consumePendingScroll } from "@/hooks/useSectionScroll";
import Layout from "@/components/Layout";
import Hero from "./Hero";
import MapSection from "./Map";
// import Whatis from "./Whatis";
import Info from "./Info";
import Why from "./Why";
import Finance from "./Finance";
import Foundersv2 from "./Foundersv2";
import FAQ from "./FAQ";
import Roadmap from "./Roadmap";
import Plans from "./Plans";
import CTA from "./CTA";
const HomePage = () => {
  useEffect(() => consumePendingScroll(), []);

  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-col gap-[130px] maxmd:gap-[80px]"
    >
      <Hero />
      <MapSection />
      {/* <Whatis /> */}
      <Info />
      <Why />
      <Finance />
      <Foundersv2 />
      <Roadmap />
      <Plans />
      <FAQ />
      <CTA />
    </Layout>
  );
};

export default HomePage;
