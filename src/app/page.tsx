import {
  ApplicationShell,
  BrandMark,
  InstitutionalHeader,
} from "@/components/ui/application-shell";
import { TextLink } from "@/components/ui/actions";
import { Divider } from "@/components/ui/divider";
import { MetadataRow } from "@/components/ui/metadata-row";
import { Notice } from "@/components/ui/notice";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaperPanel } from "@/components/ui/surfaces";

const foundationMetadata = [
  {
    label: "Application stage",
    value: "Foundation established",
    detail: "Technical and visual systems only",
  },
  {
    label: "Playable release",
    value: "In development",
    detail: "No gameplay route is available yet",
  },
  {
    label: "Current jurisdiction",
    value: "Republic of Varenne",
    detail: "Original fictional setting",
  },
  {
    label: "Interface standard",
    value: "Institutional dossier",
    detail: "Responsive and accessibility-led",
  },
] as const;

const officeSections = [
  { label: "Foundation file", status: "Current", current: true },
  { label: "Presidential desk", status: "Coming soon", current: false },
  { label: "Cabinet chamber", status: "Coming soon", current: false },
  { label: "National map", status: "Coming soon", current: false },
  { label: "Diplomatic office", status: "Not available", current: false },
  { label: "State archive", status: "Not available", current: false },
] as const;

const availableSystems = [
  "Visual design language",
  "Responsive application shell",
  "Accessible interface primitives",
  "Foundation status reporting",
] as const;

const unavailableSystems = [
  "Player accounts and authentication",
  "Save creation and management",
  "Scenarios and political decisions",
  "Characters and production portraits",
] as const;

