"use client";
import AdminTabBar from "@/components/AdminTabBar";
import DashboardLayout from "@/components/DashboardLayout";
import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  const headerExtra = isAdminPage ? <AdminTabBar /> : undefined;

  return <DashboardLayout headerExtra={headerExtra}>{children}</DashboardLayout>;
}
