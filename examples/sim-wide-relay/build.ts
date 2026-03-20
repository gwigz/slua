import ts from "typescript";
import * as tstl from "typescript-to-lua";
import { resolve } from "node:path";

const SCRIPTS = ["coordinator", "listener", "sender"];

const BASE_OPTIONS: tstl.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  moduleDetection: ts.ModuleDetectionKind.Force,
  skipLibCheck: true,
  lib: ["lib.esnext.d.ts"],
  types: ["@typescript-to-lua/language-extensions"],
  rootDir: resolve("src"),
  outDir: resolve("dist"),
  luaTarget: tstl.LuaTarget.Luau,
  luaLibImport: tstl.LuaLibImportKind.Inline,
  noImplicitSelf: true,
  noImplicitGlobalVariables: true,
  luaPlugins: [{ name: resolve("../../packages/tstl-plugin/dist/index.js") }],
};

let hasErrors = false;

for (const script of SCRIPTS) {
  const result = tstl.transpileFiles(
    [resolve(`src/${script}.ts`), resolve("../../packages/types/index.d.ts")],
    {
      ...BASE_OPTIONS,
      luaBundle: `${script}.lua`,
      luaBundleEntry: resolve(`src/${script}.ts`),
    },
  );

  for (const diagnostic of result.diagnostics) {
    const msg = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

    // TSTL warns about luaBundle + inline but it's harmless
    if (msg.includes("luaBundle")) {
      continue;
    }

    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      console.error(`${script}: error: ${msg}`);
      hasErrors = true;
    } else if (diagnostic.category === ts.DiagnosticCategory.Warning) {
      console.warn(`${script}: warning: ${msg}`);
    }
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Built ${SCRIPTS.map((s) => `dist/${s}.lua`).join(", ")}`);
