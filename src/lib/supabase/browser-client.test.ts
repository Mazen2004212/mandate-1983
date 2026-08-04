import { describe, expect, it } from "vitest";

import { createSupabaseBrowserClient } from "./browser-client";

describe("Supabase browser client foundation", () => {
  it("uses only the validated public project configuration", () => {
    const client = createSupabaseBrowserClient({
      NEXT_PUBLIC_APP_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_local_test_key_123456789",
    });

    expect(client.auth).toBeDefined();
    expect(client.storage).toBeDefined();
  });
});
