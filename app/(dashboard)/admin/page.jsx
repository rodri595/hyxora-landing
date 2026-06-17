"use client";
import { ADMIN_TABS } from "@/components/AdminTabBar";
import Spinner from "@/components/Spinner";
import { useSearchParams } from "next/navigation";
import { Suspense, lazy } from "react";

const UsersModule = lazy(() => import("./_modules/UsersModule"));
const EmailsModule = lazy(() => import("./_modules/EmailsModule"));
const PollsModule = lazy(() => import("./_modules/PollsModule"));
const TutorialsModule = lazy(() => import("./_modules/TutorialsModule"));

const moduleMap = {
  users: UsersModule,
  emails: EmailsModule,
  polls: PollsModule,
  tutorials: TutorialsModule,
};

const AdminContent = () => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? ADMIN_TABS[0].id;
  const activeTabData =
    ADMIN_TABS.find((t) => t.id === activeTab) ?? ADMIN_TABS[0];

  const Module = moduleMap[activeTab];

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
