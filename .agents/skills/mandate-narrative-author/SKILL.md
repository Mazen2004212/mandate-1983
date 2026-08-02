---
name: mandate-narrative-author
description: "Use when planning, writing, revising, structuring, reviewing, or integrating authored political, family, diplomatic, intelligence, military, election, media, dialogue, ending, or epilogue content for MANDATE: 1983. Do not use for visual-only UI work, backend-only implementation, database-only tasks, static art production, or simulation-balancing work without authored narrative content."
---

# Author MANDATE: 1983 Narrative

Control writing quality, structure, continuity, voice, branching, and narrative integration. Use `mandate-game-systems` whenever narrative creates or depends on state rules, consequences, eligibility, delayed effects, elections, coups, war, or endings; that skill controls simulation correctness and state behavior. Use `mandate-ui-director` and `mandate-page-builder` only when also implementing or substantially changing the visible screen that presents the narrative.

Read [the narrative standards](references/narrative-standards.md), [the scenario contract](references/scenario-contract.md), and [the narrative review checklist](references/narrative-review-checklist.md) completely before writing.

## Understand the Narrative Task

Before writing:

1. Read the repository-root `AGENTS.md`, this skill, and all three references.
2. Inspect the available world bible, character bible, chapter plan, scenario definitions, state model, and related narrative content.
3. Identify the chapter, political period, scene category, narrative purpose, and participants.
4. Identify what each participant wants, knows, hides, and misunderstands.
5. Identify what the player knows and what must remain uncertain.
6. Identify required state inputs, immediate and delayed consequences, and prior memories or promises.
7. State a brief writing and integration plan.

Never write an isolated scene without understanding its place in the chapter and game route.

## Preserve Originality

Create completely original countries, regions, institutions, parties, movements, characters, leaders, family members, fictional ideological organizations, events, wars, constitutional disputes, dialogue, media, geography, and endings.

Do not copy another political game's plot, scene structure, distinct combinations of archetypes, dialogue, choice wording, interface language, countries, parties, news, lore, endings, or memorable terminology. Never disguise copied material by renaming it.

## Write Polished English

Write English-only release content with natural, period-appropriate language, clear political terminology, and distinct voices. Avoid modern internet slang, repetitive AI phrasing, unnecessary exposition, "as you know" dialogue, shared-knowledge explanations, theatrical villain speeches, excessive ellipses or em dashes, and long paragraph walls. Keep dialogue comfortable to read on screen.

## Maintain Tone

Combine political tension, institutional realism, personal pressure, moral ambiguity, Cold War uncertainty, bureaucratic detail, family conflict, strategic danger, restrained humor, and human vulnerability.

Avoid constant melodrama or hopelessness, cartoon evil, simplistic heroes, preachy lectures, modern social-media discourse, tone-breaking comedy, and gratuitous shock.

## Protect the Teen Rating

Allow political betrayal, corruption, bribery, blackmail, espionage, implied consensual adult affairs, marriage conflict, family scandal, protests, imprisonment, coup and assassination attempts, non-graphic war and death, high-level terror threats, and period-appropriate alcohol or smoking references.

- Make every romantic character an adult.
- Exclude explicit sex, nudity, pornographic dialogue, sexual violence, incest, graphic gore, and graphic torture.
- Exclude detailed real-world methods for terrorism, assassination, coups, or military operations.
- Exclude real extremist propaganda, real political parties, and living politicians.
- Never portray a real ethnic, national, or religious group as inherently criminal, violent, or inferior.

Present adult relationships through emotion, letters, rumors, witnesses, non-explicit photographs, closed doors, cutaways, fades to black, and political or family consequences.

## Give Every Scene Purpose

Make each scene introduce conflict, develop character, reveal or complicate useful information, force a political or personal decision, resolve or escalate a choice, establish a delayed consequence, change a relationship, faction, region, or media interpretation, advance the chapter climax, or contribute to an ending or epilogue.

Reject filler, repeated information, contextless number changes, irrelevant lore, restatements, and obviously correct options.

## Distinguish Character Voices

Document each major character's vocabulary, sentence length, formality, restraint, humor, worldview, professional vocabulary, avoided topics, emotional triggers, public voice, private voice, and pressure behavior. Never let every character sound like the narrator.

- Let economists discuss constraints, forecasts, debt, production, and incentives.
- Let generals discuss readiness, logistics, morale, and high-level strategic risk.
- Let lawyers discuss authority, procedure, precedent, and constitutional limits.
- Let journalists discuss sources, evidence, public interest, and credibility.
- Let diplomats discuss leverage, recognition, treaties, and consequences.
- Let family members speak personally rather than like cabinet officials.

## Structure Scenarios

