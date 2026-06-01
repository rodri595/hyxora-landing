"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Tabs from "@/components/Tabs";

export const ADMIN_TABS = [
  { id: "users", label: "Usuarios" },
  { id: "payments", label: "Pagos" },
  { id: "emails", label: "Emails" },
  { id: "polls", label: "Polls" },
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
