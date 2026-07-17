"use client";

import { useState, useEffect, useRef } from "react";
import { SearchIcon } from "@/app/components/icons/Icons";
import type { QuoteRequest } from "@/lib/queries/requests";
import type { Client } from "@/lib/types/client";
import type { Quote } from "@/lib/types/quote";

type SearchResultRequest = Pick<QuoteRequest, "id" | "name" | "email" | "company" | "service">;
type SearchResultClient = Pick<Client, "id" | "name" | "company" | "email">;
type SearchResultQuote = Pick<Quote, "id" | "title"> & { client_name?: string };

type SearchResults = {
  requests: SearchResultRequest[];
  clients: SearchResultClient[];
  quotes: SearchResultQuote[];
};

type SearchBarProps = {
  lang: string;
  placeholder: string;
};

export function SearchBar({ lang, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ requests: [], clients: [], quotes: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ requests: [], clients: [], quotes: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const { getSupabaseBrowser } = await import("@/lib/supabase/client");
      const supabase = getSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const q = query.toLowerCase();

      const [requestsRes, clientsRes, quotesRes] = await Promise.all([
        supabase
          .from("requests")
          .select("id, name, email, company, service")
          .eq("profile_id", user.id)
          .or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%,service.ilike.%${q}%`)
          .limit(5),
        supabase
          .from("clients")
          .select("id, name, company, email")
          .eq("profile_id", user.id)
          .or(`name.ilike.%${q}%,company.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(5),
        supabase
          .from("quotes")
          .select("id, title, client_id")
          .eq("profile_id", user.id)
          .ilike("title", `%${q}%`)
          .limit(5),
      ]);

      const quotes: SearchResultQuote[] = (quotesRes.data ?? []).map((q) => ({ id: q.id, title: q.title }));
      if (quotesRes.data && quotesRes.data.length > 0) {
        const clientIds = [...new Set(quotesRes.data.map((q) => q.client_id).filter(Boolean))];
        if (clientIds.length > 0) {
          const { data: clientsData } = await supabase
            .from("clients")
            .select("id, name")
            .in("id", clientIds);
          const clientMap = new Map((clientsData ?? []).map((c) => [c.id, c.name]));
          quotes.forEach((q) => {
            const quote = quotesRes.data?.find((qu) => qu.id === q.id);
            if (quote?.client_id && clientMap.has(quote.client_id)) {
              q.client_name = clientMap.get(quote.client_id);
            }
          });
        }
      }

      setResults({
        requests: (requestsRes.data ?? []) as SearchResultRequest[],
        clients: (clientsRes.data ?? []) as SearchResultClient[],
        quotes,
      });
      setIsOpen(true);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults = results.requests.length > 0 || results.clients.length > 0 || results.quotes.length > 0;

  function handleResultClick(href: string) {
    window.location.href = href;
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div className="relative flex h-10 flex-1 items-center">
      <span className="pointer-events-none absolute left-3.5 flex items-center text-white/40">
        <SearchIcon className="size-4" />
      </span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder:text-white/40 transition-colors focus:outline-none focus:bg-white/[0.06] focus:border-white/20"
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full z-50 mt-2 w-full min-w-80 overflow-hidden rounded-2xl glass-strong shadow-2xl"
        >
          {isLoading ? (
            <div className="flex items-center justify-center px-4 py-6 text-sm text-white/40">
              Searching...
            </div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-white/40">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto py-2">
              {results.requests.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/40">
                    Requests
                  </div>
                  {results.requests.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleResultClick(`/${lang}/app/requests/${r.id}`)}
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="text-sm font-medium text-white">{r.name}</span>
                      <span className="text-xs text-white/50">
                        {r.company ?? r.email}
                        {r.service && ` · ${r.service}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.clients.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/40">
                    Clients
                  </div>
                  {results.clients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleResultClick(`/${lang}/app/clients/${c.id}`)}
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="text-sm font-medium text-white">{c.name}</span>
                      <span className="text-xs text-white/50">
                        {c.company ?? c.email ?? ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.quotes.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/40">
                    Quotes
                  </div>
                  {results.quotes.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleResultClick(`/${lang}/app/quotes/${q.id}`)}
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="text-sm font-medium text-white">{q.title}</span>
                      {q.client_name && (
                        <span className="text-xs text-white/50">{q.client_name}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
