"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils";
import { Suspense } from "react";

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
    <div className="flex items-center gap-[2px]">
      {ADMIN_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => router.push(`/admin?tab=${tab.id}`)}
          className={cn(
            "font-inter font-medium text-[12px] tracking-[-0.48px] px-[10px] py-[5px] rounded-[8px] transition-colors duration-150 whitespace-nowrap",
            activeTab === tab.id
              ? "bg-[#19363F] text-white"
              : "text-[rgba(25,54,63,0.55)] hover:text-[#19363F] hover:bg-[rgba(25,54,63,0.05)]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const AdminTabBar = () => (
  <Suspense>
    <AdminTabBarInner />
  </Suspense>
);

export default AdminTabBar;
