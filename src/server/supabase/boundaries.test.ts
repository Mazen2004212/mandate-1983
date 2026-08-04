import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../../..");

function source(path: string): string {
  return readFileSync(resolve(REPOSITORY_ROOT, path), "utf8");
}

describe("Supabase module and secret boundaries", () => {
  it("marks the request-scoped server client as server-only", () => {
    const serverClient = source("src/server/supabase/server-client.ts");
    expect(serverClient.startsWith('import "server-only";')).toBe(true);
    expect(serverClient).toContain("await cookies()");
    expect(serverClient).not.toContain("SERVICE_ROLE");
  });

  it("keeps the browser client on public environment variables", () => {
    const browserClient = source("src/lib/supabase/browser-client.ts");
    expect(browserClient.startsWith('"use client";')).toBe(true);
    expect(browserClient).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(browserClient).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    expect(browserClient).not.toContain("@/server/");
    expect(browserClient).not.toContain("SERVICE_ROLE");
  });

  it("does not define a browser-reachable service-role variable", () => {
    const publicEnvironment = source("src/lib/env/public.ts");
    const exampleEnvironment = source(".env.example");
    expect(publicEnvironment).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(exampleEnvironment).not.toContain("SUPABASE_SERVICE_ROLE_KEY=");
  });

  it("keeps the save repository and database credential server-only", () => {
    const repository = source("src/server/persistence/save-repository.ts");
    const gateway = source("src/server/persistence/postgres-gateway.ts");
    const serverEnvironment = source("src/server/env.ts");
    const browserClient = source("src/lib/supabase/browser-client.ts");
    expect(repository.startsWith('import "server-only";')).toBe(true);
    expect(gateway.startsWith('import "server-only";')).toBe(true);
    expect(serverEnvironment).toContain("SUPABASE_DATABASE_URL");
    expect(browserClient).not.toContain("SUPABASE_DATABASE_URL");
    expect(repository).not.toContain("SERVICE_ROLE");
    expect(gateway).not.toContain("SERVICE_ROLE");
  });

  it("keeps private persistence functions outside exposed Data API schemas", () => {
    const config = source("supabase/config.toml");
    const migration = source(
      "supabase/migrations/20260804110000_task_11_save_repository.sql",
    );
    expect(config).toContain('schemas = ["public", "graphql_public"]');
    expect(config).not.toContain(
      'schemas = ["public", "graphql_public", "mandate_private"]',
    );
    expect(migration).not.toContain("create function public.");
    expect(migration).toContain("set search_path = ''");
  });
});
