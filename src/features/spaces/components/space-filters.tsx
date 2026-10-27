import { SpaceType } from "@/generated/prisma/client";

interface SpaceFiltersProps {
  selectedType?: SpaceType;
}

const options: Array<{ value: SpaceType | ""; label: string }> = [
  { value: "", label: "Todos los espacios" },
  { value: "DESK", label: "Escritorios" },
  { value: "MEETING_ROOM", label: "Salas de reuniones" },
  { value: "BOOTH", label: "Cabinas privadas" },
];

export function SpaceFilters({ selectedType }: SpaceFiltersProps) {
  return (
    <form action="/spaces" method="get" className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="space-type" className="sr-only">Filtrar por tipo de espacio</label>
      <select
        id="space-type"
        name="type"
        defaultValue={selectedType ?? ""}
        className="min-h-12 min-w-56 rounded-xl border border-line bg-white px-4 text-sm font-medium outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>{option.label}</option>
        ))}
      </select>
      <button type="submit" className="min-h-12 rounded-xl border border-line bg-white px-5 text-sm font-bold text-forest transition hover:bg-sage">
        Aplicar filtro
      </button>
    </form>
  );
}
