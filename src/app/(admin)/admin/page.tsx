import type { Metadata } from "next";
import { Suspense } from "react";
import { listSpaces } from "@/features/spaces/server/spaces.service";
import { AdminSpaceManager } from "@/features/admin/components/admin-space-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Administración" };

async function AdminSpaces() {
  const spaces = await listSpaces({ includeInactive: true });
  return <AdminSpaceManager spaces={spaces} />;
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="mb-9">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-terra">Panel de administración</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Espacios CoSpace</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">Crea, actualiza y administra el catálogo de espacios disponibles para la comunidad.</p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-3xl border border-line bg-white p-8 text-muted" role="status">
            Cargando espacios...
          </div>
        }
      >
        <AdminSpaces />
      </Suspense>
    </main>
  );
}
