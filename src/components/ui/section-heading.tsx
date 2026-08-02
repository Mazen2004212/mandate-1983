import type { ReactNode } from "react";

import { classNames } from "@/lib/class-names";

type SectionHeadingProps = Readonly<{
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  level?: 2 | 3;
  inverted?: boolean;
  className?: string;
  id?: string;
}>;

export function SectionHeading({
  title,
  eyebrow,
  description,
  level = 2,
  inverted = false,
  className,
  id,
}: SectionHeadingProps) {
  const Heading = level === 3 ? "h3" : "h2";

  return (
    <div
      className={classNames(
        "section-heading",
        inverted && "section-heading--inverted",
        className,
      )}
    >
      {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
      <Heading id={id} className="section-heading__title">
        {title}
      </Heading>
      {description ? (
        <div className="section-heading__description">{description}</div>
      ) : null}
    </div>
  );
}
