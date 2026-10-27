"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";

interface SiteNavbarProps {
  variant?: "public" | "private" | "admin";
  userName?: string;
}

export function SiteNavbar({ variant = "public", userName }: SiteNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const router = useRouter();
  const isSignedIn = variant !== "public";
  const links =
    variant === "admin"
      ? [
          { href: "/admin", label: "Espacios" },
          { href: "/dashboard", label: "Mis reservas" },
          { href: "/spaces", label: "Ver catálogo" },
        ]
      : isSignedIn
        ? [
            { href: "/spaces", label: "Explorar espacios" },
            { href: "/dashboard", label: "Mis reservas" },
          ]
        : [
            { href: "/spaces", label: "Espacios" },
            { href: "/#como-funciona", label: "Cómo funciona" },
          ];

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("No pudimos cerrar la sesión. Intenta de nuevo.");
      }
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      setLogoutError(error instanceof Error ? error.message : "No pudimos cerrar la sesión.");
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-background/95 backdrop-blur">
      <nav aria-label="Navegación principal" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="CoSpace, inicio">
          <span className="grid size-10 place-items-center rounded-xl bg-forest text-lg font-black text-white">C</span>
          <span className="text-xl font-black tracking-tight text-forest">CoSpace</span>
        </Link>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-line text-forest md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="text-xl" aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition hover:text-forest"
            >
              {link.label}
            </Link>
          ))}
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <span className="max-w-40 truncate text-sm font-semibold">{userName ?? "Mi cuenta"}</span>
              <Button variant="secondary" disabled={loggingOut} onClick={handleLogout}>
                {loggingOut ? "Saliendo..." : "Cerrar sesión"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-forest hover:text-forest-dark">Iniciar sesión</Link>
              <Link href="/register" className="inline-flex min-h-11 items-center rounded-xl bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest-dark">
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </nav>

      {logoutError ? (
        <p role="alert" className="border-t border-red-200 bg-red-50 px-5 py-3 text-center text-sm text-red-800">
          {logoutError}
        </p>
      ) : null}

      {menuOpen ? (
        <div className="border-t border-line bg-white px-5 py-4 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 font-medium text-foreground hover:bg-sage">
                {link.label}
              </Link>
            ))}
            {isSignedIn ? (
              <Button variant="secondary" disabled={loggingOut} onClick={handleLogout}>
                {loggingOut ? "Saliendo..." : "Cerrar sesión"}
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 font-semibold text-forest">Iniciar sesión</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-lg bg-forest px-3 py-3 text-center font-semibold text-white">Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
