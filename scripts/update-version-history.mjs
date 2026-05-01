import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const readmePath = resolve(root, "README.md");

const runGit = (args) => {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
};

const today = new Date().toISOString().slice(0, 10);
const readme = readFileSync(readmePath, "utf8");
const versionMatch = readme.match(/\| `(\d+)\.(\d+)\.(\d+)` \|/);
const latestRowMatch = readme.match(/\| `\d+\.\d+\.\d+` \|[^\n]+/);

if (latestRowMatch?.[0].includes("| pending |")) {
  process.exit(0);
}

const nextVersion = versionMatch
  ? `${versionMatch[1]}.${versionMatch[2]}.${Number(versionMatch[3]) + 1}`
  : "0.1.0";

const stagedFiles = runGit(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((file) => file !== "README.md");

if (stagedFiles.length === 0) {
  process.exit(0);
}

const summary = process.argv.slice(2).join(" ").trim() || stagedFiles.slice(0, 4).join(", ");
const row = `| \`${nextVersion}\` | ${today} | pending | ${summary} |`;

if (readme.includes(row)) {
  process.exit(0);
}

const marker = "| --- | --- | --- | --- |";
const markerIndex = readme.indexOf(marker);

if (markerIndex === -1) {
  throw new Error("README.md Version History table marker not found.");
}

const insertAt = markerIndex + marker.length;
const nextReadme = `${readme.slice(0, insertAt)}\n${row}${readme.slice(insertAt)}`;

writeFileSync(readmePath, nextReadme, "utf8");
runGit(["add", "README.md"]);
