"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/button";
import { TextField } from "@/shared/components/field";
import { Notice } from "@/shared/components/notice";

interface AuthFormProps {
  mode: "login" | "register";
  redirectTo: string;
}

interface AuthResponse {
  error?: { message?: string };
}

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      ...(isRegister ? { name: String(formData.get("name") ?? "").trim() } : {}),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json()) as AuthResponse;
        throw new Error(body.error?.message ?? "No se pudo completar la solicitud.");
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {error ? <Notice variant="error">{error}</Notice> : null}
      {isRegister ? <TextField name="name" label="Nombre completo" autoComplete="name" required minLength={2} maxLength={80} /> : null}
      <TextField name="email" label="Correo electrónico" type="email" autoComplete="email" required maxLength={120} />
      <TextField
        name="password"
        label="Contraseña"
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        required
        minLength={isRegister ? 8 : 1}
        maxLength={72}
        hint={isRegister ? "Usa al menos 8 caracteres." : undefined}
      />
      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? "Un momento..." : isRegister ? "Crear mi cuenta" : "Iniciar sesión"}
      </Button>
      <p className="text-center text-sm text-muted">
        {isRegister ? "¿Ya tienes una cuenta?" : "¿Primera vez en CoSpace?"}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="font-bold text-forest hover:underline">
          {isRegister ? "Inicia sesión" : "Crea tu cuenta"}
        </Link>
      </p>
    </form>
  );
}
