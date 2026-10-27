import type { Metadata } from "next";
import { DashboardBookings } from "@/features/bookings/components/dashboard-bookings";
import { LocalClock } from "@/shared/components/local-clock";

export const metadata: Metadata = { title: "Mis reservas" };

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-terra">Tu espacio personal</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Mis reservas</h1>
          <p className="mt-3 text-muted">Consulta tus próximas visitas y administra tus reservas.</p>
        </div>
        <p className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium capitalize text-muted">
          <LocalClock />
        </p>
      </div>
      <div className="mt-9"><DashboardBookings /></div>
    </main>
  );
}
