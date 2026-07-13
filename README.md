# QuoteFlow

SaaS de cotización instantánea. Permite a los clientes enviar solicitudes de presupuesto a través de una landing bilingüe y un formulario dedicado.

## Estado actual

Proyecto en construcción inicial. Solo el front-end está implementado hoy:

- Landing bilingüe (`/en`, `/es`) totalmente pre-renderizada.
- Formulario de cotización (`/[lang]/solicitar`) con Server Action.
- SEO técnico: sitemap, robots, Open Graph dinámico por locale.
- `@supabase/supabase-js` instalado como dependencia, pendiente de integración (back-end, auth, base de datos).

No hay aún back-end propio, autenticación, persistencia ni tests.

## Stack

- **Next.js 16.2.10** (App Router) + **React 19.2.4**
- **TypeScript**
- **Tailwind CSS v4** — tema oscuro "Liquid Glass" sobre `#060814`, definido en `app/globals.css` vía `@theme inline` y `@utility`.
- **Sin librerías de UI** — todos los componentes son propios, en `app/components/`. Los íconos son SVGs inline en `app/components/icons/Icons.tsx`.
- **Sin back-end propio** — por ahora. Supabase es la pieza prevista para auth y datos.

## Internacionalización

- `app/[lang]/` es el único segmento dinámico de rutas; `lang` vale `en` (por defecto) o `es`.
- `proxy.ts` en la raíz (no `middleware.ts` — renombrado en Next 16) detecta el idioma desde `Accept-Language` y redirige `/` → `/en`.
- Las cadenas de UI viven en `app/[lang]/dictionaries/{en,es}.json` y se cargan con `getDictionary(locale)` desde `app/[lang]/dictionaries.ts` (server-only).
- Cada sección de la landing es un Server Component que recibe su slice del diccionario por props.

## Estructura

```
app/
├── [lang]/
│   ├── config.ts                  # i18n config (locales, tipo Locale) — cliente y servidor
│   ├── dictionaries.ts             # getDictionary() — server-only
│   ├── dictionaries/{en,es}.json  # copy por idioma
│   ├── layout.tsx                 # layout por locale
│   ├── page.tsx                   # landing
│   ├── not-found.tsx              # 404 custom
│   ├── opengraph-image.tsx        # OG image dinámico
│   ├── solicitar/                 # formulario de cotización
│   │   ├── page.tsx
│   │   ├── RequestForm.tsx        # "use client"
│   │   └── actions.ts             # Server Action
│   └── test/                      # ruta de pruebas
├── components/
│   ├── icons/Icons.tsx            # SVGs inline
│   ├── layout/                    # Header, Footer, MobileMenu (este "use client")
│   ├── sections/                  # Hero, Benefits, HowItWorks, Services,
│   │                              # DashboardPreview, Testimonials, CtaFinal
│   └── ui/                        # primitivos reutilizables
├── globals.css                    # tokens de tema + utilidades Tailwind v4
├── sitemap.ts
└── robots.ts
proxy.ts                           # detección de locale
```

## Rutas

- `/{en|es}` — landing
- `/{en|es}/solicitar` — formulario de cotización

Todas se pre-renderizan en build (SSG) — son 9 rutas totales contando locales.

## Formulario de cotización

- Server Action con `"use server"` en `solicitar/actions.ts`. Valida en servidor y devuelve estado tipado con `fieldErrors`.
- El componente cliente usa `useActionState(action, initialState)` + `useFormStatus()` para gestionar `pending` y errores por campo.
- Las claves de error se traducen en el cliente desde el diccionario.

## Comandos

```bash
npm run dev      # localhost:3000 — proxy redirige / a /en
npm run lint     # ESLint
npm run build    # compila + type check + SSG de las 9 rutas
```

No hay script de tests, formateador (Prettier) ni hook de pre-commit.

## Variables de entorno

- `NEXT_PUBLIC_SITE_URL` — URL base que usan `sitemap.ts`, `robots.ts` y `metadataBase`. Por defecto `https://quoteflow.io`.

## Notas sobre Next.js 16

Algunas convenciones han cambiado respecto a versiones anteriores; vale la pena tenerlas en cuenta antes de escribir código:

- `middleware.ts` está deprecado → usar `proxy.ts` en la raíz del proyecto, mismo shape de exports.
- `params` ahora es una `Promise`; hay que `await`.
- `not-found.tsx` no recibe props (ni `params` ni `searchParams`).
- `generateStaticParams` debe existir en cada segmento que quieras pre-renderizar.
- No hay `typecheck` independiente: la verificación de tipos ocurre dentro de `npm run build`.
- `ImageResponse` (en `opengraph-image.tsx`) solo soporta flexbox + un subset de CSS vía Satori. Nada de `display: grid`, nada de clases de Tailwind — usar `style` inline.

## Repositorio

- Remoto: `github.com/davidblogger/quoteflow.git`.
- Rama única: `main`. Sin CI.
