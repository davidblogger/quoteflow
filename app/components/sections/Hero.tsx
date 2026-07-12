import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BellIcon,
  ChartIcon,
  CheckCircleIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  TrendUpIcon,
} from "../icons/Icons";

type HeroProps = {
  hero: {
    badge: string;
    titlePart1: string;
    titleAccent: string;
    titlePart2: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    bullets: string[];
    mockBrowserUrl: string;
    mockSummaryPrefix: string;
    mockSummaryHighlight: string;
    mockNewQuoteCta: string;
    mockKpiRequests: string;
    mockKpiQuotes: string;
    mockKpiClients: string;
    mockActivityTitle: string;
    mockActivitySubtitle: string;
    mockFunnelTitle: string;
    mockFunnelReceived: string;
    mockFunnelInProgress: string;
    mockFunnelSent: string;
    mockFunnelClosed: string;
    mockFloatingNew: string;
    mockFloatingNewSub: string;
    mockFloatingAccepted: string;
    mockFloatingAcceptedSub: string;
    mockPlanTitle: string;
    mockPlanName: string;
    mockPlanUsage: string;
    mockSidebarDashboard: string;
    mockSidebarRequests: string;
    mockSidebarQuotes: string;
    mockSidebarClients: string;
  };
};

export function Hero({ hero }: HeroProps) {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-24 lg:pb-32"
    >
      <Container size="wide">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-md">
            <SparklesIcon className="size-3.5 text-accent-2" />
            {hero.badge}
          </span>

          <h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[68px]">
            {hero.titlePart1}{" "}
            <span className="gradient-text">{hero.titleAccent}</span>{" "}
            {hero.titlePart2}
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
            {hero.subtitle}
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button href="#contacto" size="lg">
              {hero.primaryCta}
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button href="#como-funciona" variant="secondary" size="lg">
              {hero.secondaryCta}
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
            {hero.bullets.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <CheckCircleIcon className="size-3.5 text-success" />
                {b}
              </span>
            ))}
          </div>
        </div>

        <HeroDashboardMock hero={hero} />
      </Container>
    </section>
  );
}

