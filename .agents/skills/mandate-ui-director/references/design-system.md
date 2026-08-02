# Product Visual Identity

MANDATE: 1983 must look like a premium illustrated political thriller set in an alternate-history 1980s world. Combine presidential power, political tension, bureaucracy, espionage, Cold War uncertainty, family pressure, economic crisis, elections, coup danger, and war-room strategy.

Make the interface feel physical and period-specific, never like a modern business dashboard. Build an original identity; do not copy *Suzerain* or another game's protected visual expression.

## Core Materials

| Material | Appropriate use |
| --- | --- |
| Dark stained wood | Desks, office framing, navigation backplates, and ceremonial surfaces |
| Aged cream paper | Decrees, reports, letters, dossiers, and map annotations |
| Matte black folders | Classified records, intelligence navigation, and restricted content |
| Deep green leather | Executive furniture, desk surfaces, and formal institutional accents |
| Burgundy fabric | Ceremonial rooms, election settings, and restrained faction emphasis |
| Brass | Selected states, seals, hardware, dividers, and important accents |
| Ink | Typography, signatures, borders, stamps, and hand-marked notes |
| Typewritten reports | Classified briefs, transcripts, and operational summaries |
| Newspaper halftone | Press imagery, election coverage, and public-opinion material |
| Analog television glass | Broadcast frames, scan-line treatments, and election-night media |
| Photographic prints | Character evidence, family memories, and intelligence attachments |
| Wax and rubber stamps | Approval, rejection, classification, urgency, and legal status |
| Map paper | Political, regional, economic, and military maps |
| Metal filing cabinets | Archival navigation and bureaucratic storage contexts |

Keep textures subtle. Never allow grain, distress, reflections, stains, scan lines, or material effects to reduce readability.

# Color Tokens

## Base Palette

| Token | Value |
| --- | --- |
| Ink Black | `#171B1A` |
| Coal | `#252B29` |
| Deep Green | `#17352E` |
| Forest Green | `#29483D` |
| Navy | `#24364B` |
| Burgundy | `#6A2935` |
| Dark Burgundy | `#431A24` |
| Brass | `#B68A45` |
| Old Gold | `#96713A` |
| Paper | `#E7DEC9` |
| Light Paper | `#F2EBDD` |
| Dark Paper | `#C9BFA9` |
| Olive | `#62694B` |
| Warning Red | `#A84538` |
| Success Green | `#47725A` |
| Information Blue | `#47687A` |
| Muted Text | `#77766E` |
| Warm White | `#F9F6EE` |

## War-Map Palette

| Token | Value |
| --- | --- |
| Friendly Control | `#355F6D` |
| Enemy Control | `#7B3A3D` |
| Contested | `#A47A3B` |
| Neutral Control | `#79796E` |
| Supply Route | `#C49B55` |
| Civilian Risk | `#A85D44` |

Expose colors through semantic CSS variables such as surface, text, border, status, and map-state roles. Do not scatter literal color values through components. Communicate every state with labels plus at least one additional non-color cue such as patterns, borders, hatching, shapes, or icons.

# Typography

- Use IBM Plex Sans for application UI.
- Use IBM Plex Serif for dialogue and formal documents.
- Use Special Elite or another properly licensed typewriter font for classified material.
- Use tabular numerals for statistics, dates, money, polling, and aligned metrics.
- Use no more than three font families on one screen.

| Role | Size |
| --- | --- |
| Display title | 42px |
| Page title | 32px |
| Section title | 23px |
| Component title | 18px |
| Body | 16px |
| Secondary text | 14px |
| Metadata | 12px |
| Large national metric | 28px |

Keep normal body text at least 15px on desktop and 16px on mobile. Do not use metadata sizing for essential instructions, choices, or status.

# Spacing and Geometry

| Element | Measurement |
| --- | --- |
| Top command bar | 64px |
| Collapsed left navigation | 76px |
| Expanded left navigation | 232px |
| Context panel | 320px |
| Desktop page padding | 24px |
| Tablet page padding | 18px |
| Mobile page padding | 14px |
| Standard component gap | 16px |
| Major section gap | 24px |
| Minimum touch target | 44px |
| Most corner radii | 3px–8px |

Do not place every section inside a card. Use composition, dividers, document edges, furniture, map boundaries, and typographic hierarchy to structure pages.

# Borders and Shadows

- Use thin dark-ink borders for ordinary separation.
- Use brass accent borders for selected or important objects.
- Keep shadows restrained and physically plausible.
- Do not use glowing neon effects, large blurred SaaS-style shadows, or excessive floating cards.

