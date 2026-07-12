import type { ReactNode } from "react";
import { Container } from "./Container";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  children: ReactNode;
  className?: string;
  containerSize?: "default" | "narrow" | "wide";
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  children,
  className = "",
  containerSize = "default",
}: SectionProps) {
  const headerAlign = align === "center" ? "items-center text-center" : "items-start text-left";
  const headerMaxWidth = align === "center" ? "max-w-3xl" : "max-w-3xl";

  return (
    <section
      id={id}
      className={`relative py-20 sm:py-28 lg:py-32 ${className}`}
    >
      <Container size={containerSize}>
        {(eyebrow || title || description) && (
          <div className={`flex flex-col gap-5 ${headerAlign} ${headerMaxWidth} ${align === "center" ? "mx-auto" : ""} mb-14 sm:mb-16`}>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-accent-2 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}