import { Section } from "../ui/Section";
import { StarIcon } from "../icons/Icons";

type TestimonialsProps = {
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{
      quote: string;
      author: string;
      role: string;
      company: string;
      initials: string;
    }>;
  };
};

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <Section
      eyebrow={testimonials.eyebrow}
      title={testimonials.title}
      description={testimonials.description}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {testimonials.items.map((t) => (
          <figure
            key={t.author}
            className="glass relative flex h-full flex-col gap-5 rounded-2xl p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            <div className="flex items-center gap-1 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="size-4" />
              ))}
            </div>
            <blockquote className="flex-1 text-[15px] leading-relaxed text-white/85">
              “{t.quote}”
            </blockquote>
            <figcaption className="flex items-center gap-3 border-t border-white/5 pt-4">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7c8cff] to-[#22d3ee] text-sm font-semibold text-white">
                {t.initials}
              </span>
              <div>
                <div className="text-sm font-semibold text-white">
                  {t.author}
                </div>
                <div className="text-xs text-white/55">
                  {t.role} · {t.company}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}