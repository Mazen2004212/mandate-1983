import { describe, expect, it } from "vitest";

import {
  INITIAL_CONTENT_VERSION,
  contentVersionSchema,
  familyIdentitySchema,
  familyNameSchema,
  saveVersionSchema,
  schemaVersionSchema,
  utcTimestampSchema,
} from "./index";
import { createValidFamilyIdentityFixture } from "./test/fixtures";

describe("family identity", () => {
  it.each(["Jean Luc", "Ana-María", "O'Rian", "李明", "Éloïse"])(
    "accepts supported name %s",
    (name) => {
      expect(familyNameSchema.parse(name)).toBe(name);
    },
  );

  it("supports deliberately long names within the documented UI resilience bound", () => {
    expect(familyNameSchema.safeParse("A".repeat(64)).success).toBe(true);
    expect(familyNameSchema.safeParse("A".repeat(65)).success).toBe(false);
  });

  it.each([
    "",
    "   ",
    " Leading",
    "Trailing ",
    "Line\nBreak",
    "Zero\u200BWidth",
  ])("rejects invalid family name %s", (name) => {
    expect(familyNameSchema.safeParse(name).success).toBe(false);
  });

  it("keeps markup-like names inert as untransformed data", () => {
    const name = "<strong>Ana</strong>";
    expect(familyNameSchema.parse(name)).toBe(name);
  });

  it("validates all fixed adult role identities without canonical names", () => {
    const family = createValidFamilyIdentityFixture();
    expect(familyIdentitySchema.safeParse(family).success).toBe(true);
    expect(family.president.role).toBe("president");
    expect(family.spouse.role).toBe("spouse");
    expect(family.adultDaughter.role).toBe("adult_daughter");
    expect(family.adultSon.role).toBe("adult_son");
    expect(family.adultSibling.role).toBe("adult_sibling");
  });

  it("rejects role substitution and unknown fields", () => {
    const family = createValidFamilyIdentityFixture();
    const wrongRole = {
      ...family,
      spouse: { ...family.spouse, role: "president" },
    };
    expect(familyIdentitySchema.safeParse(wrongRole).success).toBe(false);
    expect(
      familyIdentitySchema.safeParse({ ...family, canonicalName: "Fixed" })
        .success,
    ).toBe(false);
  });
});

describe("version and timestamp contracts", () => {
  it("keeps save, content, and schema versions independent", () => {
    expect(saveVersionSchema.safeParse("save-1.2.3").success).toBe(true);
    expect(
      contentVersionSchema.safeParse(INITIAL_CONTENT_VERSION).success,
    ).toBe(true);
    expect(schemaVersionSchema.safeParse("schema-2.0.1").success).toBe(true);
    expect(saveVersionSchema.safeParse("mvp-1.2.3").success).toBe(false);
    expect(contentVersionSchema.safeParse("schema-1.2.3").success).toBe(false);
    expect(schemaVersionSchema.safeParse("save-1.2.3").success).toBe(false);
  });

  it.each(["mvp-01.0.0", "mvp-1.0", "1.0.0", "mvp-v1.0.0", ""])(
    "rejects malformed content version %s",
    (version) => {
      expect(contentVersionSchema.safeParse(version).success).toBe(false);
    },
  );

  it("requires canonical UTC timestamps", () => {
    expect(
      utcTimestampSchema.safeParse("1983-01-01T00:00:00.000Z").success,
    ).toBe(true);
    expect(
      utcTimestampSchema.safeParse("1983-01-01T02:00:00.000+02:00").success,
    ).toBe(false);
    expect(
      utcTimestampSchema.safeParse("1983-02-30T00:00:00.000Z").success,
    ).toBe(false);
  });
});
