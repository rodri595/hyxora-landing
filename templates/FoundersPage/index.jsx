"use client";

import Layout from "@/components/Layout";
import { Hero, Key, WhatIs, Founder, Timeline, Access } from "./sections";

const FoundersPage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-col gap-[130px] flex-1 maxmd:gap-[80px]"
    >
      <Hero />
      <Key />
      <WhatIs />
      <Founder />
      <Timeline />
      <Access />
    </Layout>
  );
};

export default FoundersPage;
