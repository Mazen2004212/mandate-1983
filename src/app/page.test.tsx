import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("foundation page", () => {
  it("presents the Republic of Varenne foundation without claiming gameplay", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "MANDATE: 1983" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Republic of Varenne").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Foundation preview")).toBeInTheDocument();
    expect(
      screen.getByText(
        /authentication, saves, scenarios, decisions, and gameplay are not available yet/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no control on this screen claims access/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("provides one main landmark and a valid foundation anchor", () => {
    render(<HomePage />);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Inspect the foundation brief" }),
    ).toHaveAttribute("href", "#foundation-brief");
    expect(
      screen.getByRole("navigation", {
        name: "Presidential office sections",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /foundation file.*current/i }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("does not expose fake game statistics or completed systems", () => {
    render(<HomePage />);

    expect(screen.queryByText(/treasury/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/approval rating/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/save slot/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /cabinet chamber/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /national map/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
