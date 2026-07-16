-- ============================================================
-- QuoteFlow — Full Schema Sync
-- Run this in Supabase SQL Editor to sync schema with docs/supabase.md
-- ============================================================

-- ============================================================
-- 0. Helper function — updated_at auto-set
-- Required by all tables that have updated_at column
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============================================================
-- 1. Profiles table
-- ============================================================
-- (Already exists in your DB — just ensure updated_at trigger)
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 2. Auth trigger — auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, company_name)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'company_name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Requests table
-- ============================================================
-- (Already exists — ensure updated_at trigger + index)

DROP TRIGGER IF EXISTS requests_set_updated_at ON public.requests;
CREATE TRIGGER requests_set_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP INDEX IF EXISTS requests_profile_id_created_at_idx;
CREATE INDEX requests_profile_id_created_at_idx
  ON public.requests (profile_id, created_at DESC);

-- RLS already assumed to be applied, but documenting:
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS requests_select_own ON public.requests;
CREATE POLICY requests_select_own ON public.requests FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS requests_insert_public ON public.requests;
CREATE POLICY requests_insert_public ON public.requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS requests_update_own ON public.requests;
CREATE POLICY requests_update_own ON public.requests FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- ============================================================
-- 4. Tenant-resolution RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_only_profile_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_only_profile_id() TO anon, authenticated;

-- ============================================================
-- 5. Clients table
-- ============================================================
-- (Already exists — ensure updated_at trigger + index + RLS)

DROP TRIGGER IF EXISTS clients_set_updated_at ON public.clients;
CREATE TRIGGER clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP INDEX IF EXISTS clients_profile_id_created_at_idx;
CREATE INDEX clients_profile_id_created_at_idx
  ON public.clients (profile_id, created_at DESC);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clients_select_own ON public.clients;
CREATE POLICY clients_select_own ON public.clients FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS clients_insert_own ON public.clients;
CREATE POLICY clients_insert_own ON public.clients FOR INSERT WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS clients_update_own ON public.clients;
CREATE POLICY clients_update_own ON public.clients FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS clients_delete_own ON public.clients;
CREATE POLICY clients_delete_own ON public.clients FOR DELETE USING (profile_id = auth.uid());

-- ============================================================
-- 6. Quotes table
-- ============================================================
-- (Already exists — ensure updated_at trigger + index + RLS)

DROP TRIGGER IF EXISTS quotes_set_updated_at ON public.quotes;
CREATE TRIGGER quotes_set_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP INDEX IF EXISTS quotes_profile_id_created_at_idx;
CREATE INDEX quotes_profile_id_created_at_idx
  ON public.quotes (profile_id, created_at DESC);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quotes_select_own ON public.quotes;
CREATE POLICY quotes_select_own ON public.quotes FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS quotes_insert_own ON public.quotes;
CREATE POLICY quotes_insert_own ON public.quotes FOR INSERT WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS quotes_update_own ON public.quotes;
CREATE POLICY quotes_update_own ON public.quotes FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS quotes_delete_own ON public.quotes;
CREATE POLICY quotes_delete_own ON public.quotes FOR DELETE USING (profile_id = auth.uid());

-- ============================================================
-- 7. Quote items table
-- ============================================================
-- (Already exists — ensure RLS)

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quote_items_select_own ON public.quote_items;
CREATE POLICY quote_items_select_own ON public.quote_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_items.quote_id
      AND q.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS quote_items_insert_own ON public.quote_items;
CREATE POLICY quote_items_insert_own ON public.quote_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_items.quote_id
      AND q.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS quote_items_update_own ON public.quote_items;
CREATE POLICY quote_items_update_own ON public.quote_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_items.quote_id
      AND q.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS quote_items_delete_own ON public.quote_items;
CREATE POLICY quote_items_delete_own ON public.quote_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_items.quote_id
      AND q.profile_id = auth.uid()
  )
);

-- ============================================================
-- 8. Followups table
-- ============================================================
-- (Already exists — ensure updated_at trigger + index + RLS)

DROP TRIGGER IF EXISTS followups_set_updated_at ON public.followups;
CREATE TRIGGER followups_set_updated_at
  BEFORE UPDATE ON public.followups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP INDEX IF EXISTS followups_profile_id_status_due_at_idx;
