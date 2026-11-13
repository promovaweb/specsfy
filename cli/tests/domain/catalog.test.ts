/** Regressions of the specialist catalog. */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { Catalog } from "../../src/domain/catalog.ts";
import { temporaryDirectory } from "./helpers.ts";

const catalog = Catalog.fromPayload({
  schema_version: 1,
  skills: [
    {
      name: "specsfy-specialist-ui-design",
      description: "UI",
      category: "design",
      detect: { files: [".storybook"], dependencies: [] },
    },
    {
      name: "specsfy-specialist-react",
      description: "React",
      category: "frontend",
      requires: ["specsfy-specialist-ui-design"],
      detect: { dependencies: ["react"] },
    },
  ],
});

describe("catálogo", () => {
  test("resolve requisitos antes do especialista solicitado", () => {
    expect(
      catalog.resolve(["specsfy-specialist-react"]).map((entry) => entry.name),
    ).toEqual([
      "specsfy-specialist-ui-design",
      "specsfy-specialist-react",
    ]);
  });

  test("detecta arquivos e dependências declaradas", async () => {
    const project = await temporaryDirectory();
    await mkdir(join(project, ".storybook"));
    await writeFile(
      join(project, "package.json"),
      JSON.stringify({ dependencies: { react: "^19" } }),
    );
    expect((await catalog.detect(project)).map((entry) => entry.name)).toEqual([
      "specsfy-specialist-react",
      "specsfy-specialist-ui-design",
    ]);
  });

  test("#25: descobre marcadores e dependências de subprojetos do Hub", async () => {
    const project = await temporaryDirectory();
    await mkdir(join(project, "manager/.storybook"), { recursive: true });
    await writeFile(join(project, "manager/package.json"), JSON.stringify({ dependencies: { react: "^19" } }));
    await mkdir(join(project, "node_modules/descartado"), { recursive: true });
    await writeFile(join(project, "node_modules/descartado/package.json"), "{}");
    expect((await catalog.detect(project)).map((entry) => entry.name)).toEqual([
      "specsfy-specialist-react", "specsfy-specialist-ui-design",
    ]);
  });

  test("recusa namespace externo e ciclo", () => {
    expect(() => catalog.require("external")).toThrow("prefix");
    const cyclic = Catalog.fromPayload({
      schema_version: 1,
      skills: [
        {
          name: "specsfy-specialist-a",
          description: "A",
          category: "test",
          requires: ["specsfy-specialist-b"],
        },
        {
          name: "specsfy-specialist-b",
          description: "B",
          category: "test",
          requires: ["specsfy-specialist-a"],
        },
      ],
    });
    expect(() => cyclic.resolve(["specsfy-specialist-a"])).toThrow("circular");
  });
});

describe("catalog source", () => {
  test("derives the contents API URL only for GitHub repositories", async () => {
    const { catalogApiUrl, DEFAULT_CATALOG_URL } = await import("../../src/domain/catalog.ts");
    expect(catalogApiUrl("https://github.com/acme/fork.git")).toBe(
      "https://api.github.com/repos/acme/fork/contents/specialists/catalog.json?ref=main",
    );
    expect(catalogApiUrl("https://gitlab.com/acme/fork")).toBeUndefined();
    expect(DEFAULT_CATALOG_URL).toContain("repos/promovaweb/specsfy/");
  });

  test("reads SPECSFY_SPECIALISTS_CATALOG without network", async () => {
    const root = await temporaryDirectory();
    const path = join(root, "catalog.json");
    await writeFile(path, JSON.stringify({ schema_version: 1, skills: [{ name: "specsfy-specialist-x", description: "X", category: "t" }] }));
    const previous = process.env.SPECSFY_SPECIALISTS_CATALOG;
    process.env.SPECSFY_SPECIALISTS_CATALOG = path;
    try {
      expect((await Catalog.fetch("https://example.invalid/repo")).entries.map((e) => e.name)).toEqual(["specsfy-specialist-x"]);
    } finally {
      if (previous === undefined) delete process.env.SPECSFY_SPECIALISTS_CATALOG;
      else process.env.SPECSFY_SPECIALISTS_CATALOG = previous;
    }
  });
});
