"use client";
import { ADMIN_TABS } from "@/components/AdminTabBar";
import Spinner from "@/components/Spinner";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { useSearchParams } from "next/navigation";
import { Suspense, lazy } from "react";

const UsersModule = lazy(() => import("./_modules/UsersModule"));
const EmailsModule = lazy(() => import("./_modules/EmailsModule"));
const PollsModule = lazy(() => import("./_modules/PollsModule"));
const TutorialsModule = lazy(() => import("./_modules/TutorialsModule"));
const SimulatorModule = lazy(() => import("./_modules/SimulatorModule"));

const moduleMap = {
  users: UsersModule,
  emails: EmailsModule,
  polls: PollsModule,
  tutorials: TutorialsModule,
  simulator: SimulatorModule,
};

const AdminContent = () => {
  const searchParams = useSearchParams();
  const { data: simAccount, isLoading: isLoadingSimAccount } = useGetSimAccount();
  const isSimAdmin = simAccount?.user?.role === "admin";
  const activeTab = searchParams.get("tab") ?? ADMIN_TABS[0].id;
  const activeTabData = ADMIN_TABS.find((t) => t.id === activeTab) ?? ADMIN_TABS[0];

  // The simulator module is only for simulator admins — direct ?tab=simulator
  // visits by anyone else fall back to the default module.
  const effectiveTab = activeTab === "simulator" && !isSimAdmin ? ADMIN_TABS[0].id : activeTab;
  const Module = moduleMap[effectiveTab];

  if (activeTab === "simulator" && isLoadingSimAccount) {
    return (
      <section
        className="flex-1 flex gap-4 justify-center items-center p-4 h-full min-h-0"
        data-lenis-prevent
      >
        <Spinner />
      </section>
    );
  }

  return (
    <section
      className="flex-1 flex gap-4 justify-start items-start p-4 h-full min-h-0"
      data-lenis-prevent
    >
      {Module ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center w-full h-full">
              <Spinner />
            </div>
          }
        >
          <Module />
        </Suspense>
      ) : (
        <div className="flex items-center justify-center w-full ">
          <p className="font-inter text-[12px] text-[rgba(25,54,63,0.4)] tracking-[-0.48px]">
            {activeTabData.label} — próximamente
          </p>
        </div>
      )}
    </section>
  );
};

const AdminPage = () => (
  <Suspense>
    <AdminContent />
  </Suspense>
);

export default AdminPage;
