# Personal Finance Monorepo

Aplicación web para gestionar ingresos y gastos personales con login de Google, dashboard privado y CRUD de movimientos.

## Stack

- Frontend: React + TypeScript + Vite + React Router + TanStack Query + React Hook Form + Zod + Tailwind CSS
- UI: componentes estilo shadcn/ui, Radix UI, lucide-react, sonner, Recharts
- Backend: Node.js + Express + TypeScript + Mongoose
- Base de datos: MongoDB Atlas
- Auth: Google Sign-In + verificación backend + JWT propio
- Deploy: Vercel + Render + MongoDB Atlas

## Estructura

```text
apps/
  api/
  web/
packages/
  shared/
```

## Instalación

```bash
npm install
```

## Variables de entorno

Backend: copia [apps/api/.env.example](apps/api/.env.example) a `apps/api/.env`

```env
PORT=4000
MONGODB_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Frontend: copia [apps/web/.env.example](apps/web/.env.example) a `apps/web/.env`

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=
```

## Configurar Google OAuth

1. Crea un proyecto en Google Cloud.
2. Activa Google Identity Services.
3. Crea credenciales de tipo OAuth Client ID para aplicación web.
4. Añade `http://localhost:5173` como Authorized JavaScript origin.
5. Añade tus dominios finales de Vercel cuando despliegues.
6. Usa el mismo `GOOGLE_CLIENT_ID` en backend y `VITE_GOOGLE_CLIENT_ID` en frontend.

## Configurar MongoDB Atlas

1. Crea un cluster gratuito en MongoDB Atlas.
2. Crea un usuario de base de datos.
3. Permite tu IP local o usa acceso temporal abierto para desarrollo.
4. Copia el connection string en `MONGODB_URI`.

## Ejecutar en local

Terminal 1:

```bash
npm run dev:api
```

Terminal 2:

```bash
npm run dev:web
```

Build completo:

```bash
npm run build
```

Chequeo TypeScript:

```bash
npm run check
```

## Flujo implementado

- Login con Google en frontend
- Envío del credential al backend
- Verificación del token con Google
- Creación o actualización del usuario
- Emisión de JWT propio
- Rutas privadas con JWT
- Dashboard mensual
- CRUD de movimientos del usuario autenticado
- Resumen mensual por balance y categorías
- Logout

## Endpoints principales

- `POST /api/auth/google`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/transactions/:id`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET /api/summary/monthly?month=YYYY-MM`

## Despliegue

### Frontend en Vercel

1. Importa el repositorio en Vercel.
2. Configura Root Directory como `apps/web`.
3. Define `VITE_API_URL` con la URL pública del backend.
4. Define `VITE_GOOGLE_CLIENT_ID`.
5. Build command: `npm run build`.
6. Output directory: `dist`.

### Backend en Render

1. Crea un Web Service apuntando al repositorio.
2. Configura Root Directory como `apps/api`.
3. Build command: `npm install && npm run build`.
4. Start command: `npm run start`.
5. Añade `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CLIENT_URL` y `NODE_ENV=production`.

### Base de datos en MongoDB Atlas

1. Añade la IP de Render o usa `0.0.0.0/0` si aceptas el riesgo temporal.
2. Verifica que el usuario de Atlas tenga permisos de lectura y escritura.

## Notas

- Todas las rutas privadas toman el `userId` desde el JWT, no desde el frontend.
- Cada usuario solo puede operar sobre sus propios movimientos.
- El proyecto compila con `npm run check` y genera build con `npm run build`.
- El bundle web actual funciona, pero Vite avisa que el chunk principal es grande; se puede partir en una siguiente iteración.
