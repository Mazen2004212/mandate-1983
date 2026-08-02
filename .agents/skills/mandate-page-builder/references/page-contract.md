# MANDATE Page Contract

Complete this contract before implementing a new or substantially revised player-facing page. Replace every placeholder and remove inapplicable rows only with a recorded reason.

## Identity

- **Page name:**
- **Route:**
- **Page owner:**
- **Related chapter or system:**
- **Authentication requirement:**
- **Required skill set:** `mandate-page-builder`, `mandate-ui-director`, and any task-specific skills

## Narrative Purpose

- **What moment or responsibility does this page represent?**
- **What should the player feel?**
- **What must the player understand?**
- **What must remain uncertain or hidden?**

## Player Actions

- **Primary action:**
- **Secondary actions:**
- **Navigation actions:**
- **Irreversible actions:**
- **Actions requiring confirmation:**
- **Disabled-action explanations:**

## Data Inputs

Add one row for every page input.

| Name | Type | Source | Server or client | Required or optional | Visible or hidden | Stale-data behavior | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

## Mutations and Outputs

Add one row for every mutation or produced action.

| Action | Input schema | Authorization | Idempotency key | Persistence change | Game-state effect | Error behavior | Success feedback | Audit or event-log requirement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |

## Page States

Define what the player sees and can safely do in every relevant state.

| State | Trigger | Player sees | Available actions | Recovery | Test required |
| --- | --- | --- | --- | --- | --- |
| Loading |  |  |  |  |  |
| Empty |  |  |  |  |  |
| Populated |  |  |  |  |  |
| Error |  |  |  |  |  |
| Disabled |  |  |  |  |  |
| Permission denied |  |  |  |  |  |
| Slow network |  |  |  |  |  |
| Stale save revision |  |  |  |  |  |
| Long content |  |  |  |  |  |
| Long customized names |  |  |  |  |  |
| Mobile |  |  |  |  |  |
| Tablet |  |  |  |  |  |
| Desktop |  |  |  |  |  |

## Layout Contract

- **Desktop composition:**
- **Tablet composition:**
- **Mobile composition:**
- **Top bar behavior:**
- **Navigation behavior:**
- **Context panel behavior:**
- **Scroll ownership:**
- **Sticky elements:**
- **Modal or drawer behavior:**

## Accessibility Contract

- **Heading structure:**
- **Landmark structure:**
- **Keyboard order:**
- **Focus management:**
- **Dialog behavior:**
- **Status announcements:**
- **Screen-reader labels:**
- **Reduced-motion behavior:**
- **High-contrast behavior:**
- **Chart or map alternatives:**
- **200% zoom behavior:**

## Visual Contract

- **Page-specific visual metaphor:**
- **Required materials:**
- **Dominant colors:**
- **Portrait requirements:**
- **Icon requirements:**
- **Allowed motion:**
- **Forbidden presentation:**
- **Required screenshots:**

Treat [the `mandate-ui-director` design system](../../mandate-ui-director/references/design-system.md) as the authoritative source for visual rules.

## Testing Contract

- **Unit tests:**
- **Component tests:**
- **Integration tests:**
- **Playwright tests:**
- **Accessibility tests:**
- **Screenshot states:**
- **Browser-console check:**
- **Network-failure check:**

## Acceptance Criteria

- [ ] The page uses real typed data.
- [ ] The main action works end to end.
- [ ] Mutations are authorized, validated, idempotent, and safe.
- [ ] All required states exist.
- [ ] The page is responsive at every required size.
- [ ] The page is keyboard accessible.
- [ ] The page is usable with a screen reader.
- [ ] Relevant tests pass.
- [ ] Required screenshots were visually inspected.
- [ ] No ordinary browser-console errors remain.
- [ ] Documentation is accurate.
