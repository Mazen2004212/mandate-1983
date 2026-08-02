import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ApplicationShell, InstitutionalHeader } from "./ui/application-shell";
import { PrimaryButton, SecondaryButton, TextLink } from "./ui/actions";
import { Notice } from "./ui/notice";
import { SectionHeading } from "./ui/section-heading";
import {
  EmptyStatePresentation,
  ErrorStatePresentation,
  LoadingPresentation,
  UnauthorizedStatePresentation,
} from "./ui/state-presentation";
import { StatusBadge } from "./ui/status-badge";
import { DarkPanel, PaperPanel } from "./ui/surfaces";

const meta = {
  title: "Foundation/TASK-02 Design System",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryCanvas({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="storybook-canvas">{children}</div>;
}

export const ApplicationShellPreview: Story = {
  render: () => (
    <ApplicationShell
      header={
        <InstitutionalHeader
          status={
            <StatusBadge variant="in-progress">Foundation preview</StatusBadge>
          }
        />
      }
      navigation={
        <nav aria-label="Shell region preview" className="office-index">
          <div className="office-index__heading">
            <p>Office index</p>
            <span>Structural region</span>
          </div>
          <ol className="office-index__list">
            <li className="office-index__item--current">
              <a aria-current="page" href="#shell-preview-title">
                <span aria-hidden="true" className="office-index__number">
                  01
                </span>
                <span className="office-index__copy">
                  <strong>Current record</strong>
                  <small>Available</small>
                </span>
              </a>
            </li>
            <li>
              <div aria-disabled="true">
                <span aria-hidden="true" className="office-index__number">
                  02
                </span>
                <span className="office-index__copy">
                  <strong>Future office</strong>
                  <small>Coming soon</small>
                </span>
              </div>
            </li>
          </ol>
        </nav>
      }
      contextPanel={
        <div className="status-rail">
          <div className="status-rail__heading">
            <p>Context region</p>
            <StatusBadge variant="limited">Preview</StatusBadge>
          </div>
          <section className="status-rail__section">
            <div className="status-rail__section-heading">
              <h2>Current scope</h2>
              <span>Established</span>
            </div>
            <ul>
              <li>
                <span aria-hidden="true" className="status-rail__mark" />
                <span>Responsive shell regions</span>
              </li>
            </ul>
          </section>
        </div>
      }
      metadataStrip="Non-gameplay shell preview"
    >
      <PaperPanel aria-labelledby="shell-preview-title">
        <SectionHeading
          id="shell-preview-title"
          eyebrow="Shell preview"
          title="Institutional workspace foundation"
          description="The shell accepts future navigation and context regions without presenting unfinished destinations as working links."
        />
      </PaperPanel>
    </ApplicationShell>
  ),
};

export const PaperSurface: Story = {
  render: () => (
    <StoryCanvas>
      <PaperPanel aria-labelledby="paper-title">
        <SectionHeading
          id="paper-title"
          eyebrow="Official record"
          title="Aged paper panel"
          description="For formal reports, decrees, memoranda, and evidence that require sustained reading."
        />
      </PaperPanel>
    </StoryCanvas>
  ),
};

export const DarkSurface: Story = {
  render: () => (
    <StoryCanvas>
      <DarkPanel aria-labelledby="dark-title">
        <SectionHeading
          id="dark-title"
          inverted
          eyebrow="Secure workspace"
          title="Dark institutional panel"
          description="For contextual framing and high-pressure institutional surfaces."
        />
      </DarkPanel>
    </StoryCanvas>
  ),
};

export const StatusBadgeVariants: Story = {
  render: () => (
    <StoryCanvas>
      <div className="storybook-row">
        <StatusBadge variant="established">Established</StatusBadge>
        <StatusBadge variant="in-progress">In progress</StatusBadge>
        <StatusBadge variant="limited">Limited access</StatusBadge>
        <StatusBadge variant="unavailable">Unavailable</StatusBadge>
      </div>
    </StoryCanvas>
  ),
};

export const ButtonStates: Story = {
  render: () => (
    <StoryCanvas>
      <div className="storybook-row">
        <PrimaryButton type="button">Primary action</PrimaryButton>
        <SecondaryButton type="button">Secondary action</SecondaryButton>
        <PrimaryButton type="button" disabled>
          Disabled action
        </PrimaryButton>
        <SecondaryButton type="button" isLoading loadingLabel="Preparing">
          Prepare record
        </SecondaryButton>
        <TextLink href="#storybook-notices">Text link</TextLink>
      </div>
    </StoryCanvas>
  ),
};

export const NoticeVariants: Story = {
  render: () => (
    <StoryCanvas>
      <div id="storybook-notices" className="storybook-stack">
        <Notice title="Information" variant="information">
          The record contains verified administrative information.
        </Notice>
        <Notice title="Recorded" variant="success">
          The action completed and the result was recorded.
        </Notice>
        <Notice title="Review required" variant="warning">
          Continue only after reviewing the documented limitation.
        </Notice>
        <Notice title="Unable to proceed" variant="danger">
          The request failed safely. Existing progress is unchanged.
        </Notice>
      </div>
    </StoryCanvas>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <StoryCanvas>
      <LoadingPresentation />
    </StoryCanvas>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <StoryCanvas>
      <EmptyStatePresentation
        action={<SecondaryButton type="button">Return safely</SecondaryButton>}
      />
    </StoryCanvas>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <StoryCanvas>
      <ErrorStatePresentation
        action={<PrimaryButton type="button">Try again</PrimaryButton>}
      />
    </StoryCanvas>
  ),
};

export const UnauthorizedState: Story = {
  render: () => (
    <StoryCanvas>
      <UnauthorizedStatePresentation />
    </StoryCanvas>
  ),
};

export const LongTextNarrowState: Story = {
  render: () => (
    <div className="storybook-canvas storybook-canvas--narrow">
      <PaperPanel aria-labelledby="long-text-title">
        <SectionHeading
          id="long-text-title"
          eyebrow="Long-content review"
          title="A memorandum prepared for President Alexandrine-Marguerite Vestergaard-Rosenau"
          description="This deliberately long representative heading verifies that future customized names and official language wrap without clipping, overflow, or unreadably narrow lines."
        />
      </PaperPanel>
    </div>
  ),
};
