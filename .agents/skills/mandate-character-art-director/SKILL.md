---
name: mandate-character-art-director
description: "Use when designing, generating, commissioning, reviewing, organizing, integrating, or replacing character portraits, expression variants, family customization presets, clothing variants, character sheets, or other character-related visual assets for MANDATE: 1983. Do not use for non-character UI-only work, backend-only tasks, database-only work, narrative-writing-only tasks, or unrelated environment and map artwork."
---

# MANDATE: 1983 Character Art Director

Control character-art consistency, quality, period accuracy, asset readiness, and visual review. Do not control narrative consequences or simulation behavior.

## Coordinate Companion Skills

- Use `mandate-ui-director` whenever integrating or reviewing character artwork in the visible game interface.
- Use `mandate-page-builder` when implementing or substantially changing a character-selection, dialogue, cabinet, family, dossier, or relationship screen.
- Use `mandate-narrative-author` when appearance must reflect biography, ideology, role, personality, history, or character arc.
- Use `mandate-content-validator` when adding, changing, renaming, or removing production asset references.

## Understand the Character

Before creating or changing artwork:

1. Read `AGENTS.md`, this skill, and all three references.
2. Inspect the character biography, narrative role, existing portraits, and contact sheet.
3. Identify age, role, political position, profession, social background, personality, public reputation, private temperament, and chapter appearances.
4. Identify required expressions, clothing, locations, and every UI placement.
5. Determine dimensions, crop, safe region, and responsive behavior.
6. Classify the asset as `concept`, `temporary-placeholder`, `production-candidate`, or `final`.
7. State a brief art-production and review plan.

Do not create a portrait from a character name alone.

## Protect Originality and Rights

Require original fictional characters. Reject real-person, living-politician, celebrity, copied film, television, or game character likenesses. Do not imitate a specific living artist or use copyrighted game assets, unlicensed stock, external hotlinks, or copied real political and military logos or insignia.

For external tools or assets, record source, license, commercial-use permission, attribution requirements, modification permission, and date obtained. Do not call an asset final while rights status is unknown.

## Direct the Core Style

Require semi-realistic editorial illustration with 1970s and 1980s political-magazine influence, restrained oil-painted and screen-print texture, realistic proportions, strong silhouettes, period-correct clothing and grooming, controlled cinematic lighting, muted color, tangible materials, a serious political-thriller tone, and original fictional faces.

Reject celebrity photography, anime, superhero anatomy, farming-game cartoons, pixel art, chibi proportions, plastic 3D rendering, corporate headshots, fashion poses, theatrical expressions, neon light, modern clothing, generic generated backgrounds, duplicated faces, and recolored duplicates.

## Compose Portraits Consistently

- Use a 4:5 portrait ratio and a master resolution of at least 1200 x 1500.
- Prefer a bust or waist-up, three-quarter pose with context-appropriate eye contact.
- Keep camera height and approximate head scale consistent.
- Keep the face at approximately 38% to 52% of portrait height.
- Preserve enough empty space and a safe zone for responsive UI crops.
- Use restrained textured backgrounds readable on dark and paper surfaces.
- Do not clip the head, chin, essential medals, clothing identifiers, or signature accessories.

## Maintain Expressions

Provide `neutral`, `supportive`, `concerned`, `angry`, `suspicious`, and `exhausted` expressions for every major character. Add sad, afraid, confident, defensive, shocked, grieving, public-speaking, wartime, imprisoned, ill, or older epilogue variants only when needed.

Preserve identity, age, face structure, hair, relevant clothing continuity, lighting direction, camera angle, and crop. Express changes through brow, eyes, mouth, jaw, posture, head angle, and restrained lighting intensity. Do not turn expression variants into unrelated people or distort faces theatrically.

## Support First-Family Presets

Plan at least eight base presets each for the president, spouse, adult daughter, and adult son, plus six for the adult sibling. Vary face structure, skin tone, hair, apparent age, build, clothing, grooming, and visual personality meaningfully; never treat a skin-color swap as sufficient diversity.

Support compatible presidential variants for hair, facial hair, suit, tie, optional glasses, optional campaign pin, crisis clothing, and formal state clothing. Do not promise modular combinations until the asset system proves compatible compositing.

## Enforce Period Clothing

Use plausible 1980s civilian, presidential, diplomatic, military, working-class, academic, media, and family clothing. Presidential options may include navy, charcoal, brown three-piece, or light summer suits; a formal state coat; former-officer ceremonial jacket; open-collar crisis outfit; or winter overcoat.

Use fictional service uniforms, medals, ranks, badges, party pins, and insignia. Reject copied real insignia, modern slim fits, tactical gear, hairstyles, phones, eyewear, logos, and twenty-first-century camouflage.

