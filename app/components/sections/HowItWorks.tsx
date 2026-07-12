import { Section } from "../ui/Section";

type HowItWorksProps = {
  howItWorks: {
    eyebrow: string;
    title: string;
    description: string;
    steps: Array<{ title: string; description: string }>;
  };
};

export function HowItWorks({ howItWorks }: HowItWorksProps) {
  return (
    <Section
      id="como-funciona"
      eyebrow={howItWorks.eyebrow}
      title={howItWorks.title}
      description={howItWorks.description}
    >
      <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block"
        />
        {howItWorks.steps.map((step, i) => (
          <li
            key={step.title}
            className="glass relative flex flex-col gap-3 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold tabular-nums text-white/80">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            </div>
            <h3 className="text-base font-semibold leading-snug text-white">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-white/60">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}