"use client";

import { useEffect, useState } from "react";

export function LocalClock() {
  const [localDate, setLocalDate] = useState<string | null>(null);

  useEffect(() => {
    const updateDate = () => {
      setLocalDate(
        new Intl.DateTimeFormat("es-CO", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    };

    updateDate();
    const intervalId = window.setInterval(updateDate, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return <span suppressHydrationWarning>{localDate ?? "Hora local"}</span>;
}