## Document Visual Identity

Maintain a visual identity sheet for every major production character containing character ID, display name, age, pronouns, role, regional or cultural background, height impression, build, face shape, skin tone, hair, eyes, distinguishing features, grooming, clothing, accessories, posture, color motif, lighting, background motif, expression set, narrative symbolism, forbidden traits, required assets, and asset status.

Use a stable machine character ID that never depends on a player-customized family name.

## Build Original Generation Prompts

When an approved image-generation tool is available, write an original prompt with a shared style anchor; character identity; composition; dimensions; expression; clothing; lighting; period and setting; and negative constraints. Include an original fictional person, age range, role, facial structure, hair, pose, a 4:5 portrait, semi-realistic editorial style, and exclusions for real-person likeness, modern objects, text, logos, and malformed anatomy.

Once application production begins, keep one versioned prompt per character or preset under `.prompts/characters/` and record the prompt version in asset metadata. Do not accept an output merely because generation succeeded.

## Review Generated Work

Inspect face consistency, anatomy, eyes, teeth, ears, visible hands, seams, buttons, medals, glasses, hairline, age, lighting, backgrounds, text, watermarks, modern objects, real-person resemblance, duplicate faces, expression, crop, and UI readability.

Reject or correct deformed features, mismatched eyes, broken glasses, nonsensical medals, fake text, extra fingers, impossible clothing, blended accessories, age drift, incorrect expression, real-person resemblance, or style mismatch.

## Name and Track Assets

Use stable character IDs with this conceptual pattern:

`characters/{character_id}/{character_id}__{expression}__{variant}__v{version}.webp`

For example:

- `characters/prime_minister/prime_minister__neutral__formal__v01.webp`
- `characters/prime_minister/prime_minister__angry__formal__v01.webp`
- `characters/prime_minister/prime_minister__concerned__crisis__v01.webp`

Do not use display names, customized names, spaces, random generated names, names such as `final-final-2`, or dates as the sole version.

Track character ID, expression, clothing variant, version, status, source, license, prompt version, dimensions, crop, and review status. Use `concept`, `temporary-placeholder`, `production-candidate`, `approved`, `final`, `rejected`, `deprecated`. Mark placeholders in development metadata, remove production references to deprecated assets, keep rejected work outside production paths, and reserve final status for completed review.

## Prepare Technical Assets

Prefer WebP for production portraits, PNG for transparency or lossless review, SVG for frames and vector overlays, and JPEG only for approved photographic texture. Preserve high-resolution sources when available; optimize web variants; use the correct color profile and dimensions; avoid unnecessary metadata, compression artifacts, and upscaling; prevent layout shift; and lazy-load when appropriate.

## Integrate and Compare

Use `mandate-ui-director` and inspect portraits in dialogue, cabinet, family setup, family pages, dossiers, elections, media, War Room, endings, and mobile layouts. Test dark and paper backgrounds, small cards, large dialogue portraits, mobile full-screen crops, long names, multiple expressions, high contrast, and 200% zoom.

Do not let artwork cover dialogue or actions, lose faces in mobile crops, become unreadably small, clash with document texture, or impose excessive file weight.

Maintain contact sheets once production assets exist. Compare all major characters, family presets, expressions, clothing, ages, lighting, crop, skin tones, face uniqueness, and period accuracy. Use them to detect duplicate faces and style, lighting, scale, background, clothing, or diversity drift.

## Preserve Accessibility

Provide useful alt text when a portrait conveys information and empty alt text when decorative. Keep text labels independent of portrait recognition, never communicate status only through expression, use high-contrast framing, reduce decorative motion, and prohibit flashing transitions.

Never use ethnicity, disability, scars, clothing, or appearance as shorthand for morality or criminality.

## Approve Deliberately

Before approval, validate identity, originality, period, anatomy, expression, clothing, crop, dimensions, optimization, licensing, naming, and metadata. Integrate the asset into the real UI; capture and inspect desktop, tablet, and mobile screenshots; compare the contact sheet; record review status; and report only checks actually performed.

Use these references:

- `references/character-art-bible.md`
- `references/asset-pipeline.md`
- `references/art-review-checklist.md`

## Report Delivery

Report the character or preset, character ID, narrative role, changed assets, expressions, clothing variants, dimensions, format, prompt version, status, originality, period, anatomy, licensing, UI screens and viewports tested, screenshot paths, rejected outputs, remaining limitations, and skipped checks with reasons.

Never claim an asset is final before visual review, real-UI testing, and rights review, or while it remains a placeholder.
