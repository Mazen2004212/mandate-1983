import { compareAscii, uniqueSorted } from "../common";
import type {
  ContentGraphAnalysis,
  ContentGraphFinding,
  ContentGraphFindingCode,
  ContentGraphInput,
} from "./graph-result";

function finding(
  severity: ContentGraphFinding["severity"],
  code: ContentGraphFindingCode,
  scenarioIds: readonly string[],
  path: readonly (string | number)[],
  message: string,
): ContentGraphFinding {
  return Object.freeze({
    severity,
    code,
    scenarioIds: uniqueSorted(scenarioIds),
    path: Object.freeze([...path]),
    message,
  });
}

function findingOrder(
  left: ContentGraphFinding,
  right: ContentGraphFinding,
): number {
  return (
    compareAscii(left.code, right.code) ||
    compareAscii(left.scenarioIds.join("|"), right.scenarioIds.join("|")) ||
    compareAscii(left.path.join("."), right.path.join("."))
  );
}

function findCycles(
  activeIds: readonly string[],
  outgoing: ReadonlyMap<string, ReadonlySet<string>>,
): readonly (readonly string[])[] {
  let nextIndex = 0;
  const indexes = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const components: string[][] = [];

  function visit(id: string): void {
    indexes.set(id, nextIndex);
    lowLinks.set(id, nextIndex);
    nextIndex += 1;
    stack.push(id);
    onStack.add(id);

    const destinations = [...(outgoing.get(id) ?? [])].sort(compareAscii);
    for (const destination of destinations) {
      if (!indexes.has(destination)) {
        visit(destination);
        lowLinks.set(
          id,
          Math.min(lowLinks.get(id) ?? 0, lowLinks.get(destination) ?? 0),
        );
      } else if (onStack.has(destination)) {
        lowLinks.set(
          id,
          Math.min(lowLinks.get(id) ?? 0, indexes.get(destination) ?? 0),
        );
      }
    }

    if (lowLinks.get(id) !== indexes.get(id)) return;
    const component: string[] = [];
    let member: string | undefined;
    do {
      member = stack.pop();
      if (member !== undefined) {
        onStack.delete(member);
        component.push(member);
      }
    } while (member !== id);
    const selfLinked = (outgoing.get(id) ?? new Set()).has(id);
    if (component.length > 1 || selfLinked) {
      components.push(component.sort(compareAscii));
    }
  }

  for (const id of activeIds) if (!indexes.has(id)) visit(id);
  return components.sort((left, right) =>
    compareAscii(left.join("|"), right.join("|")),
  );
}

