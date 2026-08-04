# MANDATE: 1983 — MVP Content Architecture

This document is the authoritative content-model and authoring contract for the first playable MVP.

## 1. Document Authority and Scope

`docs/MVP_SCOPE.md` controls MVP feature and content scope. `docs/STORY_BIBLE.md` controls fictional canon and continuity. `docs/SYSTEMS_DESIGN.md` controls state variables, formulas, mutations, determinism, and balancing behavior. This document controls authored-content organization, stable identifiers, contracts, references, validation, versioning, publication status, and lifecycle.

Future TypeScript and Zod schemas must implement this architecture. Content references defined state fields and cannot invent new ones or bypass authoritative mutation resolution. Production content cannot silently redefine canon or formulas. Contradictions must be resolved in the correct authoritative document. This document does not authorize implementation beyond MVP scope.

- Status: Foundation baseline
- Content authority: Authoritative for MVP content structure
- Implementation status: Not started
- Last reviewed commit: `ae1316f`
- Release language: English
- Initial content version: `mvp-0.1.0`

## 2. Content Design Principles

MVP content is data-driven, identified by stable machine-readable IDs, explicitly referenced, deterministically eligible and resolved, continuity-aware, version-controlled, and validated before publication. Prose and mechanics remain separate. Narrative files contain neither direct database mutation definitions nor hidden state invented inside UI components. Runtime unrestricted language-model generation is prohibited.

Content must avoid filler, provide meaningful and appropriately delayed consequences, preserve character and faction memory, support fair information asymmetry, comply with the Teen rating, remain originally fictional, use safe family-name tokens, and carry traceable source and ownership metadata. Authored content describes valid intent and effects; the authoritative domain engine calculates and applies outcomes.

## 3. Proposed Content Directory Architecture

```text
content/
├── manifest/
│   ├── content-manifest
│   └── content-version
├── scenarios/
│   ├── prologue/
│   ├── chapter-01/
│   └── outcomes/
├── characters/
├── factions/
├── regions/
├── institutions/
├── backgrounds/
├── laws-and-measures/
├── projects/
├── intelligence/
├── media/
├── memories/
├── outcomes/
├── epilogues/
├── shared/
│   ├── conditions/
│   ├── effects/
│   ├── tokens/
│   └── terminology/
└── registries/
```

This is future logical organization, not permission to create it now. Exact extensions will be selected during implementation. Content may use TypeScript modules, JSON, or generated validated artifacts, but the authoritative runtime format must be schema-validated. UI components never become narrative truth. Every published object appears in an appropriate registry or manifest, and folder names never replace stable IDs.

## 4. Content Object Lifecycle

Exact statuses are `draft`, `review`, `approved`, `published`, `deprecated`, and `withdrawn`.

### Draft

Incomplete authoring and unresolved review notes are allowed. Draft content cannot ship.

### Review

The object is structurally complete enough for specialist review and passes basic schema validation. It cannot ship as production content.

### Approved

Narrative, systems, continuity, rating, and reference review is complete, although publication packaging may remain.

### Published

The object is included in a released manifest. Stable-ID and compatibility rules apply; changes require version control and compatibility review.

### Deprecated

The object remains loadable where compatibility requires it but is not selected for new games unless explicitly supported.

### Withdrawn

The object is removed from active publication because of defect, rights, safety, or design concerns. Existing-save behavior must be explicit.

Vague statuses such as `finished`, `mostly done`, `ready enough`, and `final-ish` are prohibited.

## 5. Stable Identifier Standard

Every content object requires a stable ID. IDs use lowercase ASCII snake case, begin with a letter, and contain only `a-z`, `0-9`, and `_`. They contain no spaces, customized names, display-name dependency, random authored-definition IDs, or file-path dependency. Published IDs cannot be casually renamed and remain globally unique unless a typed namespace system is deliberately adopted.

Recommended prefixes are `scenario_`, `choice_`, `condition_`, `effect_`, `delay_`, `memory_`, `flag_`, `media_`, `law_`, `measure_`, `project_`, `intel_`, `outcome_`, `epilogue_`, and `background_`.

Structural examples, not production content:

```text
scenario_supply_briefing
choice_supply_emergency_imports
memory_mara_budget_promise
flag_roven_mobilization_authorized
media_ledger_supply_imports
```

Invalid examples include `Scenario 1`, `JohnsDecision`, `final_choice_new`, `scene-copy-2`, and `{{president.firstName}}_meeting`.

