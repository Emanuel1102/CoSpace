import Link from "next/link";

export default function SpaceNotFound() {
  return (
    <main className="grid flex-1 place-items-center px-5 py-24 text-center">
      <div className="max-w-lg">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-terra">No encontramos este espacio</p>
        <h1 className="mt-3 text-4xl font-black">Parece que ya no está disponible</h1>
        <p className="mt-4 leading-7 text-muted">Puede que el espacio haya sido desactivado o que el enlace no sea correcto.</p>
        <Link href="/spaces" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-forest px-6 font-bold text-white hover:bg-forest-dark">Volver al catálogo</Link>
      </div>
    </main>
  );
}
