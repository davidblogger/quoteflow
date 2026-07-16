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
| `public.clients` | Companies or individuals the tenant manages | this app |
| `public.quotes` | Formal proposals sent to clients, each attached to one client | this app |
| `public.quote_items` | Line items belonging to a quote | this app |
| `public.followups` | Reminders/tasks linked to a client and/or quote | this app |
| `public.notifications` | In-app notifications for the dashboard (new requests, quote status changes, followup reminders) | this app |

The app is single-tenant by design (per the MVP philosophy). Every row belongs to the single deployment's company via `profile_id` (or the implicit `auth.users` → `profiles` 1:1).

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

### 5. `clients` table

```sql
create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id),
  name        text not null,
  company     text,
  email       text,
  phone       text,
  address     text,
  notes       text,
  status      text not null default 'active'
              check (status = ANY (ARRAY['active','paused','closed'])),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index clients_profile_id_created_at_idx
  on public.clients (profile_id, created_at desc);

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

create policy "clients_select_own"
  on public.clients for select
  using (profile_id = auth.uid());

create policy "clients_insert_own"
  on public.clients for insert
  with check (profile_id = auth.uid());

create policy "clients_update_own"
  on public.clients for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "clients_delete_own"
  on public.clients for delete
  using (profile_id = auth.uid());
```

> **Note:** Foreign keys have no `ON DELETE` clause, so they default to `NO ACTION`. Deleting a profile does NOT cascade to clients — RLS policies prevent access instead.

### 6. `quotes` table

```sql
create table public.quotes (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id),
  client_id   uuid not null references public.clients(id),
  title       text not null,
  status      text not null default 'draft'
              check (status = ANY (ARRAY['draft','sent','accepted','rejected'])),
  currency    text not null default 'USD',
  tax_rate    numeric not null default 0,
  subtotal    numeric not null default 0,
  total       numeric not null default 0,
  valid_until date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index quotes_profile_id_created_at_idx
  on public.quotes (profile_id, created_at desc);

create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;

create policy "quotes_select_own"
  on public.quotes for select
  using (profile_id = auth.uid());

create policy "quotes_insert_own"
  on public.quotes for insert
  with check (profile_id = auth.uid());

create policy "quotes_update_own"
  on public.quotes for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "quotes_delete_own"
  on public.quotes for delete
  using (profile_id = auth.uid());
```

> **Note:** `quotes.client_id` references `clients(id)` with `NO ACTION` (no ON DELETE). `quotes.profile_id` also has `NO ACTION`. Deleting a client does NOT automatically delete its quotes — must be handled in application logic or a trigger.

### 7. `quote_items` table

```sql
create table public.quote_items (
  id           uuid primary key default gen_random_uuid(),
  quote_id     uuid not null references public.quotes(id),
  description  text not null,
  quantity     numeric not null default 1,
  unit_price   numeric not null default 0,
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);

create index quote_items_quote_id_position_idx
  on public.quote_items (quote_id, position asc);

alter table public.quote_items enable row level security;

create policy "quote_items_select_own"
  on public.quote_items for select
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_items.quote_id
        and q.profile_id = auth.uid()
    )
  );

create policy "quote_items_insert_own"
  on public.quote_items for insert
  with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_items.quote_id
        and q.profile_id = auth.uid()
    )
  );

create policy "quote_items_update_own"
  on public.quote_items for update
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_items.quote_id
        and q.profile_id = auth.uid()
    )
  );

create policy "quote_items_delete_own"
  on public.quote_items for delete
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_items.quote_id
        and q.profile_id = auth.uid()
    )
  );
```

> **Note:** Ownership is verified through the `quotes` join. Deleting a quote cascades to its items (no ON DELETE on `quote_items.quote_id` means `NO ACTION`, but application logic should handle cleanup).

### 8. `followups` table

```sql
create table public.followups (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id),
  client_id    uuid references public.clients(id),
  quote_id     uuid references public.quotes(id),
  subject      text not null,
  notes        text,
  due_at       timestamptz,
  status       text not null default 'pending'
               check (status = ANY (ARRAY['pending','done','cancelled'])),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index followups_profile_id_status_due_at_idx
  on public.followups (profile_id, status, due_at asc);

create trigger followups_set_updated_at
before update on public.followups
for each row execute function public.set_updated_at();

alter table public.followups enable row level security;

create policy "followups_select_own"
  on public.followups for select
  using (profile_id = auth.uid());

create policy "followups_insert_own"
  on public.followups for insert
  with check (profile_id = auth.uid());

create policy "followups_update_own"
  on public.followups for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "followups_delete_own"
  on public.followups for delete
  using (profile_id = auth.uid());
```

> **Note:** `client_id` and `quote_id` are nullable and reference their tables with `NO ACTION`. Setting a client or quote to null is not automatic — if a referenced row is deleted, the FK prevents it unless a trigger handles it.

### 9. `notifications` table

```sql
create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id),
  type         text not null
               check (type = ANY (ARRAY[
                 'new_request','quote_sent','quote_accepted',
                 'quote_rejected','followup_created'
               ])),
  title        text not null,
  message      text,
  link         text,
  reference_id uuid,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index notifications_profile_id_created_at_idx
  on public.notifications (profile_id, created_at desc);

create index notifications_profile_id_unread_idx
  on public.notifications (profile_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (profile_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  using (profile_id = auth.uid());

create policy "notifications_delete_own"
  on public.notifications for delete
  using (profile_id = auth.uid());
```

