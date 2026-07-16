# QuoteFlow - Estado Actual del Desarrollo

## Objetivo

Continuar el desarrollo del SaaS **QuoteFlow**, una plataforma para pequeñas empresas de servicios que permita:

- Gestionar clientes.
- Gestionar oportunidades.
- Crear cotizaciones profesionales.
- Realizar seguimiento comercial.
- Generar PDFs.
- Comercializarse mediante suscripción mensual.

El MVP **NO utilizará IA**. Todo funcionará mediante reglas de negocio.

---

# Stack Tecnológico

## Frontend

- Next.js (App Router)
- TypeScript
- TailwindCSS

## Backend

- Supabase

## Base de Datos

- PostgreSQL (Supabase)

## Hosting

- Vercel

---

# Estado Actual

## Landing

La landing principal ya fue desarrollada anteriormente.

Características:

- Diseño Liquid Glass
- Responsive
- Orientada a empresas de servicios
- Reutilizable para múltiples industrias

---

# Proyecto Supabase

Se creó correctamente un proyecto llamado:

QuoteFlow

Se configuraron las variables de entorno.

Archivo:

.env.local

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

# SDK instalado

Se instaló:

```bash
npm install @supabase/supabase-js
```

---

# Cliente Supabase

Se creó:

```
lib/supabase.ts
```

Contenido:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

Este cliente será reutilizado en toda la aplicación.

---

# Verificación de Conexión

Se realizó una prueba consultando:

```typescript
supabase
.from('profiles')
.select('*')
```

Resultado obtenido:

```
PGRST205

Could not find the table 'public.profiles'
```

Esto confirma que:

✅ Next.js está correctamente conectado a Supabase.

✅ Variables de entorno correctas.

✅ URL correcta.

✅ anon key correcta.

La tabla simplemente aún no existe.

---

# Arquitectura del Proyecto

El proyecto utiliza App Router.

La estructura es similar a:

```
app/

    components/

    [lang]/
```

La aplicación utiliza internacionalización.

Todas las nuevas páginas deben crearse dentro de:

```
app/[lang]/
```

No directamente dentro de app/.

---

# Decisión Arquitectónica

Se decidió desarrollar el sistema siguiendo este orden:

1. Infraestructura
2. Autenticación
3. Base de datos
4. Dashboard
5. Clientes
6. Oportunidades
7. Cotizaciones
8. Seguimiento
9. PDF
10. Cliente piloto

---

# Próximo Paso

Actualmente nos encontramos aquí:

## Crear la tabla profiles

Se preparó el siguiente SQL:

```sql
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    company_name text not null,
    email text not null,
    phone text,
    logo_url text,
    address text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
```

Este SQL aún no ha sido ejecutado.

---

# Filosofía del Desarrollo

Mantener el MVP pequeño.

No agregar funcionalidades innecesarias.

No implementar IA todavía.

No implementar:

- Multi Tenant
- Roles avanzados
- Inventario
- Pagos
- Facturación
- WhatsApp
- Email Automation
- Chat
- Reportes avanzados

Todo eso quedará para versiones futuras.

---

# Objetivo para OpenCode

A partir de este punto continuar el desarrollo del MVP siguiendo buenas prácticas de arquitectura para Next.js y Supabase.

Se espera que OpenCode actúe como un **Senior Full Stack Engineer** especializado en:

- Next.js
- TypeScript
- Supabase
- PostgreSQL
- Clean Architecture
- Escalabilidad
- SaaS B2B

Antes de implementar nuevas funcionalidades deberá mantener una estructura limpia, reutilizable y preparada para crecer sin sobreingeniería.

El desarrollo debe continuar paso a paso, validando cada etapa antes de avanzar a la siguiente.
