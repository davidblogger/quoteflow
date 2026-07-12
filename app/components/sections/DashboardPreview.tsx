import { Section } from "../ui/Section";
import { Button } from "../ui/Button";
import {
  ArrowRightIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  FilterIcon,
  InboxIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TrendUpIcon,
  UsersIcon,
} from "../icons/Icons";

type DashboardPreviewProps = {
  lang: string;
  dashboard: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    browserTab: string;
    searchPlaceholder: string;
    sidebarGroups: Array<{
      title?: string;
      items: Array<{ label: string; active?: boolean; badge?: string }>;
    }>;
    quickAction: { title: string; description: string };
    mainGreeting: string;
    mainTitle: string;
    filterCta: string;
    newQuoteCta: string;
    kpis: Array<{ label: string; note: string }>;
    tableTitle: string;
    viewAll: string;
    columns: { client: string; service: string; status: string; amount: string; ago: string };
    statuses: Record<string, string>;
    requests: Array<{
      client: string;
      company: string;
      service: string;
      statusKey: string;
      amount: string;
      time: string;
    }>;
    activityTitle: string;
    activityToday: string;
    activity: Array<{
      who: string;
      action: string;
      target: string;
      time: string;
      tone: string;
    }>;
  };
};

const ACTIVITY_DOT_FALLBACK =
  "bg-white/40 shadow-[0_0_6px_rgba(255,255,255,0.3)]";

const ACTIVITY_DOT_MAP: Record<string, string> = {
  success: "bg-success shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  cyan: "bg-accent-2 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
  violet: "bg-accent-3 shadow-[0_0_8px_rgba(167,139,250,0.6)]",
  amber: "bg-warning shadow-[0_0_8px_rgba(251,191,36,0.6)]",
  accent: "bg-accent shadow-[0_0_8px_rgba(124,140,255,0.6)]",
};

const KPI_VALUES = ["12", "8", "34", "5"] as const;
const KPI_DELTAS = ["+18%", "+4%", "+12%", "−2"] as const;
const KPI_TONES = ["cyan", "violet", "accent", "amber"] as const;

