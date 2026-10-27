import Image from "next/image";
import Link from "next/link";

const highlights = [
  { number: "01", title: "Encuentra tu lugar", text: "Espacios pensados para concentrarte, colaborar o reunirte." },
  { number: "02", title: "Elige tu horario", text: "Reserva por horas completas, de forma simple y flexible." },
  { number: "03", title: "Llega y crea", text: "Tu próximo gran día de trabajo empieza aquí." },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-forest text-white">
        <div className="absolute inset-0 -z-10 opacity-20">
          <Image src="/images/space-placeholder.svg" alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest via-forest/95 to-forest/45" />
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50">
              <span className="size-2 rounded-full bg-lime-300" /> Tu espacio, a tu manera
            </p>
            <h1 className="mt-7 text-5xl font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
              Trabaja mejor. <span className="text-lime-200">Donde mejor te sientas.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/85">
              Escritorios, salas de reuniones y cabinas privadas listos para impulsar tus ideas. Reserva solo el tiempo que necesitas.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/spaces" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-terra px-7 font-bold text-white transition hover:bg-[#b85e40]">
                Explorar espacios <span className="ml-3" aria-hidden="true">→</span>
              </Link>
              <Link href="#como-funciona" className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/35 px-7 font-bold text-white transition hover:bg-white/10">
                Conoce cómo funciona
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-50/80">
              <span>✓ Reserva por horas</span>
              <span>✓ Confirmación inmediata</span>
              <span>✓ Espacios para cada idea</span>
            </div>
          </div>
          <div className="relative hidden min-h-[410px] lg:block">
            <div className="absolute inset-4 rotate-3 overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl">
              <Image src="/images/space-placeholder.svg" alt="Ambiente cálido de coworking CoSpace" fill priority sizes="(max-width: 1280px) 45vw, 560px" className="object-cover" />
            </div>
            <div className="absolute bottom-1 left-0 rounded-2xl bg-white p-5 text-foreground shadow-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-terra">Un buen comienzo</p>
              <p className="mt-1 text-lg font-extrabold">Tu próxima idea merece espacio.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-terra">Encuentra tu ritmo</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Un lugar para cada forma de trabajar</h2>
          </div>
          <Link href="/spaces" className="font-bold text-forest hover:text-terra">Ver todos los espacios <span aria-hidden="true">→</span></Link>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {[
            { icon: "⌘", title: "Escritorios", text: "Tu estación personal para concentrarte y avanzar." },
            { icon: "▦", title: "Salas de reuniones", text: "Conversaciones productivas en un espacio privado." },
            { icon: "◉", title: "Cabinas privadas", text: "Silencio y privacidad para tus llamadas y tareas." },
          ].map((item) => (
            <Link key={item.title} href="/spaces" className="group rounded-3xl border border-line bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="grid size-14 place-items-center rounded-2xl bg-sage text-2xl font-bold text-forest">{item.icon}</span>
              <h3 className="mt-6 text-xl font-extrabold group-hover:text-forest">{item.title}</h3>
              <p className="mt-2 leading-7 text-muted">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="bg-[#eeeae0]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-terra">Así de fácil</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Tu espacio de trabajo en tres pasos</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {highlights.map((item) => (
              <article key={item.number} className="rounded-3xl bg-white p-7">
                <span className="text-sm font-black tracking-widest text-terra">{item.number}</span>
                <h3 className="mt-5 text-xl font-extrabold">{item.title}</h3>
                <p className="mt-2 leading-7 text-muted">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-3xl bg-forest p-8 text-white sm:flex-row sm:p-10">
            <div>
              <h3 className="text-2xl font-black">¿Listo para encontrar tu espacio?</h3>
              <p className="mt-2 text-emerald-50/80">Explora el catálogo y reserva tu próximo lugar de trabajo.</p>
            </div>
            <Link href="/spaces" className="inline-flex min-h-12 shrink-0 items-center rounded-xl bg-white px-6 font-bold text-forest transition hover:bg-sage">
              Explorar ahora
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