## 6. Common Content Metadata

Every authored object defines appropriate metadata. Common required fields are `id`, `type`, `status`, `contentVersion`, `schemaVersion`, `title`, `summary`, `chapter`, `politicalPeriod`, `authoringOwner`, `createdAt`, `updatedAt`, `tags`, `canonReferences`, `systemReferences`, `relatedContentIds`, `ratingNotes`, `originalityStatus`, and `changeNotes`.

Timestamps and authorship are administrative rather than simulation state and are not player-facing. Published behavioral changes require nonempty change notes. Tags assist organization but do not control critical behavior unless explicitly modeled. Canon and system references point to authoritative concepts; unknown references are validation errors.

## 7. Content Manifest and Registries

The content manifest defines manifest ID, content version, schema version, release status, minimum compatible save version, optional maximum compatible save version, publication timestamp, included and withdrawn object IDs, migration requirements, checksum or integrity metadata, and release notes.

Typed registries are required for scenarios, choices, characters, factions, regions, institutions, backgrounds, laws and measures, projects, intelligence assertions, media reactions, memories, flags, outcomes, and epilogues.

Duplicate IDs, missing registered objects, and registered objects that cannot load are blocking errors. Published cross-references resolve within the compatible manifest. Registry ordering has no gameplay meaning without an explicit stable order field. Production releases identify the exact manifest used.

## 8. Scenario Contract

Every scenario defines `id`, `status`, `contentVersion`, `schemaVersion`, `title`, `summary`, `chapter`, `politicalPeriodWindow`, `category`, `priority`, `urgency`, `repeatability`, `location`, `participants`, `requiredCharacters`, `knowledgeContext`, `eligibility`, `exclusions`, `predecessors`, `followUps`, `opening`, `beats`, `choices`, `resolutionNotes`, `mediaHooks`, `continuityRequirements`, `ratingNotes`, and `developerNotes`.

Allowed categories are `direct_follow_up`, `mandatory`, `major`, `optional`, `ambient_media`, and `outcome`.

A scenario normally contains a meaningful decision; observation-only categories still require narrative purpose. Display alone never mutates state. Resolution requires an accepted mutation. Definitions contain no executable arbitrary code, no assumed family names, and no unavailable required participants. IDs remain stable after publication, repeatability is explicit, and mandatory scenarios cannot form uncontrolled cycles.

## 9. Scenario Beats and Dialogue Structure

A beat is an authored narrative unit that may define speaker, addressee, prose, concise stage direction, portrait and expression references, location, knowledge requirements, deterministic conditional and memory-aware variants, optional acknowledgment, next beat, and choice transition.

Beats are not React components. Speaker knowledge must be valid, variants deterministic and developer-explainable, and effects authorized only through a defined choice or system transition. Dialogue preserves character voices. No speaker knows classified or private facts without a valid information path, and variants cannot contradict objective canon. Full production dialogue is authored later.

## 10. Choice Contract

Every choice defines `id`, `scenarioId`, `label`, `playerIntent`, `availability`, `visibility`, `confirmationRequirement`, `baseEffects`, `conditionalEffects`, `delayedEffects`, `memoriesCreated`, `flagsAdded`, `flagsRemoved`, `mediaHooks`, `followUpIds`, `costSummary`, `developerExplanation`, and `ratingNotes`.

Visibility is exactly `visible`, `hidden_until_eligible`, or `visible_but_disabled`. A choice cannot be both hidden and disabled. Disabled choices give a safe player-facing reason when that reason does not leak hidden state.

The browser submits choice ID and intent, never calculated effects. Available choices have valid eligibility and contain no authoritative calculated outcome. Labels cannot promise unimplemented consequences. Major choices require a meaningful trade-off; cosmetic wording choices are marked non-mechanical. Duplicate IDs are blocking, and a resolved non-repeatable choice cannot resolve again.

## 11. Condition Contract

Conditions may reference only documented state and content concepts: chapter, political period, background, flags, memories, relationship, faction, regional, economic, government, security, international, and family ranges; laws and measures; projects; previous outcomes; character availability; content version; and save version.

Every condition defines type, field or reference, operator, expected value, player-visibility classification, and developer-mode failure explanation. Supported comparison concepts are equals, not equals, greater than, greater than or equal, less than, less than or equal, contains, does not contain, exists, does not exist, within range, all, any, and none.

