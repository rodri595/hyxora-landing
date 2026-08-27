"use client";
import Tabs from "@/components/Tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export const ADMIN_TABS = [
  { id: "users", label: "Usuarios" },
  { id: "emails", label: "Emails" },
  { id: "polls", label: "Polls" },
  { id: "tutorials", label: "Tutoriales" },
  { id: "quiz", label: "Quiz" },
  { id: "comisiones", label: "Comisiones" },
  { id: "cerebro", label: "Cerebro" },
];

const AdminTabBarInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "users";

  return (
    <Tabs
      tabs={ADMIN_TABS}
      value={activeTab}
      onChange={(id) => router.push(`/admin?tab=${id}`)}
      className="w-full overflow-x-auto overscroll-x-contain"
      data-lenis-prevent
    />
  );
};

const AdminTabBar = () => (
  <Suspense>
    <AdminTabBarInner />
  </Suspense>
);

export default AdminTabBar;
