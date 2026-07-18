"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

type FlatResult = {
  type: "request" | "client" | "quote";
  id: string;
  label: string;
  sublabel: string;
  href: string;
};

export function SearchBar({ lang, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ requests: [], clients: [], quotes: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const flatResults: FlatResult[] = [
    ...results.requests.map((r) => ({
      type: "request" as const,
      id: r.id,
      label: r.name,
      sublabel: [r.company, r.email, r.service].filter(Boolean).join(" · "),
      href: `/${lang}/app/requests/${r.id}`,
    })),
    ...results.clients.map((c) => ({
      type: "client" as const,
      id: c.id,
      label: c.name,
      sublabel: [c.company, c.email].filter(Boolean).join(" · "),
      href: `/${lang}/app/clients/${c.id}`,
    })),
    ...results.quotes.map((q) => ({
      type: "quote" as const,
      id: q.id,
      label: q.title,
      sublabel: q.client_name ?? "",
      href: `/${lang}/app/quotes/${q.id}`,
    })),
  ];

  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ requests: [], clients: [], quotes: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);

      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownStyle({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const result = flatResults[activeIndex];
      if (result) {
        window.location.href = result.href;
        setIsOpen(false);
        setQuery("");
      }
    } else if (e.key === "Enter" && activeIndex === -1 && flatResults.length > 0) {
      window.location.href = flatResults[0].href;
      setIsOpen(false);
      setQuery("");
    }
  }

  function handleResultClick(href: string) {
    window.location.href = href;
    setIsOpen(false);
    setQuery("");
  }

  function handleInputFocus() {
    if (query.length >= 2 && flatResults.length > 0) {
      setIsOpen(true);
    }
  }

  const hasResults = flatResults.length > 0;

  const dropdown = (
    <div
      role="listbox"
      style={{
        position: "fixed",
        top: dropdownStyle?.top ?? 0,
        left: dropdownStyle?.left ?? 0,
        width: dropdownStyle?.width ?? "auto",
        zIndex: 9999,
      }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#060814]/95 backdrop-blur-xl shadow-2xl"
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
              {results.requests.map((r, i) => {
                const globalIndex = i;
                return (
                  <a
                    key={r.id}
                    href={`/${lang}/app/requests/${r.id}`}
                    role="option"
                    aria-selected={activeIndex === globalIndex}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      handleResultClick(`/${lang}/app/requests/${r.id}`);
                    }}
                    className={`flex w-full cursor-pointer flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors ${
                      activeIndex === globalIndex ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="text-sm font-medium text-white">{r.name}</span>
                    <span className="text-xs text-white/50">
                      {r.company ?? r.email}
                      {r.service && ` · ${r.service}`}
                    </span>
                  </a>
                );
              })}
            </div>
          )}

          {results.clients.length > 0 && (
            <div>
              <div className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/40">
                Clients
              </div>
              {results.clients.map((c, i) => {
                const globalIndex = results.requests.length + i;
                return (
                  <a
                    key={c.id}
                    href={`/${lang}/app/clients/${c.id}`}
                    role="option"
                    aria-selected={activeIndex === globalIndex}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      handleResultClick(`/${lang}/app/clients/${c.id}`);
                    }}
                    className={`flex w-full cursor-pointer flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors ${
                      activeIndex === globalIndex ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="text-sm font-medium text-white">{c.name}</span>
                    <span className="text-xs text-white/50">
                      {[c.company, c.email].filter(Boolean).join(" · ")}
                    </span>
                  </a>
                );
              })}
            </div>
          )}

          {results.quotes.length > 0 && (
            <div>
              <div className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/40">
                Quotes
              </div>
              {results.quotes.map((q, i) => {
                const globalIndex = results.requests.length + results.clients.length + i;
                return (
                  <a
                    key={q.id}
                    href={`/${lang}/app/quotes/${q.id}`}
                    role="option"
                    aria-selected={activeIndex === globalIndex}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      handleResultClick(`/${lang}/app/quotes/${q.id}`);
                    }}
                    className={`flex w-full cursor-pointer flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors ${
                      activeIndex === globalIndex ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="text-sm font-medium text-white">{q.title}</span>
                    {q.client_name && (
                      <span className="text-xs text-white/50">{q.client_name}</span>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex h-10 flex-1 items-center">
      <span className="pointer-events-none absolute left-3.5 flex items-center text-neutral-400 dark:text-white/40">
        <SearchIcon className="size-4" />
      </span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls="search-dropdown"
        aria-expanded={isOpen}
        autoComplete="off"
        className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-100 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:border-neutral-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/20"
      />

      {isOpen && typeof window !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
}
