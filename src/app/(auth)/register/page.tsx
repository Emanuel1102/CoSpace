import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";
import { safeRedirectPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Crear cuenta" };

interface RegisterPageProps {
  searchParams: Promise<{ next?: string }>;
}

async function RegisterContent({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.next ?? null, "/dashboard");

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-terra">Empieza a trabajar mejor</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Crea tu cuenta</h1>
      <p className="mb-7 mt-2 text-sm leading-6 text-muted">Reserva espacios de trabajo cuando y donde los necesites.</p>
      <AuthForm mode="register" redirectTo={redirectTo} />
    </>
  );
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <Suspense fallback={<AuthForm mode="register" redirectTo="/dashboard" />}>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  );
}
