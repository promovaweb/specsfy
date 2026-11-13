/** Contratos de segurança, idempotência e migração do instalador. */
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  BASE_SKILLS,
  RENAMED_BASE_SKILLS,
  SkillInstaller,
} from "../../src/domain/installer.ts";
import { pathExists } from "../../src/domain/filesystem.ts";
import { temporaryDirectory } from "./helpers.ts";

async function writeFramework(source: string): Promise<void> {
  await mkdir(join(source, "templates"), { recursive: true });
  await mkdir(join(source, "examples"), { recursive: true });
  const templates: Record<string, string> = {
    "Inbox.md": "# Inbox: {{INBOX_NAME}}\n",
    "Backlog.md": "# Backlog: {{BACKLOG_NAME}}\n",
    "Spec.md": "# {{SPEC_NAME}}\n",
    "Tasks.md": "## 14. Tarefas\n",
    "Project.md": "# Projeto {{STACK_LABEL}}\n{{STACK_GUIDANCE}}\n",
    "Stack.md": "# Stack\n{{STACK_ROWS}}\n",
    "Rules.md": "# Regras {{STACK_LABEL}}\n{{STACK_GUIDANCE}}\n",
    "Database.md": "# Banco {{STACK_LABEL}}\n{{STACK_GUIDANCE}}\n",
    "UserProfile.md": "# Perfil de interação\n",
    "Interface.md": "# Interface {{STACK_LABEL}}\n{{STACK_GUIDANCE}}\n",
    "DESIGNSYSTEM.MD": "# Design system\n",
  };
  await Promise.all(
    Object.entries(templates).map(([name, content]) =>
      writeFile(join(source, "templates", name), content),
    ),
  );
  await writeFile(join(source, "examples/Spec.md"), "# Exemplo completo\n");
  await writeFile(join(source, "Spec.md"), "# Regras Specsfy\n");
  await writeFile(
    join(source, "AGENTS.md"),
    "# Interno\n<!-- specsfy:framework:start -->\n" +
      "Leia `{{SPECSFY_SPEC_PATH}}`.\n<!-- specsfy:framework:end -->\n",
  );
}

