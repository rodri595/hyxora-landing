"use client";
import { ADMIN_TABS } from "@/components/AdminTabBar";
import Spinner from "@/components/Spinner";
import { useSearchParams } from "next/navigation";
import { Suspense, lazy } from "react";

const UsersModule = lazy(() => import("./_modules/UsersModule"));
const EmailsModule = lazy(() => import("./_modules/EmailsModule"));
const PollsModule = lazy(() => import("./_modules/PollsModule"));
const TutorialsModule = lazy(() => import("./_modules/TutorialsModule"));
const QuizModule = lazy(() => import("./_modules/QuizModule"));
const ComisionesModule = lazy(() => import("./_modules/ComisionesModule"));
const CerebroModule = lazy(() => import("./_modules/CerebroModule"));

const moduleMap = {
  users: UsersModule,
  emails: EmailsModule,
  polls: PollsModule,
  tutorials: TutorialsModule,
  quiz: QuizModule,
  comisiones: ComisionesModule,
  cerebro: CerebroModule,
};

const AdminContent = () => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? ADMIN_TABS[0].id;
  const activeTabData = ADMIN_TABS.find((t) => t.id === activeTab) ?? ADMIN_TABS[0];

  const Module = moduleMap[activeTab];

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

const AdminPage = () => (
  <Suspense>
    <AdminContent />
  </Suspense>
);

export default AdminPage;
