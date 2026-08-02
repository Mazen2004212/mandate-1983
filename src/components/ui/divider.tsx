import type { ComponentPropsWithoutRef } from "react";

import { classNames } from "@/lib/class-names";

type DividerProps = ComponentPropsWithoutRef<"hr"> &
  Readonly<{
    ornament?: boolean;
  }>;

export function Divider({
  ornament = false,
  className,
  ...props
}: DividerProps) {
  return (
    <hr
      className={classNames(
        "divider",
        ornament && "divider--ornament",
        className,
      )}
      {...props}
    />
  );
}