Undefined fields, impossible ranges, and contradictory required conditions are blocking errors. Hidden conditions do not reveal exact values. Conditions contain no unrestricted source code, evaluate deterministically, and explain every pass or failure in developer mode.

## 12. Effect Contract

Supported executable effect families are closed normalized-score adjustments for national and family fields; typed relationship, faction, faction-regional-influence, and regional score adjustments; economy and typed regional-unemployment basis-point adjustments; exact-money adjustments; typed existing-memory weight adjustments; setting and removing registered flags; creating registered memories; typed character availability; explicit law-or-measure membership; explicit regional project membership; scheduling registered delayed effects or media; and triggering registered follow-up eligibility.

Every effect defines effect ID, type, target domain, target field or reference, operation, value, unit, source scenario and choice, visibility, justification, magnitude classification, and applicable conditions.

Effects use `SYSTEMS_DESIGN.md` units: money in Crown cents, rates in basis points, and normalized scores as integers. They cannot invent fields. Out-of-budget authored magnitudes fail validation; runtime clamping cannot conceal invalid authored content. Only the authoritative mutation engine applies effects, in the defined order, and retries cannot apply an effect twice.

Relationship effects identify a canonical NPC and one exact relationship field. Faction effects identify a canonical faction and either one exact score field or one canonical region for regional influence. Region effects identify a canonical region and an exact score or unemployment field. Memory-weight effects identify a registered memory that must already exist in runtime state. Regional project membership identifies both a registered project and canonical region; law-or-measure membership identifies the registered policy. Membership `add` is duplicate-safe, and `remove` is an idempotent no-op when the membership is absent.

Family score changes use the existing closed `normalized_score_adjustment` family paths. Media sentiment remains immutable authored content and may only be scheduled through its stable media ID. Intelligence-assertion mutation is deferred because the authoritative root save has no intelligence runtime domain. The registry rejects ambiguous generic relationship, faction, region, family, intelligence, and project updates rather than accepting content that cannot execute.

## 13. Conditional Effects

Every direct choice conditional effect defines the effect, required and excluded conditions, evaluation timing, stacking rule, and developer explanation. Timing is one of before base effects, after base effects, after relationship updates, or after memory creation. Direct `at_period_advancement` choice conditionals are invalid because the save has no persisted direct-conditional instance identity.

Default choice resolution follows `SYSTEMS_DESIGN.md`; content cannot redefine global ordering. Conflicting changes to one field require explicit order or produce a validation error. Stacking is explicit, deterministic variation is not rerolled, and conditions use a documented state snapshot.

Period-deferred behavior is authored as a registered delayed-effect definition. Conditions attached to delayed payload effects through `applicableConditionIds` are evaluated against authoritative state when that delayed effect becomes due. No synthetic pending ID or undocumented queue state is created.

## 14. Delayed-Effect Contract

Every delayed effect defines `id`, `sourceScenarioId`, `sourceChoiceId`, `creationPeriod`, `triggerPeriod` or a valid relative delay, `priority`, `payload`, `prerequisites`, `cancellationConditions`, `expiryConditions`, `idempotencyScope`, `status`, `failureBehavior`, `followUpContentIds`, and `developerExplanation`.

Allowed statuses are `pending`, `executed`, `cancelled`, `expired`, and `failed`. Published IDs remain stable and execution order follows `SYSTEMS_DESIGN.md`. Executed effects cannot repeat; cancellation and expiry remain auditable; failed blocking effects prevent unsafe advancement. Delayed effects cannot reference nonexistent future content or automatically expose a hidden source.

## 15. Memory Contract

Every memory defines `id`, `subjectId`, `targetId`, `sourceScenarioId`, `sourceChoiceId`, `emotionalWeight`, `politicalWeight`, `visibility`, `creationPeriod`, `decayRatePerPeriod`, `permanent`, `dialogueInfluenceTags`, `eventInfluenceTags`, `outcomeInfluenceTags`, `stackingRule`, `replacementRule`, and `developerDescription`.

Units and decay follow `SYSTEMS_DESIGN.md`; IDs remain stable. Missing memories cannot influence dialogue, permanent memories do not decay, and temporary memories require a valid rate. Duplicate creation uses an explicit stacking or replacement rule. Player text never exposes hidden weights. Existence and strength are distinct, and every memory represents something that occurred.

## 16. Flag Contract

Flags are discrete facts rather than arbitrary numeric state. Every flag defines `id`, description, visibility, creation sources, removal sources, permanence, and compatibility notes.

