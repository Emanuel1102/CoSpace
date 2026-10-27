import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/features/auth/server/guards";
import { findUserById } from "@/features/auth/server/auth.repository";
import { SiteNavbar } from "@/shared/components/site-navbar";

interface PrivateLayoutProps {
  children: ReactNode;
}

async function PrivateContent({ children }: PrivateLayoutProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=%2Fdashboard");
  }
  const user = await findUserById(session.sub);
  if (!user) {
    redirect("/login?next=%2Fdashboard");
  }

  return (
    <>
      <SiteNavbar variant={session.role === "ADMIN" ? "admin" : "private"} userName={user.name} />
      {children}
    </>
  );
}

function PrivateFallback() {
  return (
    <div className="min-h-screen">
      <div className="h-[73px] border-b border-line bg-white" />
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-sage" />
        <div className="mt-8 h-48 animate-pulse rounded-3xl bg-white" />
      </div>
    </div>
  );
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <Suspense fallback={<PrivateFallback />}>
      <PrivateContent>{children}</PrivateContent>
    </Suspense>
  );
}
