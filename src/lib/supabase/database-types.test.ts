import { describe, expectTypeOf, it } from "vitest";

import type { Database, Json } from "./database.types";

type SaveRow = Database["public"]["Tables"]["saves"]["Row"];
type SaveUpdate = Database["public"]["Tables"]["saves"]["Update"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type MutationUpdate =
  Database["public"]["Tables"]["mutation_history"]["Update"];

describe("permission-aware database client types", () => {
  it("maps the supported save metadata and JSON document columns", () => {
    expectTypeOf<SaveRow["save_version"]>().toEqualTypeOf<"save-1.0.0">();
    expectTypeOf<SaveRow["content_version"]>().toEqualTypeOf<"mvp-0.1.0">();
    expectTypeOf<SaveRow["schema_version"]>().toEqualTypeOf<"schema-1.0.0">();
    expectTypeOf<SaveRow["authoritative_state"]>().toEqualTypeOf<Json>();
  });

  it("narrows browser-role updates to the granted timestamp columns", () => {
    expectTypeOf<SaveUpdate>().toEqualTypeOf<{ updated_at?: string }>();
    expectTypeOf<ProfileUpdate>().toEqualTypeOf<{ updated_at?: string }>();
    expectTypeOf<MutationUpdate["save_id"]>().toEqualTypeOf<never>();
  });
});
