import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
};

const sizeMap = {
  narrow: "max-w-5xl",
  default: "max-w-7xl",
  wide: "max-w-[88rem]",
};

export function Container({
  children,
  className = "",
  size = "default",
}: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-6 sm:px-8 lg:px-10 ${sizeMap[size]} ${className}`}>
      {children}
    </div>
  );
}