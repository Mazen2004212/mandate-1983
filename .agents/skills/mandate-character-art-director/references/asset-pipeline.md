# Character Asset Pipeline

## Contents

- [Pipeline Stages](#pipeline-stages)
- [Suggested Production Folders](#suggested-production-folders)
- [Naming Convention](#naming-convention)
- [Metadata](#metadata)
- [Prompt Versioning](#prompt-versioning)
- [Technical Preparation](#technical-preparation)
- [UI Integration](#ui-integration)
- [Replacement Safety](#replacement-safety)
- [Licensing](#licensing)

## Pipeline Stages

1. Write the character brief.
2. Complete the visual identity sheet.
3. Prepare an original prompt or commission brief.
4. Generate or commission concepts.
5. Review concepts for identity, originality, period, style, and rights.
6. Select and mark a production candidate.
7. Complete an expression consistency pass.
8. Complete a clothing consistency pass.
9. Prepare crop, format, optimization, and metadata.
10. Integrate the asset into the real UI.
11. Review responsive presentation.
12. Review accessibility behavior.
13. Complete metadata and licensing records.
14. Grant final approval only after every gate passes.
15. Replace later assets through an explicit, versioned process.

## Suggested Production Folders

Create these folders only when application production begins:

```text
public/art/characters/
public/art/characters/family-presets/
public/art/characters/supporting/
public/art/characters/expressions/
public/art/characters/archive/
.prompts/characters/
docs/art/
scripts/art/
```

Do not create them during the character-art skill creation task.

## Naming Convention

Build filenames from a stable character ID, expression, clothing variant, version, and extension:

`{character_id}__{expression}__{variant}__v{version}.{extension}`

Examples:

- `prime_minister__neutral__formal__v01.webp`
- `prime_minister__angry__formal__v01.webp`
- `prime_minister__concerned__crisis__v02.webp`

Store them conceptually under `characters/{character_id}/`. Use lowercase machine IDs and stable vocabulary. Never derive a path from a player-customized family name or mutable display name.

## Metadata

Keep a sidecar metadata record containing:

- Asset ID
- Character ID
- Expression
- Clothing or presentation variant
- Version
- Status
- Source
- License
- Attribution requirements
- Prompt version
- Generated or obtained date
- Width and height
- Format
- File size
- Reviewer
- Review date
- UI screens checked
- Replacement or deprecation relationship

Do not require a particular metadata storage format before application architecture is initialized. Choose and validate the format when production architecture exists.

## Prompt Versioning

Use a stable prompt filename with:

- A clear version header
- The shared style anchor
- A character-specific identity section
- An expression-specific section
- Negative constraints
- Revision notes
- Associated output IDs

Increment the prompt version when meaning changes. Record the exact prompt version in each output's metadata so reviewers can reproduce and compare iterations.

## Technical Preparation

For each production candidate:

1. Confirm the intended safe crop and aspect ratio.
2. Preserve the approved master and create web sizes without destructive upscaling.
3. Choose WebP by default, PNG for transparency or lossless review, SVG for vector overlays, or JPEG only for approved photographic texture.
4. Use a correct color profile and inspect skin tones on target displays.
5. Verify transparency edges when present.
6. Inspect sharpness after resizing.
7. Inspect compression at the rendered UI size.
8. Record file size, width, and height.
9. Produce responsive variants only when their performance or crop benefit is justified.
10. Remove unnecessary metadata without deleting required provenance and rights records.

## UI Integration

Use `mandate-ui-director` and test portraits in:

- Dialogue
- Cabinet
- Family setup
- Family page
- Intelligence dossiers
- Elections
- Media
- Endings
- Mobile layouts

Verify dark and paper surfaces, compact cards, large presentations, mobile crops, 200% zoom, long labels, multiple expressions, loading behavior, dimensions, and layout stability. Capture and inspect representative screenshots before final approval.

## Replacement Safety

When replacing an asset:

- Preserve the stable asset ID when the identity and contract remain the same.
- Increment the asset and prompt versions as appropriate.
- Use `mandate-content-validator` to validate every production reference.
- Remove references to deprecated versions.
- Preserve save compatibility; do not derive persistent state from a replaceable path.
- Do not silently replace approved artwork without review.
- Keep a recoverable rollback path until the replacement is approved.
- Record the replacement relationship in metadata.

## Licensing

Maintain a license record for every non-original external asset. Record source, license text or identifier, commercial-use permission, attribution, modification permission, and acquisition date.

For generated assets, record the tool, model or service where known, prompt version, creation date, and available rights assumptions or terms. Do not assert legal certainty when license terms have not been reviewed. Escalate uncertain rights status and withhold final approval.
