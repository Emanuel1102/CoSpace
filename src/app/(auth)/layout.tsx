import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#eeeae0] px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-7 flex w-fit items-center gap-2">
          <span className="grid size-11 place-items-center rounded-xl bg-forest text-lg font-black text-white">C</span>
          <span className="text-xl font-black text-forest">CoSpace</span>
        </Link>
        <div className="rounded-[2rem] border border-white bg-white p-7 shadow-xl shadow-forest/5 sm:p-9">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-muted">Un espacio pensado para que tus ideas crezcan.</p>
      </div>
    </main>
  );
}
