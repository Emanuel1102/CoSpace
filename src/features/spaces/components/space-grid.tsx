import type { Space } from "@/generated/prisma/client";
import { SpaceCard } from "./space-card";

interface SpaceGridProps {
  spaces: Space[];
}

export function SpaceGrid({ spaces }: SpaceGridProps) {
  if (spaces.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white px-6 py-16 text-center">
        <span className="text-4xl" aria-hidden="true">⌂</span>
        <h2 className="mt-4 text-xl font-bold">Todavía no hay espacios en esta categoría</h2>
        <p className="mt-2 text-sm text-muted">Prueba con otra opción o vuelve a ver todos los espacios.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {spaces.map((space) => <SpaceCard key={space.id} space={space} />)}
    </div>
  );
}
