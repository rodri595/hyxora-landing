"use client";

import Layout from "@/components/Layout";
import Hero from "./Hero";
// import Whatis from "./Whatis";
import Info from "./Info";
import Why from "./Why";
import Finance from "./Finance";
import Foundersv2 from "./Foundersv2";
import FAQ from "./FAQ";
import Roadmap from "./Roadmap";
import Plans from "./Plans";
import CTA from "./CTA";
import Simulation from "./Simulation";
const HomePage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-col gap-[130px] maxmd:gap-[80px]"
    >
      <Hero />
      {/* <Whatis /> */}
      <Info />
      <Why />
      <Finance />
      <Foundersv2 />
      <Roadmap />
      <Plans />
      <FAQ />
      <Simulation />
      <CTA />
      {/*
       */}
    </Layout>
  );
};

export default HomePage;
