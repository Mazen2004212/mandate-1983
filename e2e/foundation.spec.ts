import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("foundation page is honest, responsive, accessible, and visually reviewable", async ({
  page,
}, testInfo) => {
  const browserErrors: string[] = [];
  const failedRequests: string[] = [];
  const errorResponses: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(
      `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? "failed"}`,
    );
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      errorResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto("/");

  await expect(page).toHaveTitle("MANDATE: 1983 — Republic of Varenne");
  await expect(
    page.getByRole("heading", { level: 1, name: "MANDATE: 1983" }),
  ).toBeVisible();
  await expect(
    page.getByText("Foundation preview", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/gameplay are not available yet/i)).toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: /foundation file.*current/i }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  const foundationLink = page.getByRole("link", {
    name: "Inspect the foundation brief",
  });
  await expect(foundationLink).toBeFocused();
  const focusStyle = await foundationLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(focusStyle.outlineWidth).not.toBe("0px");

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  const seriousOrCriticalViolations = accessibilityResults.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedMotionDurationMs = await foundationLink.evaluate((element) => {
    const durations = getComputedStyle(element).transitionDuration.split(",");
    return Math.max(
      ...durations.map((duration) => {
        const value = Number.parseFloat(duration);
        return duration.trim().endsWith("ms") ? value : value * 1000;
      }),
    );
  });
  expect(reducedMotionDurationMs).toBeLessThan(1);

  await page.screenshot({
    path: testInfo.outputPath("foundation-page.png"),
    fullPage: true,
  });

  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const zoomedLayout = await page.evaluate(() => {
    const heading = document.querySelector("h1");
    const headingRange = document.createRange();

    if (heading) {
      headingRange.selectNodeContents(heading);
    }

    const headingBounds = heading ? headingRange.getBoundingClientRect() : null;

    return {
      hasHorizontalOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      headingBounds:
        headingBounds === null
          ? undefined
          : { left: headingBounds.left, right: headingBounds.right },
      viewportWidth: window.innerWidth,
    };
  });
  expect(zoomedLayout.hasHorizontalOverflow).toBe(false);
  expect(zoomedLayout.headingBounds).toBeDefined();
  expect(zoomedLayout.headingBounds?.left).toBeGreaterThanOrEqual(0);
  expect(zoomedLayout.headingBounds?.right).toBeLessThanOrEqual(
    zoomedLayout.viewportWidth,
  );

  expect(seriousOrCriticalViolations).toEqual([]);
  await expect(page.locator('img[src*="visual-references"]')).toHaveCount(0);
  await expect(page.getByRole("button")).toHaveCount(0);
  await expect(
    page.getByText(/treasury|approval rating|save slot/i),
  ).toHaveCount(0);
  expect(browserErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(errorResponses).toEqual([]);
});
