import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const hooksDir = resolve(root, ".git", "hooks");
const sourceDir = resolve(root, "scripts", "git-hooks");

const hooks = ["pre-commit", "post-commit"];

if (!existsSync(hooksDir)) {
  throw new Error(".git/hooks directory not found. Run this inside a git repository.");
}

for (const hook of hooks) {
  const source = resolve(sourceDir, hook);
  const target = resolve(hooksDir, hook);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  console.log(`installed ${hook}`);
}
