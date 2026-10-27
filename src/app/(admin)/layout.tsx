import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { findUserById } from "@/features/auth/server/auth.repository";
import { getSession } from "@/features/auth/server/guards";
import { SiteNavbar } from "@/shared/components/site-navbar";

interface AdminLayoutProps {
  children: ReactNode;
}

async function AdminContent({ children }: AdminLayoutProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=%2Fadmin");
  }
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }
  const user = await findUserById(session.sub);
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f1f0e9]">
      <SiteNavbar variant="admin" userName={user.name} />
      {children}
    </div>
  );
}

function AdminFallback() {
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

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminContent>{children}</AdminContent>
    </Suspense>
  );
}
