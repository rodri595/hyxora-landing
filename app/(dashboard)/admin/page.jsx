"use client";
import { ADMIN_TABS } from "@/components/AdminTabBar";
import Spinner from "@/components/Spinner";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { useIsAdmin } from "@/hooks/user/useIsAdmin";
import { useSearchParams } from "next/navigation";
import { Suspense, lazy } from "react";

const UsersModule = lazy(() => import("./_modules/UsersModule"));
const EmailsModule = lazy(() => import("./_modules/EmailsModule"));
const PollsModule = lazy(() => import("./_modules/PollsModule"));
const TutorialsModule = lazy(() => import("./_modules/TutorialsModule"));
const QuizModule = lazy(() => import("./_modules/QuizModule"));
const ComisionesModule = lazy(() => import("./_modules/ComisionesModule"));
const CerebroModule = lazy(() => import("./_modules/CerebroModule"));
const SimulatorModule = lazy(() => import("./_modules/SimulatorModule"));

const moduleMap = {
  users: UsersModule,
  emails: EmailsModule,
  polls: PollsModule,
  tutorials: TutorialsModule,
  quiz: QuizModule,
  comisiones: ComisionesModule,
  cerebro: CerebroModule,
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
    // p-2 on a phone: this is the outermost gutter, and every module inside adds
    // its own — the Cerebro shell, then each panel, then the table. Four nested
    // 16px gutters were eating a fifth of the viewport before a number was drawn.
    <section
      className="flex-1 flex gap-4 justify-start items-start p-2 sm:p-4 h-full min-h-0"
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

/**
 * Nothing under /admin mounts until the role is known.
 *
 * Every admin hook gates itself, but a gate per hook still means the whole tab
 * renders for a non-admin and fires its requests — which is exactly what a
 * signed-in visitor opening `?tab=cerebro` used to do: ~40 calls, every one
 * answered 401. The cheap fix is not reaching the module at all.
 *
 * `isResolving` is why this is not a plain `if (!isAdmin)`: the role arrives a
 * moment after Privy does, and a real admin must not see "sin permiso" flash in
 * between. No redirect — DashboardLayout already sends anyone unauthenticated
 * home, and this only separates admin from signed-in, so it says so.
 */
const AdminGate = () => {
  const { isAdmin, isResolving } = useIsAdmin();

  if (isResolving) {
    return (
      <section className="flex-1 flex justify-center items-center p-4 h-full min-h-0">
        <Spinner />
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="flex-1 flex justify-center items-center p-4 h-full min-h-0">
        <p className="font-inter text-[12px] text-[rgba(25,54,63,0.4)] tracking-[-0.48px]">
          Esta sección es solo para administradores.
        </p>
      </section>
    );
  }

  return <AdminContent />;
};

const AdminPage = () => (
  <Suspense>
    <AdminGate />
  </Suspense>
);

export default AdminPage;
