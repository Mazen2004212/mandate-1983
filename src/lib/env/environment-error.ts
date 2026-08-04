import type { z } from "zod";

export class EnvironmentConfigurationError extends Error {
  constructor(scope: "public" | "server", issues: z.core.$ZodIssue[]) {
    const fields = [
      ...new Set(
        issues
          .map((issue) => issue.path[0])
          .filter((field): field is string => typeof field === "string"),
      ),
    ];
    const suffix = fields.length > 0 ? ` (${fields.join(", ")})` : "";
    super(`Invalid ${scope} environment configuration${suffix}.`);
    this.name = "EnvironmentConfigurationError";
  }
}
