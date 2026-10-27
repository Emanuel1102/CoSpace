import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";
import { safeRedirectPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Iniciar sesión" };

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.next ?? null, "/dashboard");

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-terra">Qué bueno verte</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Inicia sesión</h1>
      <p className="mb-7 mt-2 text-sm leading-6 text-muted">Entra a tu cuenta para gestionar tus reservas y encontrar tu próximo espacio.</p>
      <AuthForm mode="login" redirectTo={redirectTo} />
    </>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<AuthForm mode="login" redirectTo="/dashboard" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
