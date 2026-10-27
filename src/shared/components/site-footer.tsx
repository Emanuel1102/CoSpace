import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="font-bold text-forest">CoSpace</p>
          <p className="mt-1">Un buen espacio cambia tu forma de trabajar.</p>
        </div>
        <div className="flex flex-wrap gap-5">
          <Link href="/spaces" className="hover:text-forest">Explorar espacios</Link>
          <Link href="/login" className="hover:text-forest">Iniciar sesión</Link>
          <a href="mailto:hola@cospace.local" className="hover:text-forest">Contacto</a>
        </div>
        <p>© CoSpace</p>
      </div>
    </footer>
  );
}
