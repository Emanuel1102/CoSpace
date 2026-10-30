# CoSpace

Plataforma de reservas de espacios de coworking (escritorios, salas de reuniones y cabinas). Los usuarios se registran, exploran el catálogo y reservan por horas; los administradores gestionan el catálogo de espacios.

Aplicación fullstack con **Next.js 16** (App Router), **Prisma 7** y **PostgreSQL en Supabase**. Toda la información vive en una base de datos propia y se expone mediante route handlers de Next.js.

## Requisitos previos

- **Node.js 22** (mínimo 20.19) y **npm**
- Una cuenta de **Supabase** con un proyecto creado
- **Docker** (solo para la ejecución con contenedor)
- **Git**

## Variables de entorno

Todas están en `.env.example`. Copia ese archivo a `.env` y completa los valores **sin comillas** (Docker no las quita y rompe la conexión).

| Variable | Para qué sirve | Valor y cómo obtenerlo |
|---|---|---|
| `DATABASE_URL` | Conexión de la aplicación en ejecución | Supabase → **Connect** → *ORMs* → **Transaction pooler** (puerto 6543) |
| `DIRECT_URL` | Conexión que usa la CLI de Prisma (migraciones y seed) | Supabase → **Connect** → **Session pooler** (puerto 5432) |
| `JWT_ACCESS_SECRET` | Clave para firmar el access token | Secreto aleatorio (ver comando abajo) |
| `JWT_REFRESH_SECRET` | Clave para firmar el refresh token | Otro secreto aleatorio, distinto del anterior |
| `ACCESS_TOKEN_EXPIRES_IN` | Duración del access token | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Duración del refresh token | `7d` |


## Ejecución en desarrollo

```bash
# 1. Clonar e instalar dependencias (el postinstall genera el cliente de Prisma)
git clone https://github.com/Emanuel1102/CoSpace.git
cd CoSpace
npm install

# 2. Crear el .env a partir del ejemplo y completarlo
cp .env.example .env        # en Windows: copy .env.example .env

# 3. Aplicar las migraciones en la base de datos
npm run db:deploy

# 4. Cargar los datos iniciales (administrador y espacios de ejemplo)
npm run db:seed

# 5. Levantar el proyecto
npm run dev
```

La aplicación queda disponible en http://localhost:3000.

## Credenciales del administrador

Creado por el seed:

- **Email:** `<EMAIL_ADMIN>`
- **Contraseña:** `<PASSWORD_ADMIN>`

El rol de administrador solo se crea mediante el seed, no desde el registro público.

## Ejecución con Docker

Antes de usar Docker, ejecuta las migraciones y el seed como en desarrollo (pasos 3 y 4), y deja el `.env` listo y sin comillas. Las variables **no** se incluyen en la imagen: se pasan al arrancar el contenedor.

```bash
# Construir la imagen
docker build -t cospace .

# Correr el contenedor pasando las variables de entorno
docker run --rm -p 3000:3000 --env-file .env --name cospace-app cospace
```

Con los scripts de npm es equivalente:

```bash
npm run docker:build
npm run docker:run
```

La aplicación queda en http://localhost:3000.

## Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el build de producción |
| `npm run start` | Sirve el build de producción (requiere `npm run build` antes) |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |
| `npm run typecheck` | Verifica los tipos de TypeScript sin generar archivos |
| `npm run db:generate` | Genera el cliente de Prisma a partir de `schema.prisma` |
| `npm run db:migrate` | Crea y aplica una migración nueva a partir de los cambios del schema (desarrollo) |
| `npm run db:deploy` | Aplica las migraciones pendientes sin crear nuevas (producción y entornos nuevos) |
| `npm run db:pull` | Introspección: lee las tablas de la base de datos y actualiza `schema.prisma` |
| `npm run db:seed` | Carga los datos iniciales: administrador y espacios de ejemplo |
| `npm run db:studio` | Abre Prisma Studio, una interfaz web para ver y editar los datos |
| `postinstall` | Se ejecuta solo después de `npm install` y genera el cliente de Prisma |
`postinstall` ejecuta `prisma generate` automáticamente después de `npm install`.

## Estructura de carpetas

```
prisma/              Schema, migraciones y seed
public/              Archivos estáticos e imágenes de los espacios
src/app/             Rutas del App Router
  (public)/          Home, catálogo y detalle de espacios
  (auth)/            Login y registro
  (private)/         Dashboard del usuario (mis reservas)
  (admin)/           Panel de administración
  api/               Route handlers: auth, spaces y bookings
src/features/        Lógica y componentes por dominio (auth, spaces, bookings, admin)
src/shared/components/      Componentes compartidos (navbar, footer, botones, tarjetas...)
src/lib/             Utilidades: Prisma, variables de entorno, errores, respuestas de API
src/proxy.ts         Protección de rutas privadas y de administrador
Dockerfile           Construcción y ejecución con Docker
.env.example         Plantilla de variables de entorno
```

## Decisiones de diseño

- **Autenticación:** access token y refresh token en cookies `httpOnly`, `secure` (en producción) y `sameSite`. El refresh token se guarda hasheado (SHA-256) en la base de datos, se rota en cada renovación y el logout lo revoca.
- **Protección de rutas:** `proxy.ts` redirige al login a quien no tiene sesión y bloquea `/admin` a quien no es administrador. Además, cada route handler valida sesión y rol por su cuenta.
- **Zona horaria:** las fechas se guardan en UTC y las reglas de horario (07:00 a 21:00) se validan en `America/Bogota`.
- **Precios:** enteros en pesos; el servidor calcula el total de cada reserva.
- **Desactivación de espacios:** un espacio no se elimina; no se puede desactivar si tiene reservas confirmadas que aún no han terminado.
- **Estrategias de renderizado:** Home en SSG; catálogo, detalle y panel de administración en SSR; dashboard del usuario en CSR.

## Aplicación desplegada

### [Visita el sitio aquí](https://cospace-fawn.vercel.app/)