Use positive factual names where practical. Ambiguous IDs such as `bad_result`, `thing_done`, and `choice_two` are invalid. Flags do not duplicate normalized state without reason; threshold states are normally derived. A permanent true flag cannot be removable. Unknown references block validation, and customized names never appear in IDs.

## 17. Character Content Contract

Every character object defines stable character ID, display name or customizable role, age, required pronoun and grammar metadata, office or role, faction affiliations, public profile, private motivation, voice guidance, knowledge access, continuity state, portrait and expression references, relationship dimensions, memory references, availability rules, rating notes, and canon references.

Canonical NPCs come from `STORY_BIBLE.md`; first-family members use role IDs. Supported availability is `active`, `resigned`, `dismissed`, `unavailable`, `imprisoned`, `exiled`, or `deceased`. Changes require explicit events, and unavailable characters participate only where that state is supported. Portraits use approved asset IDs, and prose preserves public/private voice distinctions.

## 18. Customizable Family Token Contract

Approved tokens are:

```text
{{president.firstName}}  {{president.lastName}}  {{president.publicName}}
{{spouse.firstName}}     {{spouse.lastName}}
{{daughter.firstName}}   {{daughter.lastName}}
{{son.firstName}}        {{son.lastName}}
{{sibling.firstName}}    {{sibling.lastName}}
{{family.surname}}
```

A future token registry defines token ID, value source, allowed contexts, grammar, fallback, visibility, and validation examples. Production family names are never canonical or embedded in IDs and paths. Unknown or unresolved required tokens are blocking errors.

Rendering supports spaces, hyphens, apostrophes, Unicode, and long names. Possessive grammar is deliberate. Substitution occurs after content validation but before rendering, cannot inject executable markup or unsafe HTML, and always refers to adult family members.

## 19. Faction, Region, and Institution References

Faction content references Civic Renewal League, National Stewardship Union, and Workers’ Commonwealth. Region content references Orsanne Metropolitan District, Kestrel Industrial Basin, Lydra Agricultural Plain, and Roven Marches. Institutions use canonical names from `STORY_BIBLE.md`.

Aliases do not create canon. Stable IDs belong in registries; free text alone cannot reference factions or regions. Regional effects target defined regions and are not silently overwritten by national averages. Institutional authority remains consistent with canon.

## 20. Law, Decree, Measure, and Project Contract

Every law, decree, measure, or project defines stable ID, type, status, title, public summary, legal authority, sponsor, required approvals, political cost, exact fiscal cost, applicable recurring cost, implementation period, affected domains, immediate and delayed effects, faction reactions, regional effects, constitutional considerations, cancellation and completion behavior, and compatibility notes.

Conceptual types are law, decree, budget measure, emergency measure, and government project. A title alone is not implementation. Fiscal values use `MoneyMinor`, recurring costs are explicit, and project benefits cannot precede valid implementation timing. Decrees respect constitutional limits, content never assumes unlimited presidential authority, and quantity remains within `MVP_SCOPE.md`.

## 21. Intelligence Content Contract

Every intelligence assertion defines stable ID, subject, claim, classification, confidence score, source count and independence, corroboration, contradiction, possible manipulation, intentional-fabrication assessment, characters or institutions that know it, public-disclosure status, expiry or reassessment period, and related scenarios.

Confidence labels follow `SYSTEMS_DESIGN.md`. Low confidence alone is not deliberate disinformation. Player reports distinguish fact, assessment, and recommendation without exposing developer certainty. Intelligence is never omniscient. Leaks and disclosures require events, and characters reference only intelligence available to them.

## 22. Media Content Contract

Every media reaction defines stable ID, outlet ID, source event, known facts, editorial frame, headline, summary, sentiment, reach, credibility, publication period, public-knowledge and leak requirements, faction and regional audience implications, and related scenario and choice IDs.

Final articles are authored later. Sentiment uses `SignedWeight`; reach and credibility use normalized scores. Facts remain separable from interpretation. Classified facts require a valid path, media cannot alter objective canon, and one event may receive several credible framings. *The Orsanne Ledger* is the primary MVP outlet; other outlets remain within MVP scope.

## 23. Outcome and Epilogue Contract

The three MVP outcome IDs are `mvp_civic_stabilization`, `mvp_ordered_emergency`, and `mvp_fractured_mandate`.

Every outcome defines stable outcome ID, eligibility reference, selection priority, public title, summary, narrative tone, contributing-value references, required and excluded flags, epilogue references, developer explanation, and compatibility notes.

