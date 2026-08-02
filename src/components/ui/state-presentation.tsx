import type { ReactNode } from "react";

import { classNames } from "@/lib/class-names";

type StateVariant = "loading" | "empty" | "error" | "unauthorized";

type StatePresentationProps = Readonly<{
  variant: StateVariant;
  title: string;
  description: string;
  action?: ReactNode;
}>;

export function StatePresentation({
  variant,
  title,
  description,
  action,
}: StatePresentationProps) {
  const isLoading = variant === "loading";

  return (
    <section
      aria-busy={isLoading || undefined}
      aria-live={isLoading ? "polite" : undefined}
      className={classNames(
        "state-presentation",
        `state-presentation--${variant}`,
      )}
    >
      <span aria-hidden="true" className="state-presentation__icon">
        <svg viewBox="0 0 48 48" focusable="false">
          <path d="M8 9h32v30H8z" />
          <path d="M14 16h20M14 23h20M14 30h12" />
          {variant === "loading" ? <path d="M32 28v7h7" /> : null}
          {variant === "error" ? <path d="M34 14 14 34M14 14l20 20" /> : null}
          {variant === "unauthorized" ? (
            <path d="M18 22v-4a6 6 0 0 1 12 0v4M16 22h16v12H16z" />
          ) : null}
        </svg>
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        {action ? (
          <div className="state-presentation__action">{action}</div>
        ) : null}
      </div>
    </section>
  );
}

type NamedStateProps = Readonly<{
  title?: string;
  description?: string;
  action?: ReactNode;
}>;

export function LoadingPresentation({
  title = "Preparing the record",
  description = "The institutional record is being assembled. Its layout remains stable while the request completes.",
}: NamedStateProps) {
  return (
    <StatePresentation
      variant="loading"
      title={title}
      description={description}
    />
  );
}

export function EmptyStatePresentation({
  title = "No records are available",
  description = "This section will explain what creates a record when the connected system is implemented.",
  action,
}: NamedStateProps) {
  return (
    <StatePresentation
      variant="empty"
      title={title}
      description={description}
      action={action}
    />
  );
}

export function ErrorStatePresentation({
  title = "The record could not be opened",
  description = "Your progress is unchanged. Try the request again or return to the previous safe screen.",
  action,
}: NamedStateProps) {
  return (
    <StatePresentation
      variant="error"
      title={title}
      description={description}
      action={action}
    />
  );
}

export function UnauthorizedStatePresentation({
  title = "Authorization is required",
  description = "This protected record cannot be displayed without an authorized session.",
  action,
}: NamedStateProps) {
  return (
    <StatePresentation
      variant="unauthorized"
      title={title}
      description={description}
      action={action}
    />
  );
}
