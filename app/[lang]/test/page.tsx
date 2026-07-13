import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (e) {
    return (
      <div className="min-h-screen bg-[#060814] p-6 font-mono text-sm text-white">
        <div className="glass-strong mx-auto max-w-2xl rounded-2xl p-6">
          <h2 className="mb-3 text-lg font-semibold text-danger">
            Setup error
          </h2>
          <pre className="whitespace-pre-wrap text-white/80">
            {e instanceof Error ? e.message : String(e)}
          </pre>
        </div>
      </div>
    );
  }

  const { data, error } = await supabase.from("profiles").select("*");

  if (error) {
    return (
      <div className="min-h-screen bg-[#060814] p-6 font-mono text-sm text-white">
        <div className="glass-strong mx-auto max-w-2xl rounded-2xl p-6">
          <h2 className="mb-3 text-lg font-semibold text-danger">
            Supabase query error
          </h2>
          <p className="text-white/70">
            <strong>Code:</strong> {error.code}
          </p>
          <p className="text-white/70">
            <strong>Message:</strong> {error.message}
          </p>
          <p className="text-white/70">
            <strong>Hint:</strong> {error.hint ?? "—"}
          </p>
          <hr className="my-4 border-white/10" />
          <p className="text-white/60">Causas comunes:</p>
          <ul className="ml-5 list-disc text-white/60">
            <li>
              La tabla <code>profiles</code> no existe (créala en Supabase SQL
              Editor)
            </li>
            <li>RLS habilitado sin policy de SELECT para el rol anon</li>
            <li>URL o anon key incorrectos en .env.local</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060814] p-6 font-mono text-sm text-white">
      <div className="glass-strong mx-auto max-w-2xl rounded-2xl p-6">
        <h2 className="mb-3 text-lg font-semibold text-success">
          OK — {data?.length ?? 0} rows
        </h2>
        <pre className="overflow-x-auto whitespace-pre-wrap text-white/80">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}