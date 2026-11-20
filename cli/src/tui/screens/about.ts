/**
 * About tab: binary identity, version, paths, credits and the local checks
 * of `specsfy doctor`.
 * Uses the same data as the `about` command, so the two surfaces never tell
 * different stories.
 */
import { BoxRenderable, TextRenderable } from "@opentui/core";
import { aboutData } from "../../cli/commands/about.ts";
import { spacer, panel, dim, keyValueTable, segments, fit } from "../components.ts";
import { collectDoctorChecks } from "../../cli/commands/doctor.ts";
import { glyphs } from "../theme.ts";
import type { Screen } from "../screen.ts";

export const aboutScreen: Screen = {
  id: "about",
  title: "About",
  description: "Binary, version, license and credits",
  mount: ({ renderer, theme }) => {
    const d = aboutData();
    const rootBox = new BoxRenderable(renderer, { flexDirection: "column", flexGrow: 1 });

    const top = new BoxRenderable(renderer, { flexDirection: "row", flexShrink: 0 });

    const binary = panel(renderer, theme, { title: "Binary", flexGrow: 1, active: true });
    binary.add(new TextRenderable(renderer, { content: `${d.title}  v${d.version}`, fg: theme.accent }));
    binary.add(dim(renderer, theme, d.description));
    binary.add(spacer(renderer));
    binary.add(
      keyValueTable(renderer, theme, [
        ["Executable", d.executable],
        ["Runtime", d.runtime],
        ["Platform", d.platform],
        ["PID", String(d.pid)],
        ["Data", d.dataDir],
      ]),
    );
    top.add(binary);

    const project = panel(renderer, theme, { title: "Project", width: 58 });
    project.add(
      keyValueTable(renderer, theme, [
        ["Author", d.author || "-", theme.textStrong],
        ["License", d.license],
        ["Site", d.site || "-", theme.accentSecondary],
        ["Repository", d.repository || "-", theme.accentSecondary],
      ]),
    );
    top.add(project);
    rootBox.add(top);

    const bottom = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1 });

    const creditsPanel = panel(renderer, theme, { title: "Credits", flexGrow: 1 });
    const nameWidth = Math.max(...d.credits.map((c) => c.name.length));
    for (const c of d.credits) {
      creditsPanel.add(keyValueTable(renderer, theme, [[c.name.padEnd(nameWidth), c.role, theme.text]]));
      creditsPanel.add(dim(renderer, theme, `${" ".repeat(nameWidth + 2)}${c.url}`));
    }
    bottom.add(creditsPanel);

    // Same local checks as `specsfy doctor` (no network, no project checks).
    const doctor = panel(renderer, theme, { title: "Doctor", width: 58 });
    const { checks, ok } = collectDoctorChecks();
    const tone = { ok: [glyphs.ok, theme.ok], warn: [glyphs.warn, theme.warn], fail: [glyphs.error, theme.error] } as const;
    for (const check of checks) {
      const [glyph, color] = tone[check.status];
      doctor.add(segments(renderer, [[`${glyph} `, color], [check.name.padEnd(12), theme.text], [fit(check.detail, 38), theme.textDim]]));
    }
    doctor.add(spacer(renderer));
    doctor.add(dim(renderer, theme, ok ? "All local checks pass. Run specsfy doctor --project for the project." : "A check failed. Run specsfy doctor for details."));
    bottom.add(doctor);
    rootBox.add(bottom);

    return rootBox;
  },
};
