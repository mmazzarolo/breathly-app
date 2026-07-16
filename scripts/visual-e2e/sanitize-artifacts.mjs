import fs from "node:fs";
import path from "node:path";

const TEXT_EXTENSIONS = new Set([".html", ".json", ".log", ".txt", ".xml", ".yaml", ".yml"]);

function parseArgs(argv) {
  const redactions = [];
  const roots = [];

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--redact") {
      const value = argv[++index];
      if (!value) throw new Error("--redact requires a non-empty value");
      redactions.push(value);
    } else {
      roots.push(argv[index]);
    }
  }

  if (roots.length === 0) {
    throw new Error("At least one artifact file or directory is required");
  }

  return { redactions, roots };
}

function collectTextFiles(target, files) {
  if (!fs.existsSync(target)) return;

  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target)) {
      collectTextFiles(path.join(target, entry), files);
    }
  } else if (stat.isFile() && TEXT_EXTENSIONS.has(path.extname(target).toLowerCase())) {
    files.push(target);
  }
}

function redactFile(filePath, replacements) {
  const original = fs.readFileSync(filePath, "utf8");
  let redacted = original;

  for (const [value, replacement] of replacements) {
    redacted = redacted.replaceAll(value, replacement);
  }

  if (redacted !== original) {
    fs.writeFileSync(filePath, redacted);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const replacements = [];
  const workspace = process.cwd();
  const home = process.env.HOME;

  if (workspace) replacements.push([workspace, "<workspace>"]);
  if (home && home !== workspace) replacements.push([home, "<home>"]);
  for (const value of options.redactions) {
    replacements.push([value, "<redacted-device-id>"]);
  }

  const files = [];
  for (const root of options.roots) {
    collectTextFiles(root, files);
  }
  for (const filePath of files) {
    redactFile(filePath, replacements);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
