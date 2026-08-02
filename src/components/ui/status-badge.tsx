import type { ComponentPropsWithoutRef } from "react";

import { classNames } from "@/lib/class-names";

export type StatusBadgeVariant =
  "established" | "in-progress" | "limited" | "unavailable";

type StatusBadgeProps = ComponentPropsWithoutRef<"span"> &
  Readonly<{
    variant?: StatusBadgeVariant;
  }>;

export function StatusBadge({
  variant = "in-progress",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={classNames(
        "status-badge",
        `status-badge--${variant}`,
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="status-badge__mark" />
      <span>{children}</span>
    </span>
  );
}
