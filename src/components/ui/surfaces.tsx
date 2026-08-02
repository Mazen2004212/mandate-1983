import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { classNames } from "@/lib/class-names";

type SurfaceProps = ComponentPropsWithoutRef<"section">;

export const PaperPanel = forwardRef<HTMLElement, SurfaceProps>(
  function PaperPanel({ className, children, ...props }, ref) {
    return (
      <section
        ref={ref}
        className={classNames("paper-panel", className)}
        {...props}
      >
        {children}
      </section>
    );
  },
);

export const DarkPanel = forwardRef<HTMLElement, SurfaceProps>(
  function DarkPanel({ className, children, ...props }, ref) {
    return (
      <section
        ref={ref}
        className={classNames("dark-panel", className)}
        {...props}
      >
        {children}
      </section>
    );
  },
);
