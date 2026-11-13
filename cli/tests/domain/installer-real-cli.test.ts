/** Confere a materialização oficial em fontes locais, sem consultar o GitHub. */
import { chmod, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { expect, test } from "bun:test";
import { SkillInstaller, skillDigest } from "../../src/domain/installer.ts";
import { temporaryDirectory } from "./helpers.ts";

test("#6: instalador oficial preserva conteúdo e registra os três especialistas citados", async () => {
  const root = await temporaryDirectory();
  const source = join(root, "source");
  const consumer = join(root, "consumer");
  const names = ["specsfy-specialist-nextjs", "specsfy-specialist-laravel", "specsfy-specialist-delivery-engineering"];
  for (const name of names) {
    await cp(resolve(import.meta.dirname, "../../../specialists", name), join(source, name), { recursive: true });
  }
  await mkdir(consumer);
  const command = join(root, "npx-local");
  const official = resolve(import.meta.dirname, "../../node_modules/skills/bin/cli.mjs");
  await writeFile(command, '#!/usr/bin/env node\n' +
    'const {spawnSync}=require("node:child_process");const a=process.argv.slice(2);if(a[0]==="skills")a.shift();' +
    'const r=spawnSync(process.execPath,[' + JSON.stringify(official) + ',...a],{stdio:"inherit"});process.exit(r.status??1);\n');
  await chmod(command, 0o755);
  const previous = process.env.SPECSFY_NPX_COMMAND;
  process.env.SPECSFY_NPX_COMMAND = command;
  try {
    const installer = await SkillInstaller.create(consumer);
    await installer.installFromCheckout(source, names, "specialists");
    const lock = JSON.parse(await readFile(join(consumer, ".specsfy/skills-lock.json"), "utf8"));
    for (const name of names) {
      const fingerprint = await skillDigest(join(consumer, ".agents/skills", name));
      expect(fingerprint).toBe(await skillDigest(join(source, name)));
      expect(lock.skills[name].content_sha256).toBe(fingerprint);
    }
    expect(await installer.installFromCheckout(source, names, "specialists")).toEqual([]);
  } finally {
    if (previous === undefined) delete process.env.SPECSFY_NPX_COMMAND;
    else process.env.SPECSFY_NPX_COMMAND = previous;
  }
}, 20_000);
