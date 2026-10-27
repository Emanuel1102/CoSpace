import { Suspense } from "react";
import { listSpacesQuerySchema } from "@/features/spaces/schemas";
import { listSpaces } from "@/features/spaces/server/spaces.service";
import { SpaceFilters } from "@/features/spaces/components/space-filters";
import { SpaceGrid } from "@/features/spaces/components/space-grid";
import { Notice } from "@/shared/components/notice";

interface SpacesPageProps {
  searchParams: Promise<{ type?: string }>;
}

async function SpacesContent({ searchParams }: SpacesPageProps) {
  const params = await searchParams;
  const parsedFilters = listSpacesQuerySchema.safeParse({ type: params.type });
  const spaces = await listSpaces(
    parsedFilters.success ? parsedFilters.data : { includeInactive: false },
  );

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-terra">Espacios CoSpace</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Encuentra tu próximo lugar de trabajo</h1>
          <p className="mt-4 text-lg leading-8 text-muted">Elige el espacio que se adapta a tu día, a tu equipo y a tus ideas.</p>
        </div>
        <SpaceFilters selectedType={parsedFilters.success ? parsedFilters.data.type : undefined} />
      </div>
      {!parsedFilters.success ? (
        <div className="mt-6"><Notice variant="info">El filtro solicitado no es válido. Mostramos todos los espacios activos.</Notice></div>
      ) : null}
      <div className="mt-10 flex items-center justify-between border-b border-line pb-4">
        <p className="text-sm text-muted"><strong className="text-foreground">{spaces.length}</strong> {spaces.length === 1 ? "espacio disponible" : "espacios disponibles"}</p>
        <p className="hidden text-sm text-muted sm:block">Actualizado desde el catálogo de CoSpace</p>
      </div>
      <div className="mt-7"><SpaceGrid spaces={spaces} /></div>
    </main>
  );
}

function SpacesFallback() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
      <div className="h-10 w-2/3 animate-pulse rounded-xl bg-sage" />
      <div className="mt-8 h-12 w-64 animate-pulse rounded-xl bg-white" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl bg-white" />)}
      </div>
    </main>
  );
}

export default function SpacesPage({ searchParams }: SpacesPageProps) {
  return (
    <Suspense fallback={<SpacesFallback />}>
      <SpacesContent searchParams={searchParams} />
    </Suspense>
  );
}
