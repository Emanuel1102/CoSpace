"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/button";
import { Notice } from "@/shared/components/notice";

type BookingStatus = "CONFIRMED" | "CANCELLED";

interface BookingListItem {
  id: string;
  startsAt: string;
  endsAt: string;
  totalPrice: number;
  status: BookingStatus;
  space: {
    id: string;
    name: string;
    type: "DESK" | "MEETING_ROOM" | "BOOTH";
    imageUrl: string | null;
  };
}

interface BookingListResponse {
  data?: { bookings?: BookingListItem[] };
  error?: { message?: string };
}

async function requestBookings(): Promise<BookingListItem[]> {
  const response = await fetch("/api/bookings", { cache: "no-store" });
  const body = (await response.json()) as BookingListResponse;
  if (!response.ok) {
    throw new Error(body.error?.message ?? "No se pudieron cargar tus reservas.");
  }
  return body.data?.bookings ?? [];
}

const typeLabels = {
  DESK: "Escritorio",
  MEETING_ROOM: "Sala de reuniones",
  BOOTH: "Cabina privada",
};

function formatBookingDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardBookings() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function loadBookings(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      setBookings(await requestBookings());
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void requestBookings()
      .then((items) => {
        if (active) {
          setBookings(items);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Ocurrió un error inesperado.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function cancelBooking(booking: BookingListItem): Promise<void> {
    if (!window.confirm(`¿Quieres cancelar la reserva de ${booking.space.name}?`)) {
      return;
    }

    setCancellingId(booking.id);
    setError("");
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
      const body = (await response.json()) as BookingListResponse;
      if (!response.ok) {
        throw new Error(body.error?.message ?? "No se pudo cancelar la reserva.");
      }
      await loadBookings();
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Ocurrió un error inesperado.");
    } finally {
      setCancellingId(null);
    }
  }

  const confirmedCount = bookings.filter((booking) => booking.status === "CONFIRMED").length;

  return (
    <section aria-labelledby="bookings-heading">
      {error ? <div className="mb-5"><Notice variant="error">{error}</Notice></div> : null}
      {loading ? (
        <div className="grid gap-4" aria-label="Cargando reservas">
          {[1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-3xl bg-white" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <span className="text-4xl" aria-hidden="true">⌂</span>
          <h2 id="bookings-heading" className="mt-4 text-2xl font-black">Aún no tienes reservas</h2>
          <p className="mt-2 text-muted">Explora nuestros espacios y encuentra el lugar ideal para tu próximo día productivo.</p>
          <Link href="/spaces" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-forest px-6 font-bold text-white hover:bg-forest-dark">Explorar espacios</Link>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              <strong className="text-foreground">{confirmedCount}</strong> {confirmedCount === 1 ? "reserva confirmada" : "reservas confirmadas"}
            </p>
            <Button variant="secondary" onClick={() => void loadBookings()} disabled={loading}>Actualizar</Button>
          </div>
          <div className="grid gap-4">
            {bookings.map((booking) => {
              return (
                <article key={booking.id} className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-900" : "bg-stone-100 text-stone-600"}`}>
                          {booking.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}
                        </span>
                        <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-forest">{typeLabels[booking.space.type]}</span>
                      </div>
                      <h2 className="mt-3 truncate text-xl font-black">{booking.space.name}</h2>
                      <p className="mt-2 text-sm capitalize text-muted">{formatBookingDate(booking.startsAt)}</p>
                      <p className="mt-1 text-sm text-muted">{formatTime(booking.startsAt)} — {formatTime(booking.endsAt)} · hora de Bogotá</p>
                    </div>
                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-line pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Total</p>
                        <p className="mt-1 text-xl font-extrabold text-forest">{formatCurrency(booking.totalPrice)}</p>
                      </div>
                      {booking.status === "CONFIRMED" ? (
                        <Button variant="secondary" disabled={cancellingId === booking.id} onClick={() => void cancelBooking(booking)}>
                          {cancellingId === booking.id ? "Cancelando..." : "Cancelar reserva"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
