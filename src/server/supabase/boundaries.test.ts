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
});