function HeroDashboardMock({ hero }: { hero: HeroProps["hero"] }) {
  const funnel = [
    { label: hero.mockFunnelReceived, value: 100, color: "from-[#7c8cff] to-[#22d3ee]" },
    { label: hero.mockFunnelInProgress, value: 72, color: "from-[#7c8cff]/70 to-[#22d3ee]/70" },
    { label: hero.mockFunnelSent, value: 48, color: "from-[#a78bfa] to-[#7c8cff]" },
    { label: hero.mockFunnelClosed, value: 26, color: "from-[#22d3ee] to-[#34d399]" },
  ];

  const sidebar = [
    { label: hero.mockSidebarDashboard, active: true },
    { label: hero.mockSidebarRequests },
    { label: hero.mockSidebarQuotes },
    { label: hero.mockSidebarClients },
  ];

  return (
    <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
      <div
        aria-hidden
        className="absolute -top-20 left-1/2 -z-10 h-72 w-[120%] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7c8cff]/30 via-[#22d3ee]/20 to-[#a78bfa]/30 blur-3xl"
      />

      <div className="glass-strong relative overflow-hidden rounded-3xl p-3 sm:p-4">
        <div className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="hidden flex-1 px-6 sm:block">
            <div className="mx-auto flex h-7 max-w-sm items-center justify-center gap-2 rounded-md bg-white/[0.04] text-[11px] text-white/40">
              <SearchIcon className="size-3" />
              {hero.mockBrowserUrl}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <BellIcon className="size-3.5" />
            <span className="size-2 rounded-full bg-success shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
        </div>

        <div className="mt-3 grid gap-3 rounded-2xl bg-black/20 p-3 sm:p-5 lg:grid-cols-[200px_1fr]">
          <aside className="hidden flex-col gap-1 rounded-xl bg-white/[0.02] p-3 lg:flex">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-xs text-white">
              <ChartIcon className="size-3.5 text-accent-2" />
              {hero.mockSidebarDashboard}
            </div>
            {sidebar.slice(1).map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                  i === 0 ? "text-white/80" : "text-white/45"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    i === 0 ? "bg-accent-2" : "bg-white/20"
                  }`}
                />
                {item.label}
              </div>
            ))}
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/40">
                {hero.mockPlanTitle}
              </div>
              <div className="mt-1 text-sm font-medium text-white">
                {hero.mockPlanName}
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/10">
                <div className="h-1 w-3/4 rounded-full bg-gradient-to-r from-[#7c8cff] to-[#22d3ee]" />
              </div>
              <div className="mt-1.5 text-[10px] text-white/40">
                {hero.mockPlanUsage}
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/50">
                  {hero.mockActivitySubtitle}
                </div>
                <div className="mt-0.5 text-base font-medium text-white">
                  {hero.mockSummaryPrefix}{" "}
                  <span className="text-accent-2">
                    {hero.mockSummaryHighlight}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="hidden items-center gap-1.5 rounded-full gradient-accent px-3 py-1.5 text-xs font-medium text-white sm:inline-flex"
              >
                <PlusIcon className="size-3.5" />
                {hero.mockNewQuoteCta}
              </button>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <MiniKpi
                label={hero.mockKpiRequests}
                value="12"
                delta="+18%"
                tone="cyan"
                icon={<InboxSmall />}
              />
              <MiniKpi
                label={hero.mockKpiQuotes}
                value="8"
                delta="+4%"
                tone="violet"
                icon={<FileSmall />}
              />
              <MiniKpi
                label={hero.mockKpiClients}
                value="34"
                delta="+12%"
                tone="accent"
                icon={<UsersSmall />}
              />
            </div>

            <div className="grid gap-2.5 sm:grid-cols-[1.5fr_1fr]">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">
                    {hero.mockActivityTitle}
                  </div>
                  <span className="text-[10px] text-white/40">
                    {hero.mockActivitySubtitle}
                  </span>
                </div>
                <Chart />
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">{hero.mockFunnelTitle}</div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-success">
                    <TrendUpIcon className="size-3" /> +9%
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  {funnel.map((row) => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="w-16 text-[10px] text-white/50">
                        {row.label}
                      </span>
                      <div className="h-1.5 flex-1 rounded-full bg-white/[0.04]">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${row.color}`}
                          style={{ width: `${row.value}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[10px] tabular-nums text-white/70">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingChip
        className="absolute -left-6 top-24 hidden animate-float-slow sm:flex"
        icon={<InboxSmall />}
        title={hero.mockFloatingNew}
        subtitle={hero.mockFloatingNewSub}
      />
      <FloatingChip
        className="absolute -right-4 top-44 hidden animate-float-slower sm:flex"
        icon={<CheckSmall />}
        title={hero.mockFloatingAccepted}
        subtitle={hero.mockFloatingAcceptedSub}
      />
    </div>
  );
}

function MiniKpi({
  label,
  value,
  delta,
  tone,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "accent" | "cyan" | "violet";
  icon: React.ReactNode;
}) {
  const toneColors = {
    accent: "from-[#7c8cff]/30 to-transparent text-[#c7d2fe]",
    cyan: "from-[#22d3ee]/30 to-transparent text-[#a5f3fc]",
    violet: "from-[#a78bfa]/30 to-transparent text-[#ddd6fe]",
  } as const;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div
        className={`absolute -right-6 -top-6 size-16 rounded-full bg-gradient-to-br blur-xl ${toneColors[tone]}`}
      />
      <div className="relative flex items-center justify-between">
        <span className="inline-flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80">
          {icon}
        </span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
          <TrendUpIcon className="size-2.5" />
          {delta}
        </span>
      </div>
      <div className="relative mt-2 text-xl font-semibold text-white tabular-nums">
        {value}
      </div>
      <div className="relative text-[11px] text-white/50">{label}</div>
    </div>
  );
}

function Chart() {
  const points = [4, 6, 5, 9, 7, 12, 10, 14, 11, 16, 13, 18];
  const max = Math.max(...points);
  const w = 240;
  const h = 70;
  const stepX = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * stepX;
      const y = h - (p / max) * (h - 6) - 2;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div className="relative mt-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-20 w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hero-chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c8cff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-chart-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c8cff" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#hero-chart-area)" />
        <path
          d={path}
          fill="none"
          stroke="url(#hero-chart-line)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function FloatingChip({
  className,
  icon,
  title,
  subtitle,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={`glass-strong pointer-events-none flex items-center gap-3 rounded-2xl px-3.5 py-2.5 ${className}`}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-xl gradient-accent text-white shadow-[0_8px_24px_-8px_rgba(124,140,255,0.6)]">
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-white">{title}</span>
        <span className="text-[10px] text-white/55">{subtitle}</span>
      </div>
      <ArrowUpRightIcon className="size-3.5 text-white/40" />
    </div>
  );
}

function InboxSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-3.5">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}

function FileSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-3.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function UsersSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-3.5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}

function CheckSmall() {
  return <CheckCircleIcon className="size-4" />;
}