import type { ReactNode } from "react";

import { classNames } from "@/lib/class-names";

type BrandMarkProps = Readonly<{
  className?: string;
}>;

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span aria-hidden="true" className={classNames("brand-mark", className)}>
      <svg viewBox="0 0 48 48" focusable="false">
        <path d="M24 3 42 12v14c0 9.6-7.5 16-18 19C13.5 42 6 35.6 6 26V12L24 3Z" />
        <path d="M15 17h18M17 23h14M20 29h8" />
        <path d="M24 10v24" />
      </svg>
    </span>
  );
}

type InstitutionalHeaderProps = Readonly<{
  status?: ReactNode;
  classification?: string;
}>;

export function InstitutionalHeader({
  status,
  classification = "Office of the President",
}: InstitutionalHeaderProps) {
  return (
    <header className="institutional-header">
      <div className="institutional-header__brand">
        <BrandMark />
        <div>
          <p className="institutional-header__country">Republic of Varenne</p>
          <p className="institutional-header__office">{classification}</p>
        </div>
      </div>
      <div className="institutional-header__status">{status}</div>
    </header>
  );
}

type ApplicationShellProps = Readonly<{
  children: ReactNode;
  header: ReactNode;
  navigation?: ReactNode;
  contextPanel?: ReactNode;
  metadataStrip?: ReactNode;
  mainId?: string;
  className?: string;
}>;

export function ApplicationShell({
  children,
  header,
  navigation,
  contextPanel,
  metadataStrip,
  mainId = "main-content",
  className,
}: ApplicationShellProps) {
  return (
    <div className={classNames("application-shell", className)}>
      <a className="skip-link" href={`#${mainId}`}>
        Skip to main content
      </a>
      {header}
      <div
        className={classNames(
          "application-shell__body",
          Boolean(navigation) && "application-shell__body--with-navigation",
          Boolean(contextPanel) && "application-shell__body--with-context",
        )}
      >
        {navigation ? (
          <aside
            aria-label="Application navigation"
            className="application-shell__navigation"
          >
            {navigation}
          </aside>
        ) : null}
        <main id={mainId} className="application-shell__main">
          {children}
        </main>
        {contextPanel ? (
          <aside
            aria-label="Contextual information"
            className="application-shell__context"
          >
            {contextPanel}
          </aside>
        ) : null}
      </div>
      {metadataStrip ? (
        <footer className="application-shell__metadata">{metadataStrip}</footer>
      ) : null}
    </div>
  );
}