Every epilogue defines stable epilogue ID, subject, outcome association, eligibility, exclusions, prose, knowledge and continuity requirements, priority, and fallback behavior.

Eligibility formulas remain in `SYSTEMS_DESIGN.md` and are not duplicated or redefined by content. Outcome prose is authored later and no outcome depends on one choice. Epilogues respect availability and memory; customized names use approved tokens. Invalid state blocks resolution rather than selecting misleading prose.

## 24. Knowledge and Information Model

Important facts may identify audiences as objective canon, developer-known, institution-known, character-known, cabinet-known, player-known, public-known, leaked, rumored, or disputed.

Objective truth and public belief are separate. Rumors do not become truth automatically. Characters reference only known information. Player knowledge may exceed an individual's only through valid presentation. Developer truth never leaks into ordinary content. Information transitions require an event, disclosure, investigation, leak, inference, or publication and remain auditable in developer mode.

## 25. Continuity Contract

Every production scenario validates chapter, political period, location, participant availability, office holders, cabinet membership, resignation, dismissal, imprisonment, exile, life status, family role, previous choices, memories, public/private/classified knowledge, Assembly and constitutional status, border and crisis status, law, measure and project status, media exposure, and customized-family tokens.

Blocking defects include an unjustified unavailable participant, a dismissed minister acting as active, knowledge of an undisclosed secret, a resolved crisis described as unresolved, premature law effects, a hard-coded family name, a rumor asserted as fact, or contradictory chapter and period requirements.

## 26. Originality and Rating Validation

Every published narrative object defines originality status, rating notes, real-person-likeness status when art is referenced, prohibited-content review, and internal source or inspiration notes where required.

Originality status is exactly `unreviewed`, `reviewed_original`, `requires_revision`, or `blocked`. Unreviewed content cannot publish. Renamed copies of political-game content and direct copies of real countries, parties, politicians, scenes, choices, headlines, or endings are prohibited. Teen boundaries from `STORY_BIBLE.md` apply. Graphic sexual or violent content and operational instructions for terrorism, assassination, sabotage, coups, or military attacks are prohibited.

## 27. Content Versioning

Content uses semantic-style `major.minor.patch` versions with initial version `mvp-0.1.0`.

- Major: Incompatible contracts, removal of published IDs without compatibility, or fundamental outcome/save changes.
- Minor: Compatible scenarios, choices, media, optional content, and balancing-aware additions.
- Patch: Typographical, safe prose, metadata, and non-behavioral corrections.

Behavioral changes require change notes; a prose change may be behavioral if it changes player interpretation. Published IDs remain stable. Save compatibility is declared, withdrawn content defines existing-save handling, and content/schema versions stay separate. Git history alone never determines the version.

## 28. Schema Versioning

Every structured object has a schema version identifying structural compatibility, separate from authored publication compatibility. Schema migrations are explicit. Unknown future versions fail safely; supported older versions may use tested transformations. Migrations preserve IDs and never silently discard invalid fields. Parsing success alone does not prove semantic validity.

## 29. Validation Severities

Exact severities are `blocking`, `error`, `warning`, and `information`.

### Blocking

Prevents publication or safe loading, including duplicate IDs, unknown state fields, broken required references, impossible mandatory scenarios, unresolved family tokens, and incompatible versions.

### Error

Invalid content requiring correction, though it may be isolated when exclusion is safe. Examples include invalid magnitude, missing participants, contradictory conditions, and rating violations.

### Warning

Loadable content requiring review, such as unusually large aggregate effects, weak trade-offs, excessive prose, or a likely unreachable optional branch.

### Information

Non-blocking audit detail, such as an unused draft or compatibility-retained deprecated reference.

Blocking and error results cannot be silently downgraded.

## 30. Required Validation Categories

Validation covers schema integrity; duplicate and missing IDs; broken references; orphaned published content; unknown fields and tokens; unresolved tokens; units and numeric ranges; effect magnitude; contradictory conditions and impossible eligibility; unavailable characters; knowledge and continuity violations; predecessors; follow-up and delayed-effect cycles; idempotency IDs; outcome reachability and fallback; version compatibility; publication status; originality and rating; asset references; family-name safety; empty player text; duplicate labels within a scenario; unreachable choices; missing developer explanations; and missing behavioral change notes.

Every finding reports exact object IDs and paths.

## 31. Graph and Reachability Validation

