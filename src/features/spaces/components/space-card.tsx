import Image from "next/image";
import Link from "next/link";
import type { Space } from "@/generated/prisma/client";

const typeLabels: Record<Space["type"], string> = {
  DESK: "Escritorio",
  MEETING_ROOM: "Sala de reuniones",
  BOOTH: "Cabina privada",
};

interface SpaceCardProps {
  space: Space;
}

export function SpaceCard({ space }: SpaceCardProps) {
  const imageSrc = space.imageUrl || "/images/space-placeholder.svg";

  return (
    <article className="group overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/spaces/${space.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-sage">
          <Image
            src={imageSrc}
            alt={`Espacio ${space.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized={imageSrc.startsWith("http://") || imageSrc.startsWith("https://")}
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-forest shadow-sm">
            {typeLabels[space.type]}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground group-hover:text-forest">{space.name}</h2>
            <span className="shrink-0 rounded-full bg-sage px-3 py-1 text-xs font-semibold text-forest">
              Hasta {space.capacity}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-muted">{space.description}</p>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <p className="text-sm text-muted">
              <span className="text-lg font-extrabold text-forest">
                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(space.pricePerHour)}
              </span>{" "}
              / hora
            </p>
            <span className="text-sm font-bold text-terra">Ver espacio <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </Link>
    </article>
  );
}
