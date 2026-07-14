"use client";
import AdminTabBar from "@/components/AdminTabBar";
import DashboardLayout from "@/components/DashboardLayout";
import SimulatorTabBar from "@/components/SimulatorTabBar";
import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const isSimulatorPage = pathname.startsWith("/investment-simulator");

  let headerExtra;
  if (isAdminPage) headerExtra = <AdminTabBar />;
  else if (isSimulatorPage) headerExtra = <SimulatorTabBar />;

  return <DashboardLayout headerExtra={headerExtra}>{children}</DashboardLayout>;
}