The future validator builds graphs for scenario predecessors and follow-ups, direct follow-ups, mandatory chains, delayed effects, outcome routes, epilogue selection, and content references.

It detects missing nodes, illegal cycles, unreachable mandatory scenarios and outcomes, required-flow dead ends, optional content accidentally required for completion, cross-version follow-ups, and permanently contradictory eligibility. All three MVP outcomes remain reachable through distinct state combinations. Graph reachability does not prove narrative quality or balance.

## 32. MVP Content Inventory Target

The content boundary is Prologue plus Chapter 1; approximately 12–16 substantial scenarios; up to 4 optional or conditional scenarios; 6–8 major NPCs; the customizable first family; 3 factions; 4 regions; 4–6 laws, decrees, measures, or projects; one primary domestic crisis; one limited diplomatic conflict; one intelligence threat; one major family conflict; one cabinet conflict; one election-pressure thread; 3 MVP outcomes; and one primary media outlet with multiple framings.

Counts are scope boundaries, never filler quotas. Substantial scenarios require meaningful conflict and consequence. Short follow-ups are reported separately and cannot inflate progress. Quantity reporting distinguishes draft, reviewed, approved, and published content. File count is not a quality metric.

## 33. Authoring Workflow

1. Confirm the item belongs in MVP scope.
2. Assign stable IDs.
3. Identify canon references.
4. Identify system references.
5. Draft structure without final polish.
6. Validate schema.
7. Validate references.
8. Validate conditions and effects.
9. Review voice and continuity.
10. Review state consequences and balance.
11. Review family tokens.
12. Review originality and rating.
13. Review assets where applicable.
14. Run graph and reachability validation.
15. Move to `review`.
16. Correct findings through the responsible specialist.
17. Move to `approved`.
18. Include the object in a versioned publication manifest.
19. Run release verification.
20. Move to `published`.

Content Validator reports defects and never silently rewrites narrative, systems, or art-owned content.

## 34. Review Ownership

- Narrative Author owns prose, character voice, scene structure, continuity corrections, and canon consistency.
- Game Systems owns state fields, conditions, effects, magnitude, determinism, and outcome mechanics.
- Content Validator owns schemas, references, graph integrity, token validation, publication integrity, and defect reporting.
- Character Art Director owns portraits, expressions, asset status, and originality/rights metadata.
- Supabase Security owns publication permissions, protected storage, server hidden-state boundaries, and database enforcement.
- UI Director and Page Builder own rendered presentation, accessibility, and responsive behavior.
- Release Gate owns integrated evidence and publication/release decisions.

No specialist silently assumes another specialist's authority.

## 35. Publication Contract

Publication requires approved status, valid schema and references, a compatible manifest, content and schema versions, originality and rating approval, required asset approval, reachability validation, save-compatibility declaration, change notes, publication owner, and release evidence.

Repository presence, UI visibility, successful parsing, and preview deployment do not prove publication. Production publication requires explicit authorization. High-risk behavioral changes require withdrawal and rollback plans.

## 36. Error and Fallback Behavior

- Missing required published content blocks safe loading.
- Broken optional draft content is excluded and reported.
- Unknown published references and unresolved required tokens are blocking.
- Missing optional portraits use only explicitly approved fallback assets.
- Missing required portraits block publication where safe rendering is impossible.
- Incompatible save/content versions show explicit recoverable states.
- Invalid outcome state blocks outcome resolution.
- Failed delayed effects block unsafe period advancement.
- Empty media-reaction sets do not trigger fabricated dynamic content.

Every fallback is explicit, tested, and non-deceptive.

## 37. Deferred Content Capabilities

Deferred work includes the complete ten-chapter and 1983–1991 catalogs; complete election, coup, and strategic-war content; a large supporting cast; dozens of endings; full epilogues, art, and soundtrack; user-created mods; a public authoring studio; unrestricted runtime AI scenarios; localization beyond English; community publishing; and multiplayer narrative content.

The architecture may remain compatible with expansion but cannot claim deferred content exists.

## 38. Document Status

- Status: Foundation baseline
- Content authority: Authoritative for MVP content structure
- Implementation status: Not started
- Last reviewed commit: `ae1316f`
- Initial content version: `mvp-0.1.0`
- Release language: English
- Future schemas must implement this contract.
- Production content must pass validation before publication.
- Changes require deliberate review and version control.
- This document does not expand implementation beyond `docs/MVP_SCOPE.md`.
