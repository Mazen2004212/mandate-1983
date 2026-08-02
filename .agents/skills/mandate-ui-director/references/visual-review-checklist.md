# Rendered Visual Review Checklist

Inspect the running browser application. Do not approve visual work from source code, DOM structure, or automated output alone.

## Required Viewports

- [ ] 1920×1080
- [ ] 1440×900
- [ ] 1366×768
- [ ] 1280×720
- [ ] 1024×768
- [ ] 768×1024
- [ ] 390×844

# Layout

- [ ] No horizontal page overflow.
- [ ] No clipped controls.
- [ ] No overlapping panels.
- [ ] The primary action remains visible.
- [ ] Navigation remains usable.
- [ ] No unexplained empty area weakens the composition.
- [ ] Artwork is not stretched.
- [ ] Map labels remain readable.
- [ ] Overlays are correctly placed.
- [ ] No hydration layout shift is visible.

# Typography

- [ ] Body size meets the required minimum.
- [ ] Headings establish a clear hierarchy.
- [ ] Text lines are not excessively long.
- [ ] Documents remain readable.
- [ ] Long names do not break layouts.
- [ ] Large numbers do not overflow.
- [ ] No unintended font fallback appears.

# Interaction

- [ ] Every interactive object has hover, focus, pressed, disabled, and loading states where appropriate.
- [ ] No functionality is hover-only.
- [ ] Focus order is logical.
- [ ] Dialog focus is trapped correctly.
- [ ] Escape behavior is correct.
- [ ] Irreversible actions require confirmation.
- [ ] Touch targets meet the 44px minimum.

# Visual Identity

- [ ] The result looks specifically like MANDATE: 1983.
- [ ] It does not resemble a SaaS dashboard.
- [ ] No default Tailwind remnants remain.
- [ ] No emoji appear as production icons.
- [ ] No modern glass effects appear.
- [ ] Materials are period-appropriate.
- [ ] Visual hierarchy supports the narrative purpose.
- [ ] Texture does not harm readability.
- [ ] Portrait scale is appropriate.
- [ ] UI does not cover important artwork.

# Accessibility

- [ ] Complete all operations with a keyboard only.
- [ ] Verify visible focus.
- [ ] Run an automated accessibility scan.
- [ ] Perform manual accessibility inspection.
- [ ] Test at 200% browser zoom.
- [ ] Test reduced-motion behavior.
- [ ] Test high-contrast behavior.
- [ ] Verify status remains clear without color.
- [ ] Verify accurate screen-reader names.
- [ ] Provide accessible chart data.
- [ ] Provide an accessible map summary.

# Content States

- [ ] Loading.
- [ ] Empty.
- [ ] Error.
- [ ] Typical data.
- [ ] Maximum data.
- [ ] Long dialogue.
- [ ] Long family names.
- [ ] No available decisions.
- [ ] Many notifications.
- [ ] War active.
- [ ] Peace active.
- [ ] Election active.
- [ ] Mobile.

# Browser Health

- [ ] No ordinary console errors.
- [ ] No failed asset requests.
- [ ] No broken images.
- [ ] No missing fonts.
- [ ] No React hydration warnings.
- [ ] No uncaught promise errors.

# Screenshot Evidence

Capture screenshots before and after significant visual changes. Record:

- [ ] Screenshot paths.
- [ ] Viewports tested.
- [ ] Defects found.
- [ ] Defects fixed.
- [ ] Remaining limitations.
- [ ] Tests actually run.

A successful build is not a successful visual review.
