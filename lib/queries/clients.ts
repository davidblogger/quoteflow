import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import type {
  Client,
  ClientInsert,
  ClientUpdate,
  ClientStatus,
} from "@/lib/types/client";

export type { Client, ClientInsert, ClientUpdate, ClientStatus } from "@/lib/types/client";

export async function listClients(profileId: string): Promise<Client[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Client[];
}

export async function getClientById(
  profileId: string,
  id: string,
): Promise<Client | null> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Client;
}

export async function createClient(
  profileId: string,
  input: ClientInsert,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      profile_id: profileId,
      name: input.name,
      company: input.company ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[QuoteFlow] create client failed", {
      code: error?.code,
      message: error?.message,
    });
    return { ok: false, error: error?.message };
  }
  return { ok: true, id: data.id };
}

export async function updateClient(
  profileId: string,
  id: string,
  input: ClientUpdate,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("clients")
    .update({
      name: input.name,
      company: input.company ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
    })
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) {
    console.error("[QuoteFlow] update client failed", {
      id,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function updateClientStatus(
  profileId: string,
  id: string,
  status: ClientStatus,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("clients")
    .update({ status })
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) {
    console.error("[QuoteFlow] update client status failed", {
      id,
      status,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteClient(
  profileId: string,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) {
    console.error("[QuoteFlow] delete client failed", {
      id,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}