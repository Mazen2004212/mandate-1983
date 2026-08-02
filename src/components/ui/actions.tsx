import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { classNames } from "@/lib/class-names";

type ButtonProps = ComponentPropsWithoutRef<"button"> &
  Readonly<{
    isLoading?: boolean;
    loadingLabel?: string;
  }>;

function ButtonContent({
  children,
  isLoading,
  loadingLabel,
}: Readonly<{
  children: ReactNode;
  isLoading: boolean;
  loadingLabel: string;
}>) {
  return (
    <>
      {isLoading ? (
        <span aria-hidden="true" className="button__loader" />
      ) : null}
      <span>{isLoading ? loadingLabel : children}</span>
    </>
  );
}

export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function PrimaryButton(
    {
      className,
      children,
      disabled,
      isLoading = false,
      loadingLabel = "Working",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        aria-busy={isLoading || undefined}
        className={classNames("button", "button--primary", className)}
        disabled={disabled || isLoading}
        {...props}
      >
        <ButtonContent isLoading={isLoading} loadingLabel={loadingLabel}>
          {children}
        </ButtonContent>
      </button>
    );
  },
);

export const SecondaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function SecondaryButton(
    {
      className,
      children,
      disabled,
      isLoading = false,
      loadingLabel = "Working",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        aria-busy={isLoading || undefined}
        className={classNames("button", "button--secondary", className)}
        disabled={disabled || isLoading}
        {...props}
      >
        <ButtonContent isLoading={isLoading} loadingLabel={loadingLabel}>
          {children}
        </ButtonContent>
      </button>
    );
  },
);

export const TextLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<"a">
>(function TextLink({ className, children, ...props }, ref) {
  return (
    <a ref={ref} className={classNames("text-link", className)} {...props}>
      <span>{children}</span>
      <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
        <path d="M4 10h11M11 6l4 4-4 4" />
      </svg>
    </a>
  );
});