function OfficeNavigation() {
  return (
    <nav aria-label="Presidential office sections" className="office-index">
      <div className="office-index__heading">
        <p>Office index</p>
        <span>Foundation build</span>
      </div>
      <ol className="office-index__list">
        {officeSections.map((section, index) => (
          <li
            className={
              section.current ? "office-index__item--current" : undefined
            }
            key={section.label}
          >
            {section.current ? (
              <a
                aria-current="page"
                aria-label="Foundation file — current record"
                href="#foundation-brief"
              >
                <span aria-hidden="true" className="office-index__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="office-index__copy">
                  <strong>{section.label}</strong>
                  <small>{section.status}</small>
                </span>
              </a>
            ) : (
              <div aria-disabled="true">
                <span aria-hidden="true" className="office-index__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="office-index__copy">
                  <strong>{section.label}</strong>
                  <small>{section.status}</small>
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="office-index__note">
        Structural preview only. Unavailable offices do not open.
      </p>
    </nav>
  );
}

function SystemList({
  title,
  items,
  unavailable = false,
}: Readonly<{
  title: string;
  items: readonly string[];
  unavailable?: boolean;
}>) {
  return (
    <section className="status-rail__section">
      <div className="status-rail__section-heading">
        <h2>{title}</h2>
        <span>{unavailable ? "Unavailable" : "Established"}</span>
      </div>
      <ul>
        {items.map((item) => (
          <li
            className={
              unavailable ? "status-rail__item--unavailable" : undefined
            }
            key={item}
          >
            <span aria-hidden="true" className="status-rail__mark" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DevelopmentStatusRail() {
  return (
    <div className="status-rail">
      <div className="status-rail__heading">
        <p>Development status</p>
        <StatusBadge variant="in-progress">Under development</StatusBadge>
      </div>
      <SystemList title="Available now" items={availableSystems} />
      <SystemList
        title="Outside this build"
        items={unavailableSystems}
        unavailable
      />
      <section
        className="status-rail__docket"
        aria-labelledby="build-docket-title"
      >
        <p id="build-docket-title">Build docket</p>
        <dl>
          <div>
            <dt>File</dt>
            <dd>M83 / 02</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>Interface foundation</dd>
          </div>
          <div>
            <dt>Gameplay</dt>
            <dd>Not available</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <ApplicationShell
      className="foundation-shell"
      header={
        <InstitutionalHeader
          status={
            <div className="foundation-header-status">
              <div className="foundation-header-status__reference">
                <span>Internal reference</span>
                <strong>M83 / FOUNDATION / 02</strong>
              </div>
              <StatusBadge variant="in-progress">
                Foundation preview
              </StatusBadge>
            </div>
          }
        />
      }
      navigation={<OfficeNavigation />}
      contextPanel={<DevelopmentStatusRail />}
      metadataStrip={
        <div className="foundation-footer">
          <span>MANDATE: 1983</span>
          <span aria-hidden="true">◆</span>
          <span>Technical and visual foundation</span>
          <span aria-hidden="true">◆</span>
          <span>No gameplay state</span>
        </div>
      }
    >
      <div className="foundation-page">
        <section aria-labelledby="foundation-title" className="foundation-hero">
          <div className="foundation-hero__copy">
            <p className="foundation-hero__classification">
              Presidential systems memorandum · non-gameplay preview
            </p>
            <p className="foundation-hero__country">Republic of Varenne</p>
            <h1 id="foundation-title">MANDATE: 1983</h1>
            <p className="foundation-hero__lede">
              The machinery of government is being assembled behind closed
              doors.
            </p>
            <p className="foundation-hero__summary">
              This build establishes the application shell, visual language, and
              reusable interface foundations for an original political narrative
              strategy game. It contains no playable government simulation.
            </p>
            <TextLink href="#foundation-brief">
              Inspect the foundation brief
            </TextLink>
          </div>

          <div aria-hidden="true" className="foundation-hero__ornament">
            <div className="foundation-hero__lamp" />
            <div className="foundation-hero__seal">
              <BrandMark />
            </div>
            <span>Office file · 02</span>
          </div>
        </section>

        <div className="foundation-worktable">
          <span aria-hidden="true" className="foundation-worktable__corner" />
          <div className="foundation-dossier-stack">
            <span
              aria-hidden="true"
              className="foundation-dossier-stack__sheet"
            />
            <span
              aria-hidden="true"
              className="foundation-dossier-stack__cover"
            />
            <span
              aria-hidden="true"
              className="foundation-dossier-stack__clip"
            />
            <div aria-hidden="true" className="foundation-dossier-tabs">
              <span>Brief</span>
              <span>Status</span>
              <span>Scope</span>
            </div>

            <PaperPanel
              id="foundation-brief"
              aria-labelledby="foundation-brief-title"
              className="foundation-brief"
            >
              <div className="foundation-document__header">
                <div>
                  <p>Republic of Varenne</p>
                  <span>Office of Administrative Development</span>
                </div>
                <p>Reference: M83 / Foundation / 02</p>
              </div>

              <Divider ornament />

              <SectionHeading
                id="foundation-brief-title"
                eyebrow="Official development notice"
                title="Application foundation established"
                description={
                  <p>
                    The first playable MVP remains in development. This file is
                    a truthful review of the interface foundation, not a
                    simulation of government activity.
                  </p>
                }
              />

              <Notice title="Current status" variant="information">
                <p>
                  The technical foundation and visual shell are available.
                  Authentication, saves, scenarios, decisions, and gameplay are
                  not available yet.
                </p>
              </Notice>

              <dl className="foundation-metadata">
                {foundationMetadata.map((item) => (
                  <MetadataRow key={item.label} {...item} />
                ))}
              </dl>

              <div className="foundation-signoff">
                <span>Issued for internal review</span>
                <span>Administrative design file · 1983</span>
              </div>
              <div aria-hidden="true" className="foundation-document__stamp">
                Foundation
              </div>
              <div aria-hidden="true" className="foundation-document__seal">
                <BrandMark />
              </div>
            </PaperPanel>
          </div>
        </div>

        <section
          className="foundation-boundary"
          aria-labelledby="boundary-title"
        >
          <div aria-hidden="true" className="foundation-boundary__rule" />
          <div>
            <p>Development boundary</p>
            <h2 id="boundary-title">Foundation preview only</h2>
          </div>
          <p>
            No control on this screen claims access to unfinished systems. A
            capability will appear as available only after it is connected,
            tested, and reviewed in the real application.
          </p>
        </section>
      </div>
    </ApplicationShell>
  );
}
