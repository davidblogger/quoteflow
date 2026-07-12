import { Container } from "@/app/components/ui/Container";
import { Button } from "@/app/components/ui/Button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(124,140,255,0.18),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <Container size="narrow" className="text-center">
        <div className="glass-strong mx-auto inline-flex flex-col items-center gap-6 rounded-3xl px-8 py-12 sm:px-14 sm:py-16">
          <span className="text-7xl font-semibold tracking-tight gradient-text sm:text-8xl">
            404
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-accent-2 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
            Error 404
          </span>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            We couldn&apos;t find that page
          </h1>
          <p className="max-w-md text-pretty text-base leading-relaxed text-white/65">
            The page you are looking for may have moved, been renamed, or never
            existed.
          </p>
          <Button href="/en" size="lg">
            Back to home
          </Button>
        </div>
      </Container>
    </main>
  );
}