export function analyzeContentGraph(
  input: ContentGraphInput,
): ContentGraphAnalysis {
  const allIds = Object.keys(input.scenarios).sort(compareAscii);
  const manifestIds =
    input.manifest === undefined
      ? new Set(allIds)
      : new Set(input.manifest.includedObjectIds.map(String));
  const withdrawnIds = new Set(
    input.manifest?.withdrawnObjectIds.map(String) ?? [],
  );
  const activeIds = allIds.filter(
    (id) => manifestIds.has(id) && !withdrawnIds.has(id),
  );
  const activeSet = new Set(activeIds);
  const findings: ContentGraphFinding[] = [];
  const outgoing = new Map<string, Set<string>>(
    activeIds.map((id) => [id, new Set<string>()]),
  );
  const incoming = new Map<string, Set<string>>(
    activeIds.map((id) => [id, new Set<string>()]),
  );

  for (const id of allIds) {
    if (!activeSet.has(id)) {
      findings.push(
        finding(
          "information",
          "manifest_excluded",
          [id],
          ["scenarios", id],
          `Scenario ${id} is outside the active manifest graph.`,
        ),
      );
      continue;
    }
    const scenario = input.scenarios[id];
    if (scenario === undefined) continue;
    const contradictory = scenario.eligibility.filter((conditionId) =>
      scenario.exclusions.includes(conditionId),
    );
    if (contradictory.length > 0) {
      findings.push(
        finding(
          "error",
          "contradictory_conditions",
          [id],
          ["scenarios", id, "eligibility"],
          `Scenario ${id} both requires and excludes: ${uniqueSorted(contradictory).join(", ")}.`,
        ),
      );
    }
    if (scenario.eligibility.length > 0 || scenario.exclusions.length > 0) {
      findings.push(
        finding(
          "information",
          "conditional_reachability_indeterminate",
          [id],
          ["scenarios", id, "eligibility"],
          `Static graph analysis cannot prove runtime condition reachability for ${id}.`,
        ),
      );
    }
    for (const [field, references, direction] of [
      ["predecessors", scenario.predecessors, "incoming"],
      ["followUps", scenario.followUps, "outgoing"],
    ] as const) {
      references.forEach((referenceId, index) => {
        const reference = String(referenceId);
        if (reference === id) {
          findings.push(
            finding(
              "error",
              "self_reference",
              [id],
              ["scenarios", id, field, index],
              `Scenario ${id} references itself in ${field}.`,
            ),
          );
        }
        if (!activeSet.has(reference)) {
          findings.push(
            finding(
              "error",
              field === "predecessors"
                ? "missing_predecessor"
                : "missing_follow_up",
              [id, reference],
              ["scenarios", id, field, index],
              `Scenario ${id} references unavailable ${reference} in ${field}.`,
            ),
          );
          return;
        }
        const source = direction === "incoming" ? reference : id;
        const destination = direction === "incoming" ? id : reference;
        outgoing.get(source)?.add(destination);
        incoming.get(destination)?.add(source);
      });
    }
  }

  const entryIds = activeIds.filter((id) => {
    const scenario = input.scenarios[id];
    return (
      scenario !== undefined &&
      scenario.predecessors.length === 0 &&
      (incoming.get(id)?.size ?? 0) === 0
    );
  });
  const terminalIds = activeIds.filter(
    (id) => (outgoing.get(id)?.size ?? 0) === 0,
  );
  const reachable = new Set<string>();
  const queue = [...entryIds];
  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined || reachable.has(id)) continue;
    reachable.add(id);
    queue.push(...[...(outgoing.get(id) ?? [])].sort(compareAscii));
  }

  const cycles = findCycles(activeIds, outgoing);
  for (const cycle of cycles) {
    const scenarios = cycle.flatMap((id) => {
      const scenario = input.scenarios[id];
      return scenario === undefined ? [] : [scenario];
    });
    const mandatory = scenarios.some(
      (scenario) =>
        scenario.category === "mandatory" ||
        scenario.category === "direct_follow_up",
    );
    const benignRepeatable = scenarios.every(
      (scenario) =>
        scenario.repeatability.repeatable &&
        (scenario.category === "optional" ||
          scenario.category === "ambient_media"),
    );
    findings.push(
      finding(
        mandatory ? "error" : benignRepeatable ? "information" : "warning",
        mandatory ? "mandatory_cycle" : "cycle",
        cycle,
        ["scenarios"],
        `${mandatory ? "Mandatory" : "Scenario"} cycle detected: ${cycle.join(" -> ")}.`,
      ),
    );
  }

  for (const id of activeIds) {
    const scenario = input.scenarios[id];
    if (
      scenario !== undefined &&
      (scenario.category === "mandatory" ||
        scenario.category === "direct_follow_up") &&
      !reachable.has(id)
    ) {
      findings.push(
        finding(
          "error",
          "unreachable_mandatory",
          [id],
          ["scenarios", id],
          `Mandatory scenario ${id} is unreachable from every graph entry.`,
        ),
      );
    }
  }

  findings.sort(findingOrder);
  return Object.freeze({
    valid: !findings.some((entry) => entry.severity === "error"),
    activeScenarioIds: Object.freeze(activeIds),
    entryScenarioIds: Object.freeze(entryIds),
    terminalScenarioIds: Object.freeze(terminalIds),
    reachableScenarioIds: Object.freeze([...reachable].sort(compareAscii)),
    findings: Object.freeze(findings),
  });
}
