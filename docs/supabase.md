# Supabase setup

This document records the **manual SQL setup** applied to the QuoteFlow Supabase project, why each piece exists, and how the code consumes it. It exists so the next developer can reproduce, audit, and evolve the schema without re-deriving decisions from chat history.

> Migrations are currently executed by hand in the Supabase SQL Editor. The first time Supabase CLI is adopted, this file becomes the source of truth and the snippets move to `supabase/migrations/*.sql`.

---

## Schema overview

| Table | Purpose | Owner |
| --- | --- | --- |
| `auth.users` | Supabase managed | Supabase |
| `public.profiles` | One row per company owner, 1:1 with `auth.users` | this app |
| `public.requests` | Inbound quote requests from the public `/solicitar` form | this app |

The app is single-tenant by design (per the MVP philosophy). Each row in `profiles` and `requests` belongs to the single deployment's company.

---

## Snippets, in execution order

### 1. `profiles` table + auth trigger

```sql
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  company_name  text not null,
  email         text not null unique,
  phone         text,
  logo_url      text,
  address       text,
  currency      text not null default 'USD',
  tax_rate      numeric(5,2) not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, company_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'company_name', '')
  );
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

**Critical:** `set_updated_at` and `handle_new_user` must be created in this exact order. If `set_updated_at` is missing when the `profiles_set_updated_at` trigger is created, the trigger creation fails and any subsequent block depending on the function fails too.

### 2. Backfill for users created before the trigger existed

If a user signed up while the trigger was missing (e.g. during early setup), their `auth.users` row exists but no `public.profiles` row does. Run this once per missing user, substituting the UUID:

```sql
insert into public.profiles (id, email, company_name)
select id, email, coalesce(raw_user_meta_data->>'company_name', '')
from auth.users
where id = '<USER_UUID>'
  and not exists (select 1 from public.profiles p where p.id = auth.users.id);
```

### 3. `requests` table

```sql
create table public.requests (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  email       text not null,
  company     text,
  phone       text,
  service     text,
  message     text not null,
  status      text not null default 'new'
              check (status in ('new','contacted','qualified','converted','closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index requests_profile_id_created_at_idx
  on public.requests (profile_id, created_at desc);

create trigger requests_set_updated_at
before update on public.requests
for each row execute function public.set_updated_at();

alter table public.requests enable row level security;

create policy "requests_select_own"
  on public.requests for select
  using (profile_id = auth.uid());

create policy "requests_insert_public"
  on public.requests for insert
  with check (true);

create policy "requests_update_own"
  on public.requests for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
```

### 4. Tenant-resolution RPC (replaces broad anon SELECT)

The public `/solicitar` form must know which `profile_id` to attach new requests to. The naive approach is to grant `anon` SELECT on `profiles`, but that exposes every column of every profile to unauthenticated clients.

Instead, we expose a single SQL function (`get_only_profile_id`) marked `security definer`, which bypasses RLS, returns only a single UUID, and is the only way `anon` can resolve the tenant.

```sql
create or replace function public.get_only_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.profiles order by created_at asc limit 1;
$$;

grant execute on function public.get_only_profile_id() to anon, authenticated;
```

The `lib/queries/profile.ts#getOnlyProfileId` helper calls this via `supabase.rpc(...)`.

---

## Why this shape

- **`security definer` + `set search_path = public`** prevents search-path hijacking.
- **`stable`** marks the function as deterministic within a single statement so Postgres can cache its plan.
- **`grant execute ... to anon`** is the minimum surface area: anon can ask "who is the tenant" but cannot read any profile column directly.
- The accompanying `profiles_select_own` policy remains in place for the authenticated dashboard experience (`/app/**`), where the user reads and edits their own profile.

When the SaaS evolves to multi-tenant, this function is replaced by slug-based resolution: the public form URL becomes `/[lang]/u/<slug>/solicitar` and the SQL function takes a `slug` argument rather than returning a hard-coded first row.

---

## Verification

After running the full setup:

```sql
-- 1. Functions
select proname from pg_proc
where proname in ('set_updated_at', 'handle_new_user', 'get_only_profile_id');
-- expect: 3 rows

-- 2. Triggers
select tgname from pg_trigger
where tgname in ('on_auth_user_created', 'profiles_set_updated_at', 'requests_set_updated_at');
-- expect: 3 rows

-- 3. Policies
select polname, polrelid::regclass from pg_policy
where polrelid in ('public.profiles'::regclass, 'public.requests'::regclass);
-- expect: 6 rows (4 on profiles + 3 on requests minus profiles_select_anon = 6)

-- 4. anon can resolve tenant
set role anon;
select public.get_only_profile_id();
reset role;
-- expect: a single UUID (no error)
```