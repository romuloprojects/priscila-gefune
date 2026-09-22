import ts from "typescript";
import { mkdtemp, rm, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";

const temp = await mkdtemp(join(process.cwd(), ".test-build-"));
try {
  for (const file of [
    "tests/proxy.test.ts",
    "src/server.ts",
    "src/services/atelierApi.ts",
    "src/lib/error-capture.ts",
    "src/lib/error-page.ts",
  ]) {
    const source = await readFile(file, "utf8");
    const output = ts
      .transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      })
      .outputText.replace(
        /(from\s*|import\s*)(["'])(\.\.?\/[^"']+)\2/g,
        (_, prefix, quote, path) => `${prefix}${quote}${path}.mjs${quote}`,
      );
    const target = join(temp, file.replace(/\.ts$/, ".mjs"));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, output);
  }
  const outfile = join(temp, "tests/proxy.test.mjs");
  const result = spawnSync(process.execPath, ["--test", outfile], { stdio: "inherit" });
  process.exitCode = result.status ?? 1;
} finally {
  await rm(temp, { recursive: true, force: true });
}
