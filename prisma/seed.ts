
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/features/auth/server/password";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Administrador";

  if (!email || !password) {
    throw new Error(
      "Debes configurar SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD."
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "ADMIN",
    },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  // Aquí agregaremos los espacios de ejemplo con upsert.


  const spaces = [
    {
      id: "10000000-0000-4000-8000-000000000001",
      name: "Escritorio Flexible",
      type: "DESK" as const,
      description: "Espacio individual para trabajar cómodamente.",
      capacity: 1,
      pricePerHour: 10000,
      isActive: true,
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      name: "Sala de Reuniones",
      type: "MEETING_ROOM" as const,
      description: "Sala privada para reuniones de equipo.",
      capacity: 6,
      pricePerHour: 40000,
      isActive: true,
    },
    {
      id: "10000000-0000-4000-8000-000000000003",
      name: "Cabina Privada",
      type: "BOOTH" as const,
      description: "Cabina para llamadas y trabajo concentrado.",
      capacity: 1,
      pricePerHour: 12000,
      isActive: true,
    },
    {
      id: "10000000-0000-4000-8000-000000000004",
      name: "Sala Desactivada",
      type: "MEETING_ROOM" as const,
      description: "Espacio de ejemplo que no debe aparecer en el catálogo.",
      capacity: 4,
      pricePerHour: 25000,
      isActive: false,
    },
  ];

  for (const space of spaces) {
    await prisma.space.upsert({
      where: { id: space.id },
      update: {
        name: space.name,
        type: space.type,
        description: space.description,
        capacity: space.capacity,
        pricePerHour: space.pricePerHour,
        isActive: space.isActive,
      },
      create: space,
    });
  }

  console.log(`${spaces.length} espacios procesados.`);


  console.log("Administrador creado o actualizado correctamente.");

}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