# Main Application Shell

Compose the shell from a 64px top command bar, a left navigation rail, a fluid main area, and an optional 320px context panel. Add a contextual bottom ticker only when it communicates timely information useful to the current decision.

The top bar may show the national emblem, country name, chapter, political date, treasury, approval, stability, security, war status, notifications, save status, and settings. Never expose hidden game variables or raw simulation values the player should infer through narrative evidence.

# Page-Specific Visual Identities

## Landing Page

Set the landing page in a dark presidential office with rain on windows, a desk lamp, rotary telephone, and distant city lights. Use a large title and restrained menu. Do not use an ordinary marketing-site hero layout.

## New Game and Family Setup

Present a presidential dossier with six-step progress, portrait cards, family-name inputs, a live dossier preview, campaign documents, and a signature preview.

## Presidential Office

Use an illustrated physical office with clickable desk objects, today's agenda, an urgent news ticker, and state-dependent environmental changes. Keep interactions legible and purposeful; do not turn it into a hidden-object game.

## Dialogue

Show a large editorial portrait, character identity and role, a formal dialogue panel, three to five meaningful choices, evidence or document support, and dialogue history. Do not reveal raw consequence numbers.

## Cabinet

Compose a cabinet table with visible participants, current speaker, agenda, cabinet unity, recommendations, and character reactions.

## Documents and Decrees

Show the ministry seal, document number, classification, date, legal summary, supporters, opponents, and risks. Support sign, veto, amend, delay, and send-to-parliament actions as applicable.

## Political Map

Use an original SVG map with a paper base, dark ink borders, region labels, rivers, railways, ports, roads, cities, mines, energy fields, and bases. Provide selectable layers, pattern-based states, and a context panel.

## Economy

Combine a ledger and government report. Present treasury, debt, inflation, unemployment, growth, reserves, spending, revenue, accessible trend charts, minister recommendations, and major projects.

## Intelligence

Use classified folders, redactions, photographs, an evidence timeline, source reliability, contradictions, and analyst recommendations.

## Diplomacy

Use a world map, relationship levels, treaties, a negotiation desk, flags, and formal agreement documents.

## Military and War Room

Use a strategic map, military briefings, abstract fictional counters, fronts, supplies, morale, intelligence confidence, and high-level orders. Never introduce manually controlled soldiers.

## Family

Use a residence photo album, framed portraits, letters, a personal timeline, public reputation, and private trust. Do not reduce relationships to a simple romance-heart meter.

## Media

Use newspapers, 4:3 television, analog radio, opinion polling, period typography, transcripts, and captions.

## Elections

Use candidate portraits, a regional map, polls, a campaign calendar, an election-night television studio, and sequential regional results.

# Character Portrait Direction

- Use semi-realistic editorial illustration in a 4:5 aspect ratio from a 1200×1500 master.
- Frame characters bust or waist-up in a three-quarter pose.
- Use period-correct clothing, consistent camera height, consistent crop, strong but realistic silhouettes, and restrained textured backgrounds.
- Avoid real-person likenesses and cartoon exaggeration.
- Produce neutral, supportive, concerned, angry, suspicious, and exhausted expressions.

# Iconography

Create custom SVG icons for political, economic, military, faction, intelligence, media, family, and constitutional concepts. Keep stroke, fill, optical weight, and sizing consistent. Do not use emoji. Use a generic icon library only for mundane utility actions.

# Motion

Allow restrained telephone-light blinking, clock movement, rain, television scan lines, paper transitions, stamp impacts, small map-region transitions, and short metric changes.

Disallow constant floating movement, excessive parallax, springy modern-app animation, and decorative motion that delays decisions. Respect reduced-motion preferences for every motion effect.

# Responsive Rules

Design desktop-first without treating smaller screens as reduced desktop canvases.

## Tablet

- Collapse navigation.
- Convert the right panel to a drawer where needed.
- Preserve document readability.

## Mobile

- Use a single-column layout.
- Present documents full-screen.
- Present dialogue portraits full-screen where useful.
- Use bottom navigation.
- Collapse metrics without hiding essential state.
- Provide no hover-only controls.
- Maintain 44px minimum touch targets.

# Accessibility

- Provide visible keyboard focus and logical focus order.
- Use semantic headings and accurate screen-reader labels.
- Provide text alternatives for maps and data alternatives for charts.
- Make status understandable without color.
- Respect reduced-motion and high-contrast preferences.
- Support 200% browser zoom without loss of content or operation.
- Accommodate long customized names and long dialogue without clipping or overlap.
