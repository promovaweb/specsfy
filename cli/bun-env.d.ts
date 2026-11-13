/**
 * Module declarations for the text imports used by Bun.
 * Markdown files enter the binary with `with { type: "text" }` and reach the
 * code as strings. TypeScript needs this declaration to accept the import.
 */
declare module "*.md" {
  const content: string;
  export default content;
}

// Framework files embedded as text by src/engine/skills.gen.ts.
declare module "*.mjs" {
  const content: string;
  export default content;
}
declare module "*.MD" {
  const content: string;
  export default content;
}
declare module "*.yaml" {
  const content: string;
  export default content;
}
