---
name: mandate-content-validator
description: "Use when validating, reviewing, debugging, importing, publishing, or changing MANDATE: 1983 authored content or game definitions, including scenarios, characters, choices, effects, eligibility, follow-ups, delayed consequences, media outputs, laws, regions, wars, elections, endings, achievements, assets, family-name tokens, or content-version integrity. Do not use for visual-only UI work, database-only administration, static art creation, or prose drafting that does not yet require integration validation."
---

# Validate MANDATE: 1983 Content

Control content integrity and publication safety. Never silently rewrite authored content to make validation pass. Explain every error's cause, location, and required correction.

Use `mandate-narrative-author` when fixing prose, voice, continuity, scene structure, or choice writing. Use `mandate-game-systems` when fixing state variables, ranges, effects, eligibility, delayed consequences, elections, coups, wars, or ending logic. Use `mandate-ui-director` and `mandate-page-builder` only when validation changes a visible editor, error presentation, or player-facing UI.

Read [the validation rules](references/validation-rules.md), [the content integrity checklist](references/content-integrity-checklist.md), and [the validation report template](references/validation-report-template.md) completely before validating.

## Understand the Validation Scope

Before validating or changing content:

1. Read the repository-root `AGENTS.md`, this skill, and all references.
2. Inspect authoritative content schemas, directories, naming conventions, state definitions, registries, and content-version rules.
3. Locate character, faction, region, law, war, election, ending, and achievement registries.
4. Define the mode: single-file, changed-files, chapter, system, full-repository, or pre-publish.
5. Identify required companion skills and state a brief validation plan.

Never validate against assumptions when authoritative schemas or registries exist.

## Classify Findings

- **Error:** Block builds or publication as configured. Examples include duplicate IDs, broken required references, unknown state fields, invalid effects or ranges, impossible prerequisites, missing required choices or text, mandatory cycles, invalid family tokens, prohibited content, unreachable required endings, and missing required assets.
- **Warning:** Require review but may permit development builds. Examples include absent delayed consequences, near-identical choices, excessive dialogue, possibly unreachable optional events, declared placeholders, missing media coverage, missing ending contributions, unusually large effects, uncertain evidence labels, and possible continuity conflicts.
- **Information:** Report useful diagnostics such as counts, coverage, unused objects, branch depth, and token usage.

Fail production publication while blocking errors remain. Allow configuration to promote warnings to errors, but never silently downgrade errors.

## Validate Stable IDs

Validate formatting and namespace uniqueness for scenarios, per-scenario choices, characters, factions, regions, laws, decrees, projects, conflicts, wars, fronts, elections, parties, media outlets and templates, memories, registered flags, endings, epilogues, achievements, and addressable assets.

Require deterministic stable IDs that avoid display names, family tokens, whitespace, unsafe path characters, and casual post-publication changes. Detect exact duplicates, case-insensitive duplicates where relevant, version-incompatible reuse, and likely typographical near-duplicates. Treat near-duplicates as warnings unless an authoritative rule makes them errors.

## Validate References

Resolve every character, faction, region, ministry, law, decree, project, scenario, choice, memory, flag, media, asset, conflict, war, election, ending, achievement, state-field, follow-up, and delayed-effect reference against its registry.

Required references must exist. Optional references must exist, be validly absent, or use an approved external form. String-shape validity alone never proves that a reference exists.

## Validate Schemas

Use Zod or another approved typed schema once the application exists. Validate required and optional fields, enums, numeric and integer types, string and array bounds, empty arrays, political dates, versions, warnings, choice counts, effects, tokens, and asset paths.

Return precise paths such as `scenario.chapter_01_food_crisis.choices[2].effects[1]`, never generic messages such as "Invalid content" or "Schema error."

## Validate State Variables and Effects

Treat `mandate-game-systems` as authoritative. Confirm every state field exists, uses the correct path, type, operation, unit, range, visibility, and authored-content permission. Detect typos, deprecated fields, leaked debug fields, floating-point money assumptions, type misuse, immutable-definition mutation, and non-authoritative client fields. Never invent a state field automatically.

For every effect, validate type, target, operation, value, range, visibility, timing, idempotency, source scenario and choice, and immediate or delayed classification. Detect contradictions, duplicates, accidental cancellation, missing delayed triggers or keys, repeatable completed effects, and mismatch between prose and state behavior. Report large effects instead of silently normalizing them.

## Validate Eligibility

Validate flags, memories, relationship and faction ranges, regions, political date, chapter, laws, constitution, war, election, character, family, difficulty, background, and prior scenarios.

Detect mutually impossible conditions, the same required and excluded flag, inverted ranges, unavailable characters, invalid date windows, deprecated fields, contradictory war or election states, mandatory unreachable content, and scenarios excluding every route. Explain the conflicting conditions.

## Validate Branch Graphs and Reachability

Validate the directed graph of scenarios, choices, follow-ups, delayed effects, chapter transitions, endings, and epilogues. Detect broken edges, mandatory cycles, infinite repeats, required nodes without incoming routes, dead ends, unreachable endings, immediate self-triggers, delayed loops, skipped required chapter state, and conflicting endings without priority.

