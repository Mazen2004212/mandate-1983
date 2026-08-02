import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ApplicationShell, InstitutionalHeader } from "./ui/application-shell";
import { PrimaryButton, TextLink } from "./ui/actions";
import { Notice } from "./ui/notice";
import { SectionHeading } from "./ui/section-heading";
import {
  ErrorStatePresentation,
  LoadingPresentation,
} from "./ui/state-presentation";
import { StatusBadge } from "./ui/status-badge";
import { PaperPanel } from "./ui/surfaces";

describe("TASK-02 interface primitives", () => {
  it("renders the application shell with one main landmark", () => {
    render(
      <ApplicationShell
        header={
          <InstitutionalHeader
            status={<StatusBadge>Foundation preview</StatusBadge>}
          />
        }
      >
        <PaperPanel aria-labelledby="test-title">
          <SectionHeading id="test-title" title="Foundation record" />
        </PaperPanel>
      </ApplicationShell>,
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Foundation record" }),
    ).toBeInTheDocument();
  });

  it("exposes status through text rather than color alone", () => {
    render(<StatusBadge variant="unavailable">Unavailable</StatusBadge>);

    expect(screen.getByText("Unavailable")).toBeVisible();
  });

  it("supports disabled and pending button states", () => {
    const { rerender } = render(
      <PrimaryButton type="button" disabled>
        Sign document
      </PrimaryButton>,
    );

    expect(
      screen.getByRole("button", { name: "Sign document" }),
    ).toBeDisabled();

    rerender(
      <PrimaryButton type="button" isLoading loadingLabel="Preparing document">
        Sign document
      </PrimaryButton>,
    );

    const pendingButton = screen.getByRole("button", {
      name: "Preparing document",
    });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton).toHaveAttribute("aria-busy", "true");
  });

  it("supports keyboard focus on a real link", async () => {
    const user = userEvent.setup();
    render(<TextLink href="#record">Read the record</TextLink>);

    await user.tab();

    expect(screen.getByRole("link", { name: "Read the record" })).toHaveFocus();
  });

  it("provides contextual loading and recoverable error language", () => {
    render(
      <>
        <LoadingPresentation />
        <ErrorStatePresentation />
      </>,
    );

    expect(screen.getByText("Preparing the record")).toBeVisible();
    expect(screen.getByText(/progress is unchanged/i)).toBeVisible();
  });

  it("renders long content and named notices without truncating source text", () => {
    const longName =
      "President Alexandrine-Marguerite Vestergaard-Rosenau of the Republic";

    render(
      <Notice title="Long-name review" variant="warning">
        {longName}
      </Notice>,
    );

    expect(screen.getByText(longName)).toBeVisible();
    expect(screen.getByText("Long-name review")).toBeVisible();
  });
});
