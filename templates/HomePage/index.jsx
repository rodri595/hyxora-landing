"use client";

import Layout from "@/components/Layout";
import Hero from "./Hero";
const HomePage = () => {
  return (
    <Layout isFixedHeader classContainer="grow">
      <Hero />
    </Layout>
  );
};

export default HomePage;