export function DashboardPreview({ lang, dashboard: d }: DashboardPreviewProps) {
  return (
    <Section
      id="dashboard"
      eyebrow={d.eyebrow}
      title={d.title}
      description={d.description}
    >
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-x-10 -top-10 -z-10 h-72 rounded-full bg-gradient-to-r from-[#7c8cff]/15 via-transparent to-[#22d3ee]/15 blur-3xl"
        />

        <div className="glass-strong relative overflow-hidden rounded-3xl p-3 sm:p-4">
          <div className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="hidden h-6 w-px bg-white/10 sm:block" />
              <div className="hidden items-center gap-1.5 text-xs text-white/55 sm:flex">
                <LogoMini />
                {d.browserTab}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-7 items-center gap-2 rounded-md border border-white/5 bg-white/[0.03] px-2.5 text-[11px] text-white/45 sm:flex">
                <SearchIcon className="size-3" />
                {d.searchPlaceholder}
              </div>
              <button
                type="button"
                aria-label="Notifications"
                className="relative inline-flex size-7 items-center justify-center rounded-md border border-white/5 bg-white/[0.03] text-white/60 hover:bg-white/10"
              >
                <BellIcon className="size-3.5" />
                <span className="absolute right-1 top-1 size-1.5 rounded-full bg-accent-2 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              </button>
              <div className="hidden h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7c8cff] to-[#22d3ee] text-[10px] font-semibold text-white sm:flex">
                DM
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 rounded-2xl bg-black/20 p-3 sm:p-5 lg:grid-cols-[220px_1fr]">
            <Sidebar groups={d.sidebarGroups} quickAction={d.quickAction} />
            <DashboardMain dashboard={d} />
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Button href={`/${lang}/solicitar`} size="lg">
          {d.cta}
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </Section>
  );
}

function Sidebar({
  groups,
  quickAction,
}: {
  groups: DashboardPreviewProps["dashboard"]["sidebarGroups"];
  quickAction: DashboardPreviewProps["dashboard"]["quickAction"];
}) {
  return (
    <aside className="hidden flex-col gap-4 rounded-xl bg-white/[0.02] p-3 lg:flex">
      {groups.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-1">
          {group.title && (
            <div className="px-3 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/35">
              {group.title}
            </div>
          )}
          {group.items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                item.active
                  ? "bg-white/[0.07] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white/85"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={item.active ? "text-accent-2" : "text-white/50"}>
                  <SidebarIcon name={item.label} />
                </span>
                {item.label}
              </span>
              {item.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                    item.active
                      ? "bg-accent-2/20 text-accent-2"
                      : "bg-white/[0.06] text-white/55"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}

      <div className="mt-auto rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg gradient-accent text-white">
            <PlusIcon className="size-3.5" />
          </span>
          <div className="text-xs font-medium text-white">{quickAction.title}</div>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-white/55">
          {quickAction.description}
        </p>
      </div>
    </aside>
  );
}

function SidebarIcon({ name }: { name: string }) {
  if (name === "Dashboard" || name === "Dashboard") {
    return <DashIcon />;
  }
  if (name === "Solicitudes" || name === "Requests") {
    return <InboxIcon className="size-3.5" />;
  }
  if (name === "Cotizaciones" || name === "Quotes") {
    return <FileIcon />;
  }
  if (name === "Clientes" || name === "Clients") {
    return <UsersIcon className="size-3.5" />;
  }
  if (name === "Pendientes" || name === "Pending") {
    return <ClockIcon className="size-3.5" />;
  }
  if (name === "Cerradas" || name === "Closed") {
    return <CheckCircleIcon className="size-3.5" />;
  }
  if (name === "Reportes" || name === "Reports") {
    return <ChartSmall />;
  }
  if (name === "Ajustes" || name === "Settings") {
    return <SettingsIcon className="size-3.5" />;
  }
  return <span className="size-1.5 rounded-full bg-current" />;
}

function DashboardMain({ dashboard: d }: { dashboard: DashboardPreviewProps["dashboard"] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-white/50">{d.mainGreeting}</div>
          <h3 className="mt-0.5 text-lg font-semibold text-white">
            {d.mainTitle}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/70 hover:bg-white/[0.08] hover:text-white"
          >
            <FilterIcon className="size-3" />
            {d.filterCta}
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-full gradient-accent px-3 text-xs font-medium text-white shadow-[0_6px_18px_-6px_rgba(124,140,255,0.55)]"
          >
            <PlusIcon className="size-3" />
            {d.newQuoteCta}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {d.kpis.map((kpi, i) => (
          <BigKpi
            key={kpi.label}
            label={kpi.label}
            value={KPI_VALUES[i]}
            delta={KPI_DELTAS[i]}
            tone={KPI_TONES[i]}
            note={kpi.note}
          />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <RequestsTable dashboard={d} />
        <ActivityFeed dashboard={d} />
      </div>
    </div>
  );
}

function BigKpi({
  label,
  value,
  delta,
  tone,
  note,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "accent" | "cyan" | "violet" | "amber";
  note: string;
}) {
  const toneClasses = {
    accent: "from-[#7c8cff]/25 to-transparent",
    cyan: "from-[#22d3ee]/25 to-transparent",
    violet: "from-[#a78bfa]/25 to-transparent",
    amber: "from-[#fbbf24]/25 to-transparent",
  } as const;
  const dot = {
    accent: "bg-[#7c8cff]",
    cyan: "bg-[#22d3ee]",
    violet: "bg-[#a78bfa]",
    amber: "bg-[#fbbf24]",
  } as const;
  const isNegative = delta.startsWith("−");

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br ${toneClasses[tone]} blur-2xl`}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[11px] text-white/55">{label}</span>
        <span className={`size-2 rounded-full ${dot[tone]}`} />
      </div>
      <div className="relative mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-white">
          {value}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
            isNegative ? "text-warning" : "text-success"
          }`}
        >
          {!isNegative && <TrendUpIcon className="size-3" />}
          {delta}
        </span>
      </div>
      <div className="relative mt-1 text-[11px] text-white/45">{note}</div>
    </div>
  );
}

function RequestsTable({ dashboard: d }: { dashboard: DashboardPreviewProps["dashboard"] }) {
  const toneClasses: Record<string, string> = {
    pending: "bg-warning/10 text-warning ring-warning/20",
    sent: "bg-accent-2/10 text-accent-2 ring-accent-2/20",
    review: "bg-accent-3/10 text-accent-3 ring-accent-3/20",
    accepted: "bg-success/10 text-success ring-success/20",
  };

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white">{d.tableTitle}</div>
        <a href="#" className="text-[11px] text-white/45 hover:text-white/80">
          {d.viewAll}
        </a>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-white/5">
        <div className="hidden grid-cols-[1.4fr_1.6fr_1fr_0.8fr_0.6fr] gap-3 border-b border-white/5 bg-white/[0.02] px-3 py-2 text-[10px] uppercase tracking-wider text-white/40 sm:grid">
          <div>{d.columns.client}</div>
          <div>{d.columns.service}</div>
          <div>{d.columns.status}</div>
          <div className="text-right">{d.columns.amount}</div>
          <div className="text-right">{d.columns.ago}</div>
        </div>
        <ul className="divide-y divide-white/5">
          {d.requests.map((req) => (
            <li
              key={req.client}
              className="grid grid-cols-1 gap-2 px-3 py-2.5 text-xs text-white/80 transition-colors hover:bg-white/[0.02] sm:grid-cols-[1.4fr_1.6fr_1fr_0.8fr_0.6fr] sm:items-center sm:gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c8cff] to-[#22d3ee] text-[10px] font-semibold text-white">
                  {req.client
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-white">
                    {req.client}
                  </div>
                  <div className="truncate text-[11px] text-white/45">
                    {req.company}
                  </div>
                </div>
              </div>
              <div className="truncate text-[12px] text-white/70">
                {req.service}
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${toneClasses[req.statusKey] ?? toneClasses.pending}`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {d.statuses[req.statusKey]}
                </span>
              </div>
              <div className="text-left font-medium tabular-nums text-white sm:text-right">
                {req.amount}
              </div>
              <div className="text-left text-[11px] text-white/45 sm:text-right">
                {req.time}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ActivityFeed({ dashboard: d }: { dashboard: DashboardPreviewProps["dashboard"] }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white">{d.activityTitle}</div>
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          {d.activityToday}
        </span>
      </div>
      <ul className="mt-3 flex flex-col">
        {d.activity.map((item, i) => (
          <li key={i} className="relative flex gap-3 pb-3 last:pb-0">
            {i !== d.activity.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[7px] top-4 h-[calc(100%-12px)] w-px bg-white/10"
              />
            )}
            <span
              className={`mt-1.5 size-[14px] shrink-0 rounded-full ring-4 ring-[#060814]/80 ${ACTIVITY_DOT_MAP[item.tone] ?? ACTIVITY_DOT_FALLBACK}`}
            />
            <div className="flex flex-1 flex-col">
              <span className="text-[12px] text-white/85">
                <span className="font-medium text-white">{item.who}</span>{" "}
                {item.action}{" "}
                <span className="text-white/70">“{item.target}”</span>
              </span>
              <span className="mt-0.5 text-[10px] text-white/40">
                {item.time}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LogoMini() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <defs>
        <linearGradient id="dp-mini-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#7c8cff" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M5 5h10a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h11"
        stroke="url(#dp-mini-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-3.5">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-3.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ChartSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-3.5">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-6" />
    </svg>
  );
}