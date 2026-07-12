import { Section } from "../ui/Section";
import { IconBadge } from "../ui/IconBadge";
import {
  ChartIcon,
  InboxIcon,
  LayersIcon,
  UsersIcon,
} from "../icons/Icons";

type BenefitsProps = {
  benefits: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
};

const ICONS = [
  <InboxIcon className="size-6" key="inbox" />,
  <ChartIcon className="size-6" key="chart" />,
  <UsersIcon className="size-6" key="users" />,
  <LayersIcon className="size-6" key="layers" />,
];

const TONES = ["cyan", "accent", "violet", "amber"] as const;

export function Benefits({ benefits }: BenefitsProps) {
  return (
    <Section
      id="beneficios"
      eyebrow={benefits.eyebrow}
      title={benefits.title}
      description={benefits.description}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.items.map((benefit, i) => (
          <div
            key={benefit.title}
            className="glass group relative overflow-hidden rounded-2xl p-6 transition-colors hover:border-white/15"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br from-white/[0.04] to-transparent blur-2xl transition-opacity group-hover:opacity-80"
            />
            <div className="relative flex flex-col gap-4">
              <IconBadge tone={TONES[i % TONES.length]}>{ICONS[i % ICONS.length]}</IconBadge>
              <h3 className="text-base font-semibold leading-snug text-white">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}