> **Notification types:** `new_request` (new inbound form submission), `quote_sent` (quote marked as sent), `quote_accepted` (quote accepted by client), `quote_rejected` (quote rejected by client), `followup_created` (new followup reminder created), `followup_completed` (followup marked as done), `client_created` (new client created).

### 10. Trigger — new request

Creates a notification when a new request is submitted via the public form.

```sql
create or replace function public.notify_new_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (profile_id, type, title, message, link, reference_id)
  select new.profile_id, 'new_request',
    'New quote request: ' || new.name,
    coalesce(new.company, new.email),
    '/app/requests/' || new.id,
    new.id;
  return new;
end;
$$;

create trigger notifications_new_request
  after insert on public.requests
  for each row execute function public.notify_new_request();
```

### 11. Trigger — quote status change

Creates a notification when a quote transitions to `sent`, `accepted`, or `rejected`.

```sql
create or replace function public.notify_quote_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status
     and new.status in ('sent', 'accepted', 'rejected') then
    insert into public.notifications (profile_id, type, title, link, reference_id)
    select new.profile_id,
      'quote_' || new.status,
      case new.status
        when 'sent'     then 'Quote sent: ' || new.title
        when 'accepted' then 'Quote accepted: ' || new.title
        when 'rejected' then 'Quote rejected: ' || new.title
      end,
      '/app/quotes/' || new.id,
      new.id;
  end if;
  return new;
end;
$$;

create trigger notifications_quote_status
  after update of status on public.quotes
  for each row execute function public.notify_quote_status();
```

### 12. Trigger — followup created

Creates a notification when a new followup is created.

```sql
create or replace function public.notify_followup_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (profile_id, type, title, message, link, reference_id)
  select new.profile_id, 'followup_created',
    'Follow-up: ' || new.subject,
    coalesce(new.notes, ''),
    '/app/followup',
    new.id;
  return new;
end;
$$;

create trigger notifications_followup_created
  after insert on public.followups
  for each row execute function public.notify_followup_created();
```

### 13. Trigger — followup completed

Creates a notification when a followup is marked as done.

```sql
create or replace function public.notify_followup_completed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status and new.status = 'done' then
    insert into public.notifications (profile_id, type, title, message, link, reference_id)
    select new.profile_id, 'followup_completed',
      'Follow-up completed: ' || new.subject,
      coalesce(new.notes, ''),
      '/app/followup',
      new.id;
  end if;
  return new;
end;
$$;

create trigger notifications_followup_completed
  after update of status on public.followups
  for each row execute function public.notify_followup_completed();
```

### 14. Trigger — client created

Creates a notification when a new client is created (manually or from request conversion).

```sql
create or replace function public.notify_client_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (profile_id, type, title, message, link, reference_id)
  select new.profile_id, 'client_created',
    'New client: ' || new.name,
    coalesce(new.company, new.email),
    '/app/clients/' || new.id,
    new.id;
  return new;
end;
$$;

create trigger notifications_client_created
  after insert on public.clients
  for each row execute function public.notify_client_created();
```

### 15. Cleanup — delete read notifications older than 30 days

```sql
create or replace function public.cleanup_old_notifications()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.notifications
  where read_at is not null
    and read_at < now() - interval '30 days';
end;
$$;
```

To schedule this automatically, enable `pg_cron` in Supabase and run:
```sql
select cron.schedule('cleanup-notifications', '0 0 * * *', 'select public.cleanup_old_notifications()');
```

Alternatively, call `select public.cleanup_old_notifications()` manually or from a server action on app load.

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
where proname in ('set_updated_at', 'handle_new_user', 'get_only_profile_id',
                  'notify_new_request', 'notify_quote_status',
                  'notify_followup_created', 'cleanup_old_notifications');
-- expect: 7 rows

-- 2. Tables exist
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'requests', 'clients', 'quotes', 'quote_items', 'followups', 'notifications');
-- expect: 7 rows

-- 3. Triggers (one per table that auto-updates updated_at + auth trigger + notification triggers)
select tgname, tgrelid::regclass from pg_trigger
where tgname in ('on_auth_user_created', 'profiles_set_updated_at',
                 'requests_set_updated_at', 'clients_set_updated_at',
                 'quotes_set_updated_at', 'followups_set_updated_at',
                 'notifications_new_request', 'notifications_quote_status',
                 'notifications_followup_created');
-- expect: 9 rows

-- 4. Policies (3 per table: select, insert/update, delete)
select polname, polrelid::regclass from pg_policy
where schemaname = 'public'
  and polrelid::regclass in ('public.profiles', 'public.requests',
                              'public.clients', 'public.quotes',
                              'public.quote_items', 'public.followups',
                              'public.notifications');
-- expect: 22 rows

-- 5. Foreign keys
select conname, confrelid::regclass, confdrelid::regclass
from pg_constraint
where contype = 'f'
  and conrelid in ('public.clients'::regclass, 'public.quotes'::regclass,
                   'public.quote_items'::regclass, 'public.followups'::regclass,
                   'public.requests'::regclass, 'public.notifications'::regclass);
-- expect: clients→profiles, quotes→profiles, quotes→clients,
--          quote_items→quotes, followups→profiles, followups→clients, followups→quotes,
--          notifications→profiles

-- 6. Notification triggers exist
select proname from pg_proc
where proname in ('notify_new_request', 'notify_quote_status',
                  'notify_followup_created', 'cleanup_old_notifications');
-- expect: 4 rows

-- 7. anon can resolve tenant
set role anon;
select public.get_only_profile_id();
reset role;
-- expect: a single UUID (no error)
```