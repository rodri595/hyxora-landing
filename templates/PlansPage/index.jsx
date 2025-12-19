"use client";

import Layout from "@/components/Layout";
import Plans from "../HomePage/Plans";

const PlansPage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-col gap-[130px] flex-1 maxmd:gap-[80px]"
    >
      <Plans />
    </Layout>
  );
};

export default PlansPage;
