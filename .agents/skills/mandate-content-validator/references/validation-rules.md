# MANDATE: 1983 Content Validation Rules

## Contents

- [Validation Principles](#validation-principles)
- [Severity Definitions](#severity-definitions)
- [Content Namespaces](#content-namespaces)
- [ID Rules](#id-rules)
- [Reference Rules](#reference-rules)
- [Numeric and Range Rules](#numeric-and-range-rules)
- [Eligibility Rules](#eligibility-rules)
- [Graph Rules](#graph-rules)
- [Token Rules](#token-rules)
- [Asset Rules](#asset-rules)
- [Continuity Rules](#continuity-rules)
- [Content-Rating Rules](#content-rating-rules)
- [Originality Review](#originality-review)
- [Publication Gate](#publication-gate)

## Validation Principles

Make validation precise, deterministic, reproducible, non-destructive, schema-driven, registry-aware, version-aware, useful to authors, strict for production, and honest about incomplete analysis.

## Severity Definitions

| Severity | Meaning | Blocks development build | Blocks production build | Blocks publication | Example |
| --- | --- | --- | --- | --- | --- |
| Error | Content is invalid or unsafe to publish | Configurable, normally yes | Yes | Yes | Broken required reference |
| Warning | Review is required; development may continue | No by default | Configurable | Must be reviewed | Optional event may be unreachable |
| Information | Diagnostic or coverage data | No | No | No | Scenario count |

Configuration may promote selected warnings to errors. Never downgrade an error silently.

## Content Namespaces

Use distinct namespaces for `scenario`, `choice`, `character`, `faction`, `region`, `law`, `decree`, `project`, `media`, `conflict`, `war`, `election`, `ending`, `achievement`, `asset`, `memory`, and `flag`. Treat IDs as stable machine identifiers, not display labels.

## ID Rules

- Use lowercase ASCII, digits where needed, and underscores or another documented separator.
- Forbid spaces, family tokens, display titles, and unsafe path characters.
- Define and enforce length limits and namespace-specific uniqueness.
- Keep published IDs stable unless an explicit migration changes them.
- Document and consistently enforce the project's final exact pattern.

## Reference Rules

Classify references as required or optional. Resolve required references through the correct registry. Allow optional references only when present and resolvable, validly null or omitted by schema, or expressed through an approved external form. Never rely on string shape alone.

## Numeric and Range Rules

- Require integers where defined and fixed-precision money.
- Define explicit units, minimums, and maximums.
- Treat out-of-range authored content as an error.
- Reserve clamping for documented runtime safety layers.
- Never silently coerce numeric strings.

## Eligibility Rules

Detect required/excluded flag conflicts, incompatible statuses, impossible ranges or dates, dead characters, unavailable resigned or exiled officials, war/peace contradictions, election-state contradictions, and mutually exclusive laws. Report every conflicting condition and location.

## Graph Rules

Classify edges as mandatory, optional, delayed, ending, or repeatable. Detect cycles in mandatory paths. Require every repeatable cycle to have a cooldown, maximum count or safe termination, duplicate-reward protection, and no repeated irreversible effect.

## Token Rules

Approve only:

```text
{{president.firstName}}  {{president.lastName}}  {{president.publicName}}
{{spouse.firstName}}     {{spouse.lastName}}
{{daughter.firstName}}   {{daughter.lastName}}
{{son.firstName}}        {{son.lastName}}
{{sibling.firstName}}    {{sibling.lastName}}
{{family.surname}}
```

Require safe escaping, context availability, correct braces and spelling, grammatical rendering, and tests for short, long, spaced, apostrophized, hyphenated, Unicode, and mixed-capitalization names.

## Asset Rules

Require an existing path inside an approved root, exact deployment case, approved type, required dimensions where defined, explicit placeholder metadata, required licensing metadata, and no externally hotlinked production asset.

## Continuity Rules

Validate political time, place, office, life and legal status, relationships, knowledge, public exposure, war, election, constitution, and family state.

## Content-Rating Rules

Block explicit sex, nudity, sexual violence, incest, graphic gore or torture, romantic minors, living politicians, real extremist propaganda, dehumanization of protected groups, and detailed real-world operational wrongdoing. Require appropriate warnings for allowed non-graphic mature themes.

## Originality Review

Use automated similarity only as an indicator. Require manual review for major content. Report specific concerns and limitations without presenting a legal infringement conclusion.

## Publication Gate

Require zero blocking errors, reviewed warnings, valid schema and content versions, a valid checksum, required tests, and a generated validation report before production publication.