Permit controlled repeatable cycles only with explicit repeatability, cooldown, maximum count or safe termination, duplicate-reward protection, and no repeated irreversible effect.

Classify nodes as reachable, conditionally reachable, background-specific, difficulty-specific, seed-specific, intentionally hidden, development-only, unreachable, or indeterminate. Rare content is valid when its documented path is logically possible. Require traversal or simulation once implemented, and never claim complete reachability from static inspection alone.

## Validate Choices

Require unique choice IDs, non-empty distinct labels, valid requirements, effects, follow-ups, immediate responses, duplicate-submission protection, consistent player voice, rating compliance, and no unintended hidden-number exposure.

Warn about cosmetic distinctions, effectively identical outcomes, dominant choices without cost, excessive text, too few meaningful choices, missing responses, and consequence-free choices. Use `mandate-narrative-author` for rewrites.

## Validate Customized Family Tokens

Never permit canonical hard-coded names for the customizable first family. Approve only:

```text
{{president.firstName}}  {{president.lastName}}  {{president.publicName}}
{{spouse.firstName}}     {{spouse.lastName}}
{{daughter.firstName}}   {{daughter.lastName}}
{{son.firstName}}        {{son.lastName}}
{{sibling.firstName}}    {{sibling.lastName}}
{{family.surname}}
```

Validate spelling, braces, path, context availability, escaping, possessives, capitalization assumptions, and long-name expectations. Forbid tokens in stable IDs and file paths and forbid unsafe raw interpolation. Test two- and twenty-four-character names, spaces, apostrophes, hyphens, Unicode, and mixed capitalization.

## Validate Characters and Continuity

Confirm characters exist and have possible life, imprisonment, exile, office, location, relationship, and knowledge states. Prevent resigned officials from acting in office without restoration, exiles from appearing without return, exposed secrets from remaining hidden, and uninformed speakers from citing unknown secrets. Match war, election, constitution, and family state. Use `mandate-narrative-author` for narrative corrections.

## Validate Media

Confirm the outlet, voice, date, headline, summary, resolved facts, classification handling, family tokens, headline length, and required transcript. Allow credible propaganda and editorial differences, but never references to nonexistent events. Warn when a major public decision lacks media coverage.

## Validate Assets

Validate referenced portraits, expressions, backgrounds, icons, flags, emblems, maps, documents, newspaper and television images, audio, music, effects, and fonts. Check existence, approved roots and extensions, path case, required variants, placeholder declaration, required license metadata, real-person restrictions, and accessibility text or labels.

Allow placeholders during development only when explicitly marked. Never report placeholder art as final.

## Validate the Teen Rating and Originality

Block explicit sex, nudity, sexual violence, incest, graphic gore or torture, operational instructions for terrorism, assassination, coups, sabotage, or military action, romance involving minors, real extremist propaganda, dehumanization of protected groups, and living politicians as characters.

Require warnings where appropriate for non-graphic death, war, coups, implied adult affairs, imprisonment, political violence, pregnancy, terror threats, and assassination attempts. Do not label ordinary political disagreement as sensitive.

Review suspicious similarity in names, countries, scenes, character combinations, choices, media framing, endings, terminology, chapters, and lore. Classify originality review as automated indicators, manual creative review, or not reviewed. Never claim automation proves legal originality or state legal infringement as a validation conclusion.

## Validate Endings and Achievements

Require each ending to have a unique ID, multi-condition eligibility, priority, specificity, exclusion group, deterministic ties, reachability, epilogue coverage, duplicate-unlock protection, and correct character and regional handling. Permit a single-choice major ending only when explicitly designed as a special immediate-loss ending.

Check epilogue coverage for the president, spouse, daughter, son, sibling, major characters, constitution, government, economy, armed forces, regions, foreign relations, and civil rights.

Require each achievement to have a unique ID and code, valid trigger and hidden status, valid references, non-contradictory conditions, duplicate-unlock protection, player-facing text, and no unintended secret leak.

## Validate Content Versions

Require content and schema versions, stable IDs, migration plans for incompatible published changes, existing-save compatibility review, publish checksums, validation summaries, and rollback capability. Never change published stable IDs casually.

## Execute Validation Safely

Once implementation exists, support changed-file, full-content, CI, and pre-publish validation with human- and machine-readable output, exit codes, grouping, counts, and optional dependency graphs. Make production builds and publication fail on blocking errors. Do not create validator scripts as part of instruction-only skill work.

## Report Results

Use [the validation report template](references/validation-report-template.md) and [the content integrity checklist](references/content-integrity-checklist.md). Report scope, files, companion skills, schemas, errors, warnings, information, duplicate IDs, references, state fields, effects, eligibility, cycles, reachability, tokens, continuity, assets, rating, originality status, endings, executed checks, omissions, limitations, and recommended corrections.

Never state that content is valid when only a subset was checked.
