"use client";
import Tabs from "@/components/Tabs";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export const ADMIN_TABS = [
  { id: "users", label: "Usuarios" },
  { id: "emails", label: "Emails" },
  { id: "polls", label: "Polls" },
  { id: "tutorials", label: "Tutoriales" },
  { id: "simulator", label: "Simulador" },
];

const AdminTabBarInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "users";
  const { data: simAccount } = useGetSimAccount();
  const isSimAdmin = simAccount?.user?.role === "admin";
  const tabs = isSimAdmin ? ADMIN_TABS : ADMIN_TABS.filter((t) => t.id !== "simulator");

  return (
    <Tabs
      tabs={tabs}
      value={activeTab}
      onChange={(id) => router.push(`/admin?tab=${id}`)}
      className="w-full"
    />
  );
};

const AdminTabBar = () => (
  <Suspense>
    <AdminTabBarInner />
  </Suspense>
);

export default AdminTabBar;
