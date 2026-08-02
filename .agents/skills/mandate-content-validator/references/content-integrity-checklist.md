# Content Integrity Checklist

## Contents

- [Preparation](#preparation)
- [IDs](#ids)
- [References](#references)
- [Schema](#schema)
- [Effects](#effects)
- [Eligibility](#eligibility)
- [Branching](#branching)
- [Family Tokens](#family-tokens)
- [Continuity](#continuity)
- [Media](#media)
- [Assets](#assets)
- [Content Rating](#content-rating)
- [Endings](#endings)
- [Achievements](#achievements)
- [Versioning](#versioning)
- [Report](#report)

## Preparation

- [ ] `AGENTS.md` read.
- [ ] Content Validator loaded.
- [ ] Narrative Author loaded when needed.
- [ ] Game Systems loaded when needed.
- [ ] Validation scope defined.
- [ ] Schema located.
- [ ] Registries located.
- [ ] Content version identified.
- [ ] Save compatibility considered.

## IDs

- [ ] Scenario IDs unique.
- [ ] Choice IDs unique per scenario.
- [ ] Character, faction, and region IDs unique.
- [ ] Law and decree IDs unique.
- [ ] Conflict and war IDs unique.
- [ ] Election, ending, and achievement IDs unique.
- [ ] Naming format valid.
- [ ] No family token appears in an ID.

## References

- [ ] Characters, factions, and regions resolve.
- [ ] Laws and projects resolve.
- [ ] Scenarios, choices, and follow-ups resolve.
- [ ] Delayed effects resolve.
- [ ] Media and assets resolve.
- [ ] Wars and elections resolve.
- [ ] Endings and achievements resolve.
- [ ] State fields resolve.

## Schema

- [ ] Required fields present.
- [ ] Types, enums, and versions correct.
- [ ] Required arrays non-empty.
- [ ] Choice and string limits valid.
- [ ] Date format valid.
- [ ] Content warnings valid.
- [ ] Token format valid.

## Effects

- [ ] Effect types, targets, and operations valid.
- [ ] Ranges valid.
- [ ] Timing and idempotency valid.
- [ ] Duplicate effects absent.
- [ ] Unintended cancellation absent.
- [ ] Narrative matches effects.
- [ ] Delayed triggers valid.

## Eligibility

- [ ] Conditions possible and ranges valid.
- [ ] Flags non-contradictory.
- [ ] Date and chapter valid.
- [ ] Characters available.
- [ ] War, election, and constitution states correct.
- [ ] Mandatory events reachable.

## Branching

- [ ] Follow-ups resolve.
- [ ] Mandatory cycles absent.
- [ ] Unsafe repeats and immediate self-triggers absent.
- [ ] Branches terminate or continue intentionally.
- [ ] Endings reachable.
- [ ] Ending priority and mutual exclusion valid.

## Family Tokens

- [ ] No family names hard-coded.
- [ ] Tokens approved, correctly spelled, and available in context.
- [ ] Long names, apostrophes, hyphens, Unicode, and possessives tested.
- [ ] Escaping safe.

## Continuity

- [ ] Political date valid.
- [ ] Character office, location, life status, imprisonment, and exile valid.
- [ ] Relationship, knowledge, and public scandal state valid.
- [ ] War, election, constitution, and family state valid.

## Media

- [ ] Outlet exists and voice is correct.
- [ ] Headline exists and facts match the event.
- [ ] Classified information handled correctly.
- [ ] Major public events receive coverage.
- [ ] Tokens valid and required transcripts present.

## Assets

- [ ] Files, paths, and path case valid.
- [ ] Required portrait expressions exist.
- [ ] Placeholders declared.
- [ ] Licenses recorded.
- [ ] Accessibility metadata present.
- [ ] Image and audio references unbroken.

## Content Rating

- [ ] Romantic characters are adults.
- [ ] Explicit sex, nudity, sexual violence, incest, graphic gore, and graphic torture absent.
- [ ] Operational crime instructions absent.
- [ ] Required content warnings present.
- [ ] Living politicians and real extremist propaganda absent.

## Endings

- [ ] Eligibility uses multiple conditions.
- [ ] Priority, specificity, exclusion, and deterministic ties valid.
- [ ] Endings reachable and epilogues complete.
- [ ] Duplicate unlock prevented.

## Achievements

- [ ] IDs unique and triggers valid.
- [ ] Hidden state valid.
- [ ] Duplicate unlock prevented.
- [ ] Description exists.
- [ ] Secret conditions do not leak.

## Versioning

- [ ] Schema and content versions valid.
- [ ] Stable IDs preserved.
- [ ] Migration impact and existing-save compatibility reviewed.
- [ ] Checksum and rollback available.

## Report

- [ ] Scope stated.
- [ ] Errors, warnings, and information listed.
- [ ] Locations precise and corrections recommended.
- [ ] Unexecuted checks disclosed.
- [ ] Publication decision stated.

Content is not valid merely because each individual file passes its schema.
References, branching, reachability, continuity, system effects, assets, and
version compatibility must also be valid.
