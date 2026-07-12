import { Section } from "../ui/Section";
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  HammerIcon,
  LightbulbIcon,
  WrenchIcon,
} from "../icons/Icons";

type ServicesProps = {
  services: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
};

const ICONS = [
  <BriefcaseIcon className="size-5" key="briefcase" />,
  <HammerIcon className="size-5" key="hammer" />,
  <WrenchIcon className="size-5" key="wrench" />,
  <BuildingIcon className="size-5" key="building" />,
  <LightbulbIcon className="size-5" key="lightbulb" />,
  <ArrowUpRightIcon className="size-5" key="arrow" />,
];

export function Services({ services }: ServicesProps) {
  return (
    <Section
      id="servicios"
      eyebrow={services.eyebrow}
      title={services.title}
      description={services.description}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.items.map((service, i) => (
          <a
            key={service.title}
            href="#contacto"
            className="glass group relative flex flex-col gap-4 overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/85 transition-colors group-hover:border-white/20 group-hover:text-white">
                {ICONS[i % ICONS.length]}
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white">
                <ArrowUpRightIcon className="size-3.5" />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold leading-snug text-white">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {service.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}