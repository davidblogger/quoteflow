# QuoteFlow

SaaS de cotización instantánea. Permite a los clientes enviar solicitudes de presupuesto a través de una landing bilingüe y un formulario dedicado. El panel de administración permite gestionar clientes, cotizaciones, solicitudes y notificaciones.

## Stack

- **Next.js 16.2.10** (App Router) + **React 19.2.4**
- **TypeScript**
- **Tailwind CSS v4** — tema oscuro "Liquid Glass" sobre `#060814`, definido en `app/globals.css` vía `@theme inline` y `@utility`.
- **Sin librerías de UI** — todos los componentes son propios, en `app/components/`. Los íconos son SVGs inline en `app/components/icons/Icons.tsx`.
- **Supabase** — auth, base de datos (PostgreSQL), RLS policies, y service role para operaciones de admin.

## Arquitectura

### Rutas públicas (pre-renderizadas)

- `/{en|es}` — landing bilingüe
- `/{en|es}/solicitar` — formulario de solicitud de presupuesto

### Rutas de la app (requieren auth)

- `/{en|es}/app` — dashboard principal
- `/{en|es}/app/requests` — lista de solicitudes entrantes
- `/{en|es}/app/requests/[id]` — detalle de solicitud
- `/{en|es}/app/clients` — gestión de clientes
- `/{en|es}/app/clients/[id]` — detalle/editar cliente
- `/{en|es}/app/clients/new` — nuevo cliente
- `/{en|es}/app/quotes` — lista de cotizaciones
- `/{en|es}/app/quotes/new` — nueva cotización
- `/{en|es}/app/quotes/[id]` — detalle de cotización
- `/{en|es}/app/quotes/[id]/pdf` — generar PDF de cotización
- `/{en|es}/app/followup` — seguimiento de cotizaciones
- `/{en|es}/app/notifications` — centro de notificaciones
- `/{en|es}/app/settings` — configuración de perfil y contraseña
- `/{en|es}/app/settings/users` — gestión de usuarios del workspace (solo admin)

### Rutas de autenticación

- `/{en|es}/login` — inicio de sesión
- `/{en|es}/signup` — registro

## Funcionalidades

### Dashboard

- KPIs: solicitudes nuevas (7 días), cotizaciones pendientes, clientes activos (30 días), seguimientos vencidos/hoy
- Tabla de solicitudes recientes con enlaces
- Feed de actividad: últimas notificaciones con iconos y navegación
- Barra de búsqueda global con dropdown (debounce 300ms, navegación por teclado)

### Sistema de usuarios y roles

- Roles: `admin` y `member`
- El admin puede crear usuarios directamente con email + contraseña (sin confirmación de email)
- El admin puede cambiar roles y eliminar usuarios
- `invited_by` registra qué usuario invitó a cada miembro

### Gestión de solicitudes

- Solicitudes entrantes desde el formulario público
- Estados: `new`, `contacted`, `quoted`, `won`, `lost`
- Historial de cambios de estado

### Gestión de clientes

- CRUD completo de clientes
- Datos: nombre, email, teléfono, empresa, dirección, moneda preferida, tasa de impuesto
- Vínculo con solicitudes y cotizaciones

### Gestión de cotizaciones

- Crear cotizaciones vinculadas a solicitudes y clientes
- Líneas de cotización: descripción, cantidad, precio unitario, subtotal
- Cálculo automático de impuestos
- Generación de PDF para enviar al cliente
- Estados: `draft`, `sent`, `accepted`, `rejected`

### Sistema de seguimiento (Follow-ups)

- Identifica cotizaciones sin seguimiento o vencidas
- Marca seguimientos como completados
- Triggers de Supabase para notificaciones automáticas (`followup_completed`, `client_created`)

### Notificaciones

- Dropdown en el header del dashboard
- Página dedicada `/app/notifications`
- Tipos: `followup_completed`, `client_created`, y más
- Marcar como leídas/no leídas

### Búsqueda global

- Busca en solicitudes, clientes y cotizaciones
- Resultados agrupados por tipo
- Navegación por teclado (flechas, Enter, Escape)
- Portal de React para positioning correcto

### Configuración

- Datos del perfil (nombre de empresa, teléfono, dirección, moneda, tasa de impuesto)
- Cambio de contraseña (requiere contraseña actual)
- Gestión de usuarios del workspace (solo admins)

## Internacionalización

- `app/[lang]/` es el segmento dinámico de rutas; `lang` vale `en` (por defecto) o `es`.
- `proxy.ts` en la raíz detecta el idioma desde `Accept-Language` y redirige `/` → `/en`.
- Las cadenas de UI viven en `app/[lang]/dictionaries/{en,es}.json` y se cargan con `getDictionary(locale)`.
- Cada sección de la landing es un Server Component que recibe su slice del diccionario por props.

