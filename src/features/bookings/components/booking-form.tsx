"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Space } from "@/generated/prisma/client";
import { Button } from "@/shared/components/button";
import { Notice } from "@/shared/components/notice";

interface BookingFormProps {
  space: Pick<Space, "id" | "pricePerHour">;
  minDate: string;
  initialDate: string;
  maxDate: string;
  earliestStartHour: number;
  defaultStartHour: number;
}

interface ApiErrorResponse {
  error?: { message?: string };
}

function getStartingHours(date: string, minDate: string, earliestStartHour: number, duration: number): number[] {
  const latestStartHour = 21 - duration;
  const firstStartHour = date === minDate ? earliestStartHour : 7;
  return Array.from({ length: Math.max(0, latestStartHour - 7 + 1) }, (_, index) => index + 7)
    .filter((hour) => hour >= firstStartHour);
}

export function BookingForm({
  space,
  minDate,
  initialDate,
  maxDate,
  earliestStartHour,
  defaultStartHour,
}: BookingFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [startHour, setStartHour] = useState(String(defaultStartHour).padStart(2, "0"));
  const [duration, setDuration] = useState("1");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableStartHours = getStartingHours(date, minDate, earliestStartHour, Number(duration));

  const total = space.pricePerHour * Number(duration);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const start = `${date}T${startHour}:00:00-05:00`;
      const endHour = Number(startHour) + Number(duration);
      const end = `${date}T${String(endHour).padStart(2, "0")}:00:00-05:00`;
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: space.id,
          startsAt: new Date(start).toISOString(),
          endsAt: new Date(end).toISOString(),
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiErrorResponse;
        if (response.status === 401) {
          router.push(`/login?next=${encodeURIComponent(`/spaces/${space.id}`)}`);
          return;
        }
        throw new Error(body.error?.message ?? "No se pudo crear la reserva.");
      }

      router.push("/dashboard?reserva=creada");
      router.refresh();
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-3xl border border-line bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terra">Reserva tu espacio</p>
        <h2 className="mt-2 text-2xl font-extrabold">Elige tu horario</h2>
        <p className="mt-2 text-sm text-muted">Horarios completos entre 07:00 y 21:00 · hora de Bogotá</p>
      </div>

      {error ? <Notice variant="error">{error}</Notice> : null}

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Fecha
          <input
            type="date"
            required
            min={minDate}
            max={maxDate}
            value={date}
            onChange={(event) => {
              const nextDate = event.target.value;
              setDate(nextDate);
              const nextHours = getStartingHours(nextDate, minDate, earliestStartHour, Number(duration));
              if (!nextHours.includes(Number(startHour))) {
                setStartHour(nextHours.length ? String(nextHours[0]).padStart(2, "0") : "");
              }
            }}
            className="min-h-12 rounded-xl border border-line px-4 outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm font-semibold">
            Inicio
            <select
              value={startHour}
              required
              onChange={(event) => setStartHour(event.target.value)}
              className="min-h-12 rounded-xl border border-line bg-white px-3 outline-none focus:border-forest"
            >
              {availableStartHours.length === 0 ? <option value="">Sin horarios para esta fecha</option> : null}
              {availableStartHours.map((hour) => (
                <option key={hour} value={String(hour).padStart(2, "0")}>{String(hour).padStart(2, "0")}:00</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Duración
            <select
              value={duration}
              onChange={(event) => {
                const nextDuration = Number(event.target.value);
                setDuration(event.target.value);
                const nextHours = getStartingHours(date, minDate, earliestStartHour, nextDuration);
                if (!nextHours.includes(Number(startHour))) {
                  setStartHour(nextHours.length ? String(nextHours[0]).padStart(2, "0") : "");
                }
              }}
              className="min-h-12 rounded-xl border border-line bg-white px-3 outline-none focus:border-forest"
            >
              {[1, 2, 3, 4].map((hours) => <option key={hours} value={hours}>{hours} {hours === 1 ? "hora" : "horas"}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-muted">Total estimado</span>
        <strong className="text-xl text-forest">
          {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(total)}
        </strong>
      </div>
      <p className="text-xs leading-5 text-muted">El precio final se calcula y valida de nuevo en el servidor.</p>
      <Button type="submit" fullWidth disabled={submitting || !date || !startHour}>
        {submitting ? "Confirmando..." : "Confirmar reserva"}
      </Button>
      <p className="text-center text-xs text-muted">
        ¿Aún no tienes cuenta? <Link href="/register" className="font-bold text-forest hover:underline">Regístrate</Link>
      </p>
    </form>
  );
}
