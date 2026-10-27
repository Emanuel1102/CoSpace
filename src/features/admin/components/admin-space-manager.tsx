"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Space } from "@/generated/prisma/client";
import { Button } from "@/shared/components/button";
import { SelectField, TextField, TextareaField } from "@/shared/components/field";
import { Notice } from "@/shared/components/notice";

interface AdminSpaceManagerProps {
  spaces: Space[];
}

interface SpaceApiResponse {
  error?: { message?: string };
}

interface SpaceFormProps {
  space?: Space;
  onCancel: () => void;
  onSaved: () => void;
}

function SpaceForm({ space, onCancel, onSaved }: SpaceFormProps) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      type: String(formData.get("type") ?? "DESK"),
      description: String(formData.get("description") ?? "").trim(),
      capacity: Number(formData.get("capacity")),
      pricePerHour: Number(formData.get("pricePerHour")),
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    };

    try {
      const response = await fetch(space ? `/api/spaces/${space.id}` : "/api/spaces", {
        method: space ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json()) as SpaceApiResponse;
        throw new Error(body.error?.message ?? "No se pudo guardar el espacio.");
      }
      onSaved();
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-terra">{space ? "Editar" : "Nuevo espacio"}</p>
        <h2 className="mt-2 text-2xl font-black">{space ? space.name : "Añadir al catálogo"}</h2>
      </div>
      {error ? <Notice variant="error">{error}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Nombre" required minLength={2} maxLength={100} defaultValue={space?.name ?? ""} />
        <SelectField name="type" label="Tipo" defaultValue={space?.type ?? "DESK"}>
          <option value="DESK">Escritorio</option>
          <option value="MEETING_ROOM">Sala de reuniones</option>
          <option value="BOOTH">Cabina privada</option>
        </SelectField>
        <TextField name="capacity" label="Capacidad" type="number" required min={1} max={100} defaultValue={space?.capacity ?? 1} />
        <TextField name="pricePerHour" label="Precio por hora (COP)" type="number" required min={1} max={1000000} defaultValue={space?.pricePerHour ?? ""} />
      </div>
      <TextareaField name="description" label="Descripción" required minLength={10} maxLength={1000} defaultValue={space?.description ?? ""} />
      <TextField name="imageUrl" label="URL de imagen (opcional)" type="text" defaultValue={space?.imageUrl ?? ""} placeholder="https://... o /images/mi-espacio.jpg" hint="Puedes dejarlo vacío para usar la imagen predeterminada." />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : space ? "Guardar cambios" : "Crear espacio"}</Button>
      </div>
    </form>
  );
}

export function AdminSpaceManager({ spaces }: AdminSpaceManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<Space | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  function onSaved(): void {
    setEditing(null);
    setCreating(false);
    setSuccess("El espacio se guardó correctamente.");
    router.refresh();
  }

  async function deactivate(space: Space): Promise<void> {
    if (!window.confirm(`¿Desactivar "${space.name}"? Dejará de aparecer en el catálogo público.`)) {
      return;
    }
    setError("");
    setSuccess("");
    setDeactivatingId(space.id);
    try {
      const response = await fetch(`/api/spaces/${space.id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json()) as SpaceApiResponse;
        throw new Error(body.error?.message ?? "No se pudo desactivar el espacio.");
      }
      setSuccess("El espacio se desactivó correctamente.");
      router.refresh();
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Ocurrió un error inesperado.");
    } finally {
      setDeactivatingId(null);
    }
  }

  return (
    <div className="grid gap-8">
      {error ? <Notice variant="error">{error}</Notice> : null}
      {success ? <Notice variant="success">{success}</Notice> : null}

      {creating || editing ? (
        <SpaceForm
          key={editing?.id ?? "new-space"}
          space={editing ?? undefined}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSaved={onSaved}
        />
      ) : (
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-forest p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-100">Catálogo</p>
            <h2 className="mt-2 text-2xl font-black">Gestiona tus espacios</h2>
            <p className="mt-1 text-sm text-emerald-50/80">Los espacios se desactivan, no se eliminan.</p>
          </div>
          <Button variant="secondary" onClick={() => { setCreating(true); setSuccess(""); }}>
            + Crear espacio
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {spaces.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center text-muted">Aún no hay espacios. Crea el primero para publicarlo en el catálogo.</div>
        ) : spaces.map((space) => (
          <article key={space.id} className="flex flex-col justify-between gap-5 rounded-3xl border border-line bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-extrabold">{space.name}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${space.isActive ? "bg-emerald-100 text-emerald-900" : "bg-stone-100 text-stone-600"}`}>
                  {space.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{space.description}</p>
              <p className="mt-2 text-sm font-semibold text-forest">
                {space.capacity} puestos · {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(space.pricePerHour)} / hora
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" onClick={() => { setCreating(false); setEditing(space); setSuccess(""); }}>Editar</Button>
              {space.isActive ? (
                <Button variant="danger" disabled={deactivatingId === space.id} onClick={() => void deactivate(space)}>
                  {deactivatingId === space.id ? "Desactivando..." : "Desactivar"}
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