## Estructura

```
app/
├── [lang]/
│   ├── config.ts                  # i18n config (locales, tipo Locale) — cliente y servidor
│   ├── dictionaries.ts            # getDictionary() — server-only
│   ├── dictionaries/{en,es}.json # copy por idioma
│   ├── layout.tsx                # layout por locale
│   ├── page.tsx                  # landing
│   ├── opengraph-image.tsx       # OG image dinámico
│   ├── not-found.tsx             # 404 custom
│   ├── solicitar/                # formulario público
│   │   ├── page.tsx
│   │   ├── RequestForm.tsx       # "use client"
│   │   └── actions.ts            # Server Action
│   ├── (auth)/                   # rutas de auth
│   │   ├── login/
│   │   └── signup/
│   └── app/                      # dashboard (requiere auth)
│       ├── page.tsx              # dashboard principal
│       ├── actions.ts            # Server Actions (login, signup, etc.)
│       ├── clients/
│       ├── followup/
│       ├── notifications/
│       ├── quotes/
│       ├── requests/
│       └── settings/
│           ├── page.tsx
│           ├── users/page.tsx
│           ├── change-password-form.tsx
│           └── actions.ts        # Settings, createUser, updateRole, deleteUser
├── components/
│   ├── icons/Icons.tsx           # SVGs inline
│   ├── layout/                   # Header, Footer, MobileMenu
│   ├── sections/                 # Hero, Benefits, HowItWorks, etc.
│   └── ui/                       # primitivos reutilizables (Button, UsersList, SearchBar, etc.)
├── globals.css                   # tokens de tema + utilidades Tailwind v4
├── sitemap.ts
└── robots.ts
proxy.ts                          # detección de locale
lib/
├── supabase/
│   ├── client.ts                 # createClient para browser
│   ├── server.ts                 # getSupabaseServer, getSupabaseAdmin, getUser
│   ├── middleware.ts             # refresh de sesión
│   └── types.ts                  # tipos compartidos
├── queries/
│   ├── profile.ts                # getCurrentProfile, listWorkspaceUsers, updateUserRole, etc.
│   └── ...
docs/
└── supabase.md                   # schema SQL completo, triggers, RLS policies
```

## Server Actions

- `signInAction` / `signUpAction` — autenticación
- `updateProfileAction` — actualizar configuración
- `changePasswordAction` — cambiar contraseña
- `createUserByAdminAction` — crear usuario directamente (admin)
- `updateUserRoleAction` — cambiar rol de usuario (admin)
- `deleteUserAction` — eliminar usuario (admin)
- `markNotificationReadAction` / `markAllNotificationsReadAction` — notificaciones

## Base de datos (Supabase)

### Tablas principales

- `profiles` — perfil de usuario con rol, empresa, moneda, tasa de impuesto
- `clients` — clientes con datos de contacto
- `requests` — solicitudes entrantes con estado
- `quotes` — cotizaciones vinculadas a solicitudes/clientes
- `quote_items` — líneas de cada cotización
- `notifications` — notificaciones de actividad
- `followups` — seguimientos de cotizaciones
- `activity_log` — log de cambios de estado

### Triggers SQL

- `notify_client_created` — dispara notificación al crear cliente
- `notify_followup_completed` — dispara notificación al completar seguimiento

### RLS Policies

- Perfil propio: lectura/escritura propia
- Clientes: acceso completo al workspace
- Solicitudes: acceso completo
- Cotizaciones: acceso completo
- Notificaciones: solo propias

## Comandos

```bash
npm run dev      # localhost:3000 — proxy redirige / a /en
npm run lint     # ESLint
npm run build    # compila + type check + SSG de las rutas públicas
```

## Variables de entorno

- `NEXT_PUBLIC_SITE_URL` — URL base para sitemap, robots, OpenGraph. Por defecto `https://quoteflow.io`.
- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clave pública de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — clave de service role (solo para operaciones de admin, nunca expuesta al cliente)

## Notas sobre Next.js 16

- `middleware.ts` está deprecado → usar `proxy.ts` en la raíz del proyecto.
- `params` ahora es una `Promise`; hay que `await`.
- `not-found.tsx` no recibe props.
- `generateStaticParams` debe existir en cada segmento pre-renderizado.
- `ImageResponse` solo soporta flexbox + CSS subset vía Satori.

## Repositorio

- Remoto: `github.com/davidblogger/quoteflow.git`
- Rama: `main`. Sin CI.