CREATE INDEX followups_profile_id_status_due_at_idx
  ON public.followups (profile_id, status, due_at ASC);

ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS followups_select_own ON public.followups;
CREATE POLICY followups_select_own ON public.followups FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS followups_insert_own ON public.followups;
CREATE POLICY followups_insert_own ON public.followups FOR INSERT WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS followups_update_own ON public.followups;
CREATE POLICY followups_update_own ON public.followups FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS followups_delete_own ON public.followups;
CREATE POLICY followups_delete_own ON public.followups FOR DELETE USING (profile_id = auth.uid());

-- ============================================================
-- 9. Notifications table — EXPANDED with new types
-- ============================================================
-- IMPORTANT: Must drop and recreate to update CHECK constraint
-- This preserves existing data

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY[
    'new_request',
    'quote_sent',
    'quote_accepted',
    'quote_rejected',
    'followup_created',
    'followup_completed',
    'client_created'
  ]));

-- Indexes
DROP INDEX IF EXISTS notifications_profile_id_created_at_idx;
CREATE INDEX notifications_profile_id_created_at_idx
  ON public.notifications (profile_id, created_at DESC);

DROP INDEX IF EXISTS notifications_profile_id_unread_idx;
CREATE INDEX notifications_profile_id_unread_idx
  ON public.notifications (profile_id, created_at DESC)
  WHERE read_at IS NULL;

-- RLS (assumed already, but documenting)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own ON public.notifications FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE USING (profile_id = auth.uid());

DROP POLICY IF EXISTS notifications_delete_own ON public.notifications;
CREATE POLICY notifications_delete_own ON public.notifications FOR DELETE USING (profile_id = auth.uid());

-- ============================================================
-- 10. Trigger — new request
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_new_request()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (profile_id, type, title, message, link, reference_id)
  SELECT new.profile_id, 'new_request',
    'New quote request: ' || new.name,
    coalesce(new.company, new.email),
    '/app/requests/' || new.id,
    new.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_new_request ON public.requests;
CREATE TRIGGER notifications_new_request
  AFTER INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_request();

-- ============================================================
-- 11. Trigger — quote status change
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_quote_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF old.status IS DISTINCT FROM new.status
     AND new.status IN ('sent', 'accepted', 'rejected') THEN
    INSERT INTO public.notifications (profile_id, type, title, link, reference_id)
    SELECT new.profile_id,
      'quote_' || new.status,
      CASE new.status
        WHEN 'sent'     THEN 'Quote sent: ' || new.title
        WHEN 'accepted' THEN 'Quote accepted: ' || new.title
        WHEN 'rejected' THEN 'Quote rejected: ' || new.title
      END,
      '/app/quotes/' || new.id,
      new.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_quote_status ON public.quotes;
CREATE TRIGGER notifications_quote_status
  AFTER UPDATE OF status ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.notify_quote_status();

-- ============================================================
-- 12. Trigger — followup created
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_followup_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (profile_id, type, title, message, link, reference_id)
  SELECT new.profile_id, 'followup_created',
    'Follow-up: ' || new.subject,
    coalesce(new.notes, ''),
    '/app/followup',
    new.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_followup_created ON public.followups;
CREATE TRIGGER notifications_followup_created
  AFTER INSERT ON public.followups
  FOR EACH ROW EXECUTE FUNCTION public.notify_followup_created();

-- ============================================================
-- 13. Trigger — followup completed
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_followup_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF old.status IS DISTINCT FROM new.status AND new.status = 'done' THEN
    INSERT INTO public.notifications (profile_id, type, title, message, link, reference_id)
    SELECT new.profile_id, 'followup_completed',
      'Follow-up completed: ' || new.subject,
      coalesce(new.notes, ''),
      '/app/followup',
      new.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_followup_completed ON public.followups;
CREATE TRIGGER notifications_followup_completed
  AFTER UPDATE OF status ON public.followups
  FOR EACH ROW EXECUTE FUNCTION public.notify_followup_completed();

-- ============================================================
-- 14. Trigger — client created
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_client_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (profile_id, type, title, message, link, reference_id)
  SELECT new.profile_id, 'client_created',
    'New client: ' || new.name,
    coalesce(new.company, new.email),
    '/app/clients/' || new.id,
    new.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_client_created ON public.clients;
CREATE TRIGGER notifications_client_created
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.notify_client_created();

-- ============================================================
-- 15. Cleanup — delete read notifications older than 30 days
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE read_at IS NOT NULL
    AND read_at < now() - INTERVAL '30 days';
END;
$$;

-- To schedule automatically (optional), enable pg_cron in Supabase and run:
-- SELECT cron.schedule('cleanup-notifications', '0 0 * * *', 'SELECT public.cleanup_old_notifications()');

-- ============================================================
-- DONE
-- Run the following to verify:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
-- ============================================================
