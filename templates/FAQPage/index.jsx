"use client";

import Layout from "@/components/Layout";
import FAQ from "../HomePage/FAQ";

const FAQPage = () => {
  return (
    <Layout
      isFixedHeader
      classContainer="flex flex-1 flex-col gap-[130px] maxmd:gap-[80px] pt-[100px]"
    >
      <FAQ showFullList={true} />
    </Layout>
  );
};

export default FAQPage;
