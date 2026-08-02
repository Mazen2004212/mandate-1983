# Page Delivery Checklist

## Before Implementation

- [ ] `AGENTS.md` read.
- [ ] `mandate-ui-director` loaded.
- [ ] Existing route inspected.
- [ ] Related game systems inspected.
- [ ] Page contract completed.
- [ ] Primary action identified.
- [ ] Hidden information identified.
- [ ] Relevant test strategy identified.

## Architecture

- [ ] Strict TypeScript enabled.
- [ ] No `any` introduced.
- [ ] Data is typed.
- [ ] Zod validates untrusted boundaries.
- [ ] Domain logic remains outside UI components.
- [ ] Authorization runs server-side.
- [ ] Mutations are idempotent.
- [ ] Customized family names are not hard-coded.
- [ ] The page has no generic mock-data dependency.
- [ ] No secret is exposed to the client.

## States

- [ ] Loading.
- [ ] Empty.
- [ ] Populated.
- [ ] Error.
- [ ] Disabled.
- [ ] Permission denied, if applicable.
- [ ] Slow network.
- [ ] Stale revision, if applicable.
- [ ] Long content.
- [ ] Long family names.

## Interaction

- [ ] Hover state.
- [ ] Focus state.
- [ ] Pressed state.
- [ ] Disabled state.
- [ ] Pending state.
- [ ] Success feedback.
- [ ] Error feedback.
- [ ] Duplicate-action protection.
- [ ] Confirmation behavior is correct.
- [ ] No fake controls.

## Responsive

- [ ] 1920×1080.
- [ ] 1440×900.
- [ ] 1366×768.
- [ ] 1280×720.
- [ ] 1024×768.
- [ ] 768×1024.
- [ ] 390×844.
- [ ] 200% browser zoom.

## Accessibility

- [ ] Semantic landmarks.
- [ ] Correct heading order.
- [ ] Keyboard-only operation.
- [ ] Visible focus.
- [ ] Focus management.
- [ ] Screen-reader labels.
- [ ] Live announcements.
- [ ] Reduced motion.
- [ ] High contrast.
- [ ] Color-independent meaning.
- [ ] Minimum touch targets.
- [ ] Accessible map or chart fallback.

## Tests

- [ ] Unit tests.
- [ ] Component tests.
- [ ] Integration tests.
- [ ] Playwright tests.
- [ ] Accessibility tests.
- [ ] Error path.
- [ ] Mobile path.
- [ ] Main action.
- [ ] No existing tests weakened.

## Visual Review

- [ ] Before screenshots captured when relevant.
- [ ] After screenshots captured.
- [ ] Screenshots visually inspected.
- [ ] No overlap.
- [ ] No clipping.
- [ ] No overflow.
- [ ] No generic SaaS remnants.
- [ ] No default Tailwind remnants.
- [ ] No broken portraits.
- [ ] No broken icons.
- [ ] No missing fonts.
- [ ] Browser console is clean.
- [ ] Network requests are healthy.

## Delivery Report

- [ ] Route reported.
- [ ] Narrative purpose reported.
- [ ] Files changed reported.
- [ ] Data integrated reported.
- [ ] States completed reported.
- [ ] Tests executed reported.
- [ ] Passed checks reported.
- [ ] Failed checks reported.
- [ ] Skipped checks and reasons reported.
- [ ] Viewports reported.
- [ ] Screenshot paths reported.
- [ ] Accessibility status reported.
- [ ] Console status reported.
- [ ] Limitations reported.
- [ ] Blockers reported.

A page is not complete until its real rendered output has been tested and visually inspected.