describe("instalador", () => {
  let previousCommand: string | undefined;
  let previousLog: string | undefined;
  let log: string;

  beforeEach(async () => {
    previousCommand = process.env.SPECSFY_NPX_COMMAND;
    previousLog = process.env.SPECSFY_SKILLS_LOG;
    const commandRoot = await temporaryDirectory();
    log = join(commandRoot, "skills.jsonl");
    const command = join(commandRoot, "skills");
    await writeFile(
      command,
      "#!/usr/bin/env node\n" +
        "const fs=require('node:fs');const p=require('node:path');\n" +
        "const a=process.argv.slice(2);if(a[0]==='skills')a.shift();fs.appendFileSync(process.env.SPECSFY_SKILLS_LOG,JSON.stringify(a)+'\\n');\n" +
        "const lp=p.join(process.cwd(),'skills-lock.json');const l=fs.existsSync(lp)?JSON.parse(fs.readFileSync(lp,'utf8')):{version:1,skills:{}};\n" +
        "if(a[0]==='remove'){for(const n of a.slice(1,a.indexOf('--agent'))){delete l.skills[n];}fs.writeFileSync(lp,JSON.stringify(l));process.exit(0);}\n" +
        "if(a[0]!=='add')process.exit(0);const s=a[1];const d=p.join(process.cwd(),'.agents','skills');fs.mkdirSync(d,{recursive:true});\n" +
        "for(let i=0;i<a.length;i++){if(a[i]!=='--skill')continue;const n=a[i+1];fs.cpSync(p.join(s,n),p.join(d,n),{recursive:true,force:true});l.skills[n]={source:s,sourceType:'local',computedHash:'test'};}\n" +
        "fs.writeFileSync(lp,JSON.stringify(l));\n",
    );
    await chmod(command, 0o755);
    process.env.SPECSFY_NPX_COMMAND = command;
    process.env.SPECSFY_SKILLS_LOG = log;
  });

  afterEach(() => {
    if (previousCommand === undefined) delete process.env.SPECSFY_NPX_COMMAND;
    else process.env.SPECSFY_NPX_COMMAND = previousCommand;
    if (previousLog === undefined) delete process.env.SPECSFY_SKILLS_LOG;
    else process.env.SPECSFY_SKILLS_LOG = previousLog;
  });

  test("falha na materialização restaura regras, skills e locks do consumidor", async () => {
    const root = await temporaryDirectory();
    const source = join(root, "source");
    const project = join(root, "consumer");
    await mkdir(project);
    await writeFramework(source);
    await mkdir(join(source, "specsfy-02-backlog"));
    await writeFile(join(source, "specsfy-02-backlog/SKILL.md"), "skill");
    await writeFile(join(project, "AGENTS.md"), "# Regras próprias\n");
    await mkdir(join(project, ".specsfy/templates/custom"), { recursive: true });
    await writeFile(join(project, ".specsfy/templates/custom/Spec.md"), "customizado");
    const installer = await SkillInstaller.create(project);
    const lock = await readFile(join(project, "skills-lock.json"), "utf8");
    const command = process.env.SPECSFY_NPX_COMMAND!;
    await writeFile(command, await readFile(command, "utf8") + "\nprocess.exit(17);\n");

    await expect(installer.installBaseFromCheckout(source, ["specsfy-02-backlog"]))
      .rejects.toThrow("skills CLI falhou");
    expect(await readFile(join(project, "AGENTS.md"), "utf8")).toBe("# Regras próprias\n");
    expect(await readFile(join(project, ".specsfy/templates/custom/Spec.md"), "utf8")).toBe("customizado");
    expect(await readFile(join(project, "skills-lock.json"), "utf8")).toBe(lock);
    expect(await pathExists(join(project, ".specsfy/Spec.md"))).toBe(false);
    expect(await pathExists(join(project, ".agents/skills/specsfy-02-backlog"))).toBe(false);
  });

  test("mantém o mapa completo de nomes legados", () => {
    expect(RENAMED_BASE_SKILLS["specsfy-base-discuss"]).toBe(
      "specsfy-02-backlog",
    );
    expect(Object.keys(RENAMED_BASE_SKILLS)).toHaveLength(11);
    expect(BASE_SKILLS).toContain("specsfy-update-spec");
  });

  test("instala skill, registra fingerprint e repete como no-op", async () => {
    const root = await temporaryDirectory();
    const source = join(root, "source");
    const project = join(root, "consumer");
    await mkdir(join(source, "specsfy-specialist-react"), { recursive: true });
    await writeFile(
      join(source, "specsfy-specialist-react/SKILL.md"),
      "---\nname: specsfy-specialist-react\n---\n",
    );
    const installer = await SkillInstaller.create(project);

    const first = await installer.installFromCheckout(
      source,
      ["specsfy-specialist-react"],
      "specialists",
    );
    const second = await installer.installFromCheckout(
      source,
      ["specsfy-specialist-react"],
      "specialists",
    );

    expect(first).toEqual([
      join(project, ".agents/skills/specsfy-specialist-react"),
    ]);
    expect(second).toEqual([]);
    const lock = JSON.parse(
      await readFile(join(project, ".specsfy/skills-lock.json"), "utf8"),
    ) as { skills: Record<string, Record<string, unknown>> };
    expect(
      lock.skills["specsfy-specialist-react"]?.content_sha256,
    ).toMatch(/^[0-9a-f]{64}$/);
    expect(await readFile(log, "utf8")).toContain('"--full-depth"');
  });

  test("protege alteração local e permite substituição com force", async () => {
    const root = await temporaryDirectory();
    const source = join(root, "source");
    const project = join(root, "consumer");
    const skill = join(source, "specsfy-02-backlog");
    await mkdir(skill, { recursive: true });
    await writeFile(join(skill, "SKILL.md"), "origem");
    await (await SkillInstaller.create(project)).installFromCheckout(
      source,
      ["specsfy-02-backlog"],
      "base",
    );
    const target = join(project, ".agents/skills/specsfy-02-backlog/SKILL.md");
    await writeFile(target, "customização");

    await expect(
      (await SkillInstaller.create(project)).installFromCheckout(
        source,
        ["specsfy-02-backlog"],
        "base",
      ),
    ).rejects.toThrow("alterações locais");
    await (await SkillInstaller.create(project, true)).installFromCheckout(
      source,
      ["specsfy-02-backlog"],
      "base",
    );
    expect(await readFile(target, "utf8")).toBe("origem");
  });

  test("bootstrap preserva instruções e templates customizados", async () => {
    const root = await temporaryDirectory();
    const source = join(root, "source");
    const project = join(root, "consumer");
    await mkdir(project);
    await writeFramework(source);
    await mkdir(join(source, "specsfy-02-backlog"));
    await writeFile(join(source, "specsfy-02-backlog/SKILL.md"), "skill");
    await writeFile(join(project, "AGENTS.md"), "# Regras do usuário\n\nPreservar.\n");
    const installer = await SkillInstaller.create(project);

    const first = await installer.installBaseFromCheckout(source, [
      "specsfy-02-backlog",
    ]);
    const custom = join(project, ".specsfy/templates/custom/Spec.md");
    await writeFile(custom, "# Customizado\n");
    const second = await installer.installBaseFromCheckout(source, [
      "specsfy-02-backlog",
    ]);

    expect(first.length).toBeGreaterThan(10);
    expect(second).toEqual([]);
    expect(await readFile(join(project, "AGENTS.md"), "utf8")).toContain(
      "Preservar.",
    );
    expect(await readFile(join(project, "AGENTS.md"), "utf8")).toContain(
      "`.specsfy/Spec.md`",
    );
    expect(await readFile(custom, "utf8")).toBe("# Customizado\n");
    expect(
      await pathExists(join(project, ".specsfy/templates/Database.md")),
    ).toBe(true);
    expect(
      await pathExists(join(project, ".specsfy/templates/Interface.md")),
    ).toBe(true);
    expect(
      await pathExists(join(project, ".specsfy/templates/DESIGNSYSTEM.MD")),
    ).toBe(true);
    expect(
      await pathExists(join(project, ".specsfy/templates/UserProfile.md")),
    ).toBe(true);
  });

  test("remove somente skill Specsfy intacta e reconcilia lock oficial", async () => {
    const root = await temporaryDirectory();
    const source = join(root, "source");
    const project = join(root, "consumer");
    const skill = join(source, "specsfy-specialist-react");
    await mkdir(skill, { recursive: true });
    await writeFile(join(skill, "SKILL.md"), "react");
    const installer = await SkillInstaller.create(project);
    await installer.installFromCheckout(
      source,
      ["specsfy-specialist-react"],
      "specialists",
    );

    expect(await installer.remove(["specsfy-specialist-react"])).toEqual([
      join(project, ".agents/skills/specsfy-specialist-react"),
    ]);
    expect(
      await pathExists(join(project, ".agents/skills/specsfy-specialist-react")),
    ).toBe(false);
    await expect(installer.remove(["external-skill"])).rejects.toThrow(
      "nome de skill Specsfy inválido",
    );
  });

  test("atualiza skill gerenciada intacta sem exigir force", async () => {
    const root = await temporaryDirectory();
    const source = join(root, "source");
    const project = join(root, "consumer");
    const skill = join(source, "specsfy-02-backlog");
    await mkdir(skill, { recursive: true });
    await writeFile(join(skill, "SKILL.md"), "versão um");
    const installer = await SkillInstaller.create(project);
    await installer.installFromCheckout(source, ["specsfy-02-backlog"], "base");
    await writeFile(join(skill, "SKILL.md"), "versão dois");

    expect(
      await installer.installFromCheckout(source, ["specsfy-02-backlog"], "base"),
    ).toEqual([join(project, ".agents/skills/specsfy-02-backlog")]);
    expect(
      await readFile(
        join(project, ".agents/skills/specsfy-02-backlog/SKILL.md"),
        "utf8",
      ),
    ).toBe("versão dois");
  });

  test("protege Spec.md, template e bloco gerenciado alterados", async () => {
    const root = await temporaryDirectory();
    const source = join(root, "source");
    const project = join(root, "consumer");
    await writeFramework(source);
    await mkdir(join(source, "specsfy-02-backlog"));
    await writeFile(join(source, "specsfy-02-backlog/SKILL.md"), "skill");
    const installer = await SkillInstaller.create(project);
    await installer.installBaseFromCheckout(source, ["specsfy-02-backlog"]);

    await writeFile(join(project, ".specsfy/Spec.md"), "# Personalizada\n");
    await expect(
      installer.installBaseFromCheckout(source, ["specsfy-02-backlog"]),
    ).rejects.toThrow("Spec.md");
    await writeFile(join(project, ".specsfy/Spec.md"), "# Regras Specsfy\n");
    await writeFile(
      join(project, ".specsfy/templates/Spec.md"),
      "# Template do usuário\n",
    );
    await expect(
      installer.installBaseFromCheckout(source, ["specsfy-02-backlog"]),
    ).rejects.toThrow("templates/Spec.md");
  });

  test("migra nome legado intacto para a skill atual", async () => {
    const root = await temporaryDirectory();
    const source = join(root, "source");
    const project = join(root, "consumer");
    await writeFramework(source);
    await mkdir(join(source, "specsfy-base-discuss"));
    await writeFile(join(source, "specsfy-base-discuss/SKILL.md"), "antiga");
    const installer = await SkillInstaller.create(project);
    await installer.installFromCheckout(
      source,
      ["specsfy-base-discuss"],
      "base",
    );
    await mkdir(join(source, "specsfy-02-backlog"));
    await writeFile(join(source, "specsfy-02-backlog/SKILL.md"), "nova");

    await installer.installBaseFromCheckout(source, ["specsfy-02-backlog"]);

    expect(
      await pathExists(join(project, ".agents/skills/specsfy-base-discuss")),
    ).toBe(false);
    expect(
      await pathExists(join(project, ".agents/skills/specsfy-02-backlog")),
    ).toBe(true);
  });
});
