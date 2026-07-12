import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRightIcon, CheckCircleIcon, SparklesIcon } from "../icons/Icons";

type CtaFinalProps = {
  ctaFinal: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    bullets: string[];
  };
};

export function CtaFinal({ ctaFinal }: CtaFinalProps) {
  return (
    <section id="contacto" className="relative py-20 sm:py-28">
      <Container size="default">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-white/[0.01] p-8 backdrop-blur-xl sm:p-12 lg:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-[120%] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7c8cff]/30 via-[#22d3ee]/25 to-[#a78bfa]/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_55%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 -z-10 size-64 rounded-full bg-gradient-to-br from-[#a78bfa]/20 to-transparent blur-3xl"
          />

          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/80 backdrop-blur-md">
              <SparklesIcon className="size-3.5 text-accent-2" />
              {ctaFinal.badge}
            </span>

            <h2 className="mt-6 text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {ctaFinal.title}
            </h2>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
              {ctaFinal.description}
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Button href="#" size="lg">
                {ctaFinal.primaryCta}
                <ArrowRightIcon className="size-4" />
              </Button>
              <Button href="#como-funciona" variant="secondary" size="lg">
                {ctaFinal.secondaryCta}
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/55">
              {ctaFinal.bullets.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5">
                  <CheckCircleIcon className="size-3.5 text-success" />
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}