"use client";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import AdminTabBar from "@/components/AdminTabBar";

export default function Layout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <DashboardLayout headerExtra={isAdminPage ? <AdminTabBar /> : undefined}>
      {children}
    </DashboardLayout>
  );
}
