<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repo guide

## Stack

- Next.js **16.2.10** (App Router) + React 19.2.4 + TypeScript + Tailwind v4
- No UI/icon libraries — all components custom in `app/components/`, all icons are inline SVGs in `app/components/icons/Icons.tsx`
- No backend, no auth, no DB, no tests yet

## Architecture

- `app/[lang]/` is the single route segment; `lang` is `en` or `es` (English default, Spanish secondary). All UI lives under it.
- `proxy.ts` at the **project root** detects locale from `Accept-Language` and redirects `/` → `/en`. It is **not** `middleware.ts` — that file convention was renamed to `proxy` in Next 16.
- All UI copy lives in JSON dictionaries at `app/[lang]/dictionaries/{en,es}.json`. Loaded via `getDictionary(locale)` from `app/[lang]/dictionaries.ts` (server-only).
- Each section component is a Server Component that receives a `dict` slice as props. Only two files are `"use client"`: `app/components/layout/MobileMenu.tsx` and `app/[lang]/solicitar/RequestForm.tsx`.
- `app/[lang]/config.ts` is the shared i18n config (locales, `Locale` type, labels) safe for **both client and server**. `dictionaries.ts` is `"server-only"` and re-exports `config.ts`. Client components must import locale types from `config.ts`, not `dictionaries.ts`.

## Routes (all pre-rendered at build time)

- `/[lang]` → `/en`, `/es` — landing
- `/[lang]/solicitar` → `/en/solicitar`, `/es/solicitar` — quote request form
- `app/sitemap.ts`, `app/robots.ts` — file-based, locale-aware
- `app/[lang]/opengraph-image.tsx` — dynamic via `ImageResponse`
- `app/[lang]/not-found.tsx` — custom 404

## Next.js 16 gotchas (verified, will burn you)

- **`middleware.ts` is deprecated → `proxy.ts`** at project root. Same exports shape.
- **`PageProps<'/route'>` and `LayoutProps<'/route'>`** are global TS helpers — they appeared in the build after first type-gen. For nested routes like `/[lang]/solicitar`, an explicit `{ params: Promise<{ lang: string }> }` type works more reliably than `PageProps<"/[lang]/solicitar">`.
- **`params` is a `Promise`** — must `await` it.
- **`not-found.tsx` accepts no props** (no `params`, no `searchParams`). Do not destructure anything from its argument.
- **`generateStaticParams` must live in every segment** that needs pre-rendering — `/[lang]/page.tsx`, `/[lang]/solicitar/page.tsx`, `/[lang]/layout.tsx` all have one.
- **No standalone `typecheck` script** — TS is checked inside `npm run build`. Run the full build to verify types.
- **`ImageResponse` (in `opengraph-image.tsx`)** only supports flexbox + a CSS subset via Satori. No `display: grid`, no Tailwind classes. Use inline `style` props.

## Forms

- Use Server Actions with `"use server"` directive in `actions.ts` next to the form's page.
- Client form uses `useActionState(action, initialState)` + `useFormStatus()` for pending state.
- Validate in the server action; return a typed state object with `fieldErrors: Record<field, errorKey>`. The client maps error keys to translated messages from the dictionary.

## Design system

- Theme is **dark only** (Liquid Glass on `#060814`). Defined in `app/globals.css` via `@theme inline` tokens.
- Custom utilities: `glass`, `glass-strong`, `gradient-text`, `gradient-accent`, `glow-accent` — defined with `@utility` in `globals.css`.
- `prefers-reduced-motion` already respected for all animations.

## Commands

```bash
npm run dev      # localhost:3000 — proxy redirects / to /en
npm run lint     # eslint
npm run build    # compile + TS check + SSG of all 9 routes
```

There is no `test` script, no formatter (Prettier) configured, no pre-commit hook.

## Env

- `NEXT_PUBLIC_SITE_URL` — base URL used by `sitemap.ts`, `robots.ts`, and `metadataBase`. Defaults to `https://quoteflow.io`.

## Git workflow

- Remote: `github.com/davidblogger/quoteflow.git`. Do **not** embed PAT in the remote URL — use `git remote set-url origin https://<user>:<token>@github.com/...` only for the push, then restore to `https://github.com/davidblogger/quoteflow.git` immediately after.
- `main` is the only branch. No CI configured.
- Commit messages in this repo follow Conventional Commits (`feat:`, `fix:`, etc.).

## Adding a new section to the landing

1. Add strings to **both** `app/[lang]/dictionaries/en.json` and `es.json` under a new top-level key.
2. Create `app/components/sections/MySection.tsx` as a Server Component that accepts the slice via props (`type MySectionProps = { my: Dictionary["my"] }`).
3. Compose it in `app/[lang]/page.tsx` (pass `dict.my`).
4. If the section needs a CTA that links to the quote form, build the URL as `/${lang}/solicitar` — the `lang` prop must be passed down from `page.tsx`.