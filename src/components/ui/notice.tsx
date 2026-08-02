import type { ComponentPropsWithoutRef } from "react";

import { classNames } from "@/lib/class-names";

type NoticeVariant = "information" | "success" | "warning" | "danger";

type NoticeProps = ComponentPropsWithoutRef<"aside"> &
  Readonly<{
    title: string;
    variant?: NoticeVariant;
  }>;

export function Notice({
  title,
  variant = "information",
  className,
  children,
  ...props
}: NoticeProps) {
  return (
    <aside
      className={classNames("notice", `notice--${variant}`, className)}
      {...props}
    >
      <span aria-hidden="true" className="notice__mark">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M12 3 21 8v8l-9 5-9-5V8l9-5Z" />
          <path d="M12 7v6M12 16.5v.5" />
        </svg>
      </span>
      <div>
        <p className="notice__title">{title}</p>
        <div className="notice__content">{children}</div>
      </div>
    </aside>
  );
}
