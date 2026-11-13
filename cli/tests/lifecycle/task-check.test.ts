/** `setTaskCheck` and `parseTasks`: the checkbox edit behind `tasks check`. */
import { describe, expect, test } from "bun:test";
import { parseTasks, setTaskCheck } from "../../src/domain/progress.ts";
import { AppError } from "../../src/app/errors.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";

const SPEC = `# Spec

| Status | Implementing |

### 13. Validações

- [ ] T900 not a task, outside section 14

### 14. Tarefas

- [ ] T001 First — Depends: none
  - [ ] **PREP**: prepare
  - [x] **EXECUTE**: run
  <!-- specsfy:evidence {"task":"T001"} -->
- [ ] T002 Second — Depends: T001
  - [ ] **PREP**: prepare

\`\`\`md
- [ ] T003 inside a fence
\`\`\`

### 15. Ordem de execução
`;

function code(fn: () => unknown): number | undefined {
  try { fn(); } catch (e) { return e instanceof AppError ? e.code : -1; }
  return undefined;
}

describe("task check", () => {
  test("parses only tasks of section 14, outside fences", () => {
    const tasks = parseTasks(SPEC);
    expect(tasks.map((task) => task.id)).toEqual(["T001", "T002"]);
    expect(tasks[0]!.items.map((item) => item.key)).toEqual(["PREP", "EXECUTE"]);
  });

  test("marks and unmarks the task line", () => {
    const marked = setTaskCheck(SPEC, "T001", undefined, true);
    expect(marked.changed).toBe(true);
    expect(marked.content).toContain("- [x] T001 First");
    expect(marked.task_entry.checked).toBe(true);
    const unmarked = setTaskCheck(marked.content, "t1", undefined, false);
    expect(unmarked.content).toBe(SPEC);
  });

  test("marks an item by key or position and reports unchanged edits", () => {
    const byKey = setTaskCheck(SPEC, "T001", "prep", true);
    expect(byKey.item).toBe("PREP");
    expect(byKey.content).toContain("  - [x] **PREP**: prepare\n  - [x] **EXECUTE**");
    expect(byKey.content).toContain("- [ ] T001 First");
    const byPosition = setTaskCheck(SPEC, "T001", "2", true);
    expect(byPosition.item).toBe("EXECUTE");
    expect(byPosition.changed).toBe(false);
  });

  test("missing task or item is NOT_FOUND; malformed ID is USAGE", () => {
    expect(code(() => setTaskCheck(SPEC, "T003", undefined, true))).toBe(ExitCode.NOT_FOUND);
    expect(code(() => setTaskCheck(SPEC, "T900", undefined, true))).toBe(ExitCode.NOT_FOUND);
    expect(code(() => setTaskCheck(SPEC, "T002", "EXECUTE", true))).toBe(ExitCode.NOT_FOUND);
    expect(code(() => setTaskCheck(SPEC, "T001", "9", true))).toBe(ExitCode.NOT_FOUND);
    expect(code(() => setTaskCheck(SPEC, "first", undefined, true))).toBe(ExitCode.USAGE);
  });
});