Complete [the scenario contract](references/scenario-contract.md) for every substantial scenario. Define stable identity, chapter and period, category, location, participants, purpose, entry and exclusion conditions, knowledge, opening, beats, choices, responses, state effects, memories, flags, follow-ups, expiration, ending relevance, and content warnings.

Keep authored narrative outside generic React components.

## Design Choices

Make every major choice understandable, distinct, politically meaningful, situationally credible, written in the president's voice, free of hidden wording tricks, connected to game systems, and capable of believable consequences. Normally offer three to five choices, varying patterns such as support, opposition, compromise, delay, investigation, delegation, concealment, disclosure, negotiation, threats, legal procedure, or bypassing procedure.

Avoid perfect choices, one serious option surrounded by jokes, cosmetic wording differences, ignored selections, unjustified false choices, exposed raw effect numbers, and unsupported gotchas. Preserve uncertainty while making consequences explainable later.

## Integrate Consequences

Normally give each major choice one immediate narrative response, one political or government consequence, one faction or regional consequence, one character or relationship consequence, one delayed or cumulative consequence, and one possible media interpretation.

Use `mandate-game-systems` to define valid effects. Never invent undefined state-variable names. Make prose and effects agree: if the military receives higher salaries, reflect both the budget cost and military reactions.

## Preserve Memories and Continuity

Let characters remember promises, betrayals, protection, humiliation, appointments, dismissals, investigations, bribes, reforms, repression, leaks, pardons, family treatment, war decisions, election behavior, and private confessions. Reference important memories naturally and only when they occurred in the current save.

Check character location, office, relationship and life status, resignation or imprisonment, war, election, constitution, family names, political date, known secrets, and exposed secrets.

## Use Customized First-Family Names

Never hard-code customizable first-family names. Use approved tokens:

```text
{{president.firstName}}  {{president.lastName}}  {{president.publicName}}
{{spouse.firstName}}     {{spouse.lastName}}
{{daughter.firstName}}   {{daughter.lastName}}
{{son.firstName}}        {{son.lastName}}
{{sibling.firstName}}    {{sibling.lastName}}
{{family.surname}}
```

Test short and long names, apostrophes, hyphens, spaces, and Unicode. Write possessives and greetings that remain grammatical with unusual names.

## Write Political Conflict

Build conflicts from competing interests: stability and liberty, growth and equality, security and oversight, readiness and civilian control, independence and foreign support, subsidies and fiscal stability, central authority and regional autonomy, press freedom and secrecy, family loyalty and equal law, electoral survival and integrity, or war aims and civilian cost.

Never make one ideology inherently intelligent and every alternative foolish. Write competent and flawed characters across political positions.

## Write War, Coup, and Intelligence Scenes

Focus war scenes on objectives, readiness, logistics, morale, uncertainty, civilian effects, diplomacy, public support, tradeoffs, and command responsibility. Keep them abstract and non-operational.

Focus coup scenes on uncertainty, loyalty, legitimacy, conflicting reports, institutional pressure, public response, negotiation, and consequences.

Label intelligence as confirmed, credible assessment, probability, unverified claim, contradiction, or possible fabrication. Never make reports magically correct.

## Write Media

Define each outlet's ideology, audience, credibility, tone, government relationship, and editorial priorities. Separate headline, summary, interpretation, known fact, rumor, propaganda, and omitted context. Allow credible outlets to frame the same event differently. Avoid modern social-media-style headlines.

## Write Laws and Documents

Give laws, decrees, treaties, and reports an institution, title, date, reference number, purpose, main provisions, cost or resource implications, supporters, opponents, risks, authority, and available actions. Use plausible, readable language without meaningless legal filler.

## Write Endings and Epilogues

Base major endings on combinations of institutions, economy, elections, war, coups, family, relationships, memories, regions, foreign alignment, and legitimacy. Never use one isolated choice.

Cover the president, spouse, adult daughter, adult son, sibling, major characters, government, constitution, economy, armed forces, regions, foreign relations, and civil rights where relevant. Prefer earned mixed consequences over total paradise or complete ruin.

## Review Narrative Work

Before completion:

1. Validate scenario structure, references, and family-name tokens.
2. Validate effect names and ranges with `mandate-game-systems`.
3. Check voice, continuity, choice distinctness, delayed consequences, rating, originality, and screen readability.
4. Confirm all branches resolve or intentionally remain open.
5. Run available content tests.
6. Report only checks actually executed.

Use [the narrative review checklist](references/narrative-review-checklist.md).

## Report Delivery

Report content created or changed, chapter and period, scenario IDs, characters, purpose, choices, immediate and delayed consequences, memories, follow-ups, state fields, customized-name tokens, continuity, rating and originality checks, validation, tests, limitations, and skipped checks with reasons.
