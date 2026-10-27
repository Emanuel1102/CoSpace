import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/features/bookings/components/booking-form";
import { getSpace } from "@/features/spaces/server/spaces.service";
import { AppError } from "@/lib/errors";

interface SpaceDetailPageProps {
  params: Promise<{ id: string }>;
}

const typeLabels = {
  DESK: "Escritorio",
  MEETING_ROOM: "Sala de reuniones",
  BOOTH: "Cabina privada",
} as const;

function formatBogotaDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: "year" | "month" | "day") =>
    parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function addBogotaDays(date: string, days: number): string {
  const result = new Date(`${date}T12:00:00-05:00`);
  result.setUTCDate(result.getUTCDate() + days);
  return formatBogotaDate(result);
}

async function SpaceDetailContent({ params }: SpaceDetailPageProps) {
  const { id } = await params;
  let space;
  try {
    space = await getSpace(id, false);
  } catch (error: unknown) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const imageSrc = space.imageUrl || "/images/space-placeholder.svg";
  const now = new Date();
  const today = formatBogotaDate(now);
  const localHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now),
  );
  const startsTomorrow = localHour >= 20;
  const minDate = today;
  const initialDate = startsTomorrow ? addBogotaDays(today, 1) : today;
  const maxDate = addBogotaDays(today, 30);
  const earliestStartHour = startsTomorrow ? 21 : Math.min(Math.max(localHour + 1, 7), 20);
  const defaultStartHour = startsTomorrow ? 7 : earliestStartHour;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8 lg:py-14">
      <Link href="/spaces" className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:text-terra">
        <span aria-hidden="true">←</span> Volver a espacios
      </Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-sage">
            <Image
              src={imageSrc}
              alt={`Espacio ${space.name}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover"
              unoptimized={imageSrc.startsWith("http://") || imageSrc.startsWith("https://")}
            />
            <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-bold text-forest shadow">
              {typeLabels[space.type]}
            </span>
          </div>
          <div className="mt-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-terra">Conoce el espacio</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{space.name}</h1>
              </div>
              <span className="rounded-full bg-sage px-4 py-2 text-sm font-bold text-forest">Capacidad: {space.capacity}</span>
            </div>
            <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-muted">{space.description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Horario", value: "07:00 a 21:00" },
                { label: "Duración", value: "1 a 4 horas" },
                { label: "Tipo", value: typeLabels[space.type] },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-line bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">{item.label}</p>
                  <p className="mt-2 font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="lg:sticky lg:top-28">
          <BookingForm
            space={{ id: space.id, pricePerHour: space.pricePerHour }}
            minDate={minDate}
            initialDate={initialDate}
            maxDate={maxDate}
            earliestStartHour={earliestStartHour}
            defaultStartHour={defaultStartHour}
          />
        </aside>
      </div>
    </main>
  );
}

function SpaceDetailFallback() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8 lg:py-14">
      <div className="h-5 w-36 animate-pulse rounded bg-sage" />
      <div className="mt-7 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="aspect-[16/10] animate-pulse rounded-[2rem] bg-sage" />
        <div className="h-[540px] animate-pulse rounded-3xl bg-white" />
      </div>
    </main>
  );
}

export default function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  return (
    <Suspense fallback={<SpaceDetailFallback />}>
      <SpaceDetailContent params={params} />
    </Suspense>
  );
}
