import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const THEMES = ["light", "dark"];
const CHECKPOINTS = ["home", "settings", "patterns"];
const PLATFORMS = ["android", "ios"];
const SAFE_RUN_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function parseArgs(argv) {
  const options = {
    runId: "local",
    maxDiffRatio: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--run-id") {
      options.runId = argv[++index];
    } else if (argument === "--max-diff-ratio") {
      options.maxDiffRatio = Number(argv[++index]);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!SAFE_RUN_ID.test(options.runId)) {
    throw new Error(
      "--run-id must start with a letter or number and contain only letters, numbers, dots, underscores, or hyphens"
    );
  }
  if (
    options.maxDiffRatio !== undefined &&
    (!Number.isFinite(options.maxDiffRatio) || options.maxDiffRatio < 0 || options.maxDiffRatio > 1)
  ) {
    throw new Error("--max-diff-ratio must be between 0 and 1");
  }

  return options;
}

function readPng(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing screenshot: ${filePath}`);
  }
  return PNG.sync.read(fs.readFileSync(filePath));
}

function relativeUrl(fromDirectory, target) {
  return path.relative(fromDirectory, target).split(path.sep).join("/");
}

function formatPercent(ratio) {
  return `${(ratio * 100).toFixed(2)}%`;
}

function leadingBlackRows(png) {
  let row = 0;
  for (; row < png.height; row += 1) {
    let isBlack = true;
    for (let column = 0; column < png.width; column += 1) {
      const offset = (row * png.width + column) * 4;
      if (png.data[offset] > 2 || png.data[offset + 1] > 2 || png.data[offset + 2] > 2) {
        isBlack = false;
        break;
      }
    }
    if (!isBlack) break;
  }
  return row;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildHtml(results, maxDiffRatio) {
  const rows = results
    .map((result) => {
      const status =
        maxDiffRatio === undefined || result.diffRatio <= maxDiffRatio ? "review" : "failed";
      return `
        <tr>
          <td><strong>${escapeHtml(result.platform)}</strong><br>${escapeHtml(
        result.theme
      )} / ${escapeHtml(result.checkpoint)}</td>
          <td><img src="${escapeHtml(result.master)}" alt="master"></td>
          <td><img src="${escapeHtml(result.candidate)}" alt="candidate"></td>
          <td><img src="${escapeHtml(result.diff)}" alt="pixel diff"></td>
          <td class="${status}">
            raw: ${formatPercent(result.diffRatio)}<br>
            content: ${formatPercent(result.contentDiffRatio)}<br>
            <small>${result.differingPixels.toLocaleString()} px raw${
        result.ignoredTopRows > 0 ? `; ignored top ${result.ignoredTopRows}px for content` : ""
      }</small>
          </td>
        </tr>`;
    })
    .join("");

  const gate =
    maxDiffRatio === undefined
      ? "Report-only: no failure threshold is active."
      : `Gate: fail above ${formatPercent(maxDiffRatio)} differing pixels.`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Breathly visual comparison</title>
    <style>
      :root { color-scheme: light dark; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { margin: 2rem; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #8886; padding: .6rem; text-align: left; vertical-align: top; }
      th { position: sticky; top: 0; background: Canvas; }
      img { display: block; height: auto; max-height: 520px; max-width: 100%; }
      .failed { color: #d33; font-weight: 700; }
      .review { font-variant-numeric: tabular-nums; }
      small { opacity: .7; }
    </style>
  </head>
  <body>
    <h1>Breathly visual comparison</h1>
    <p>${escapeHtml(
      gate
    )} Pixelmatch threshold: 0.1; anti-aliased pixels are ignored. Content metrics exclude any full-width, pure-black leading compatibility band found only on master; raw metrics and diff images retain it.</p>
    <table>
      <thead><tr><th>Target</th><th>Master</th><th>Candidate</th><th>Diff</th><th>Changed</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const runRoot = path.join("artifacts", "visual-e2e", "runs", options.runId);
  const diffRoot = path.join(runRoot, "diff");
  const results = [];

  for (const platform of PLATFORMS) {
    for (const theme of THEMES) {
      for (const checkpoint of CHECKPOINTS) {
        const filename = `${checkpoint}-${theme}.png`;
        const masterPath = path.join(runRoot, platform, "master", theme, "screenshots", filename);
        const candidatePath = path.join(
          runRoot,
          platform,
          "candidate",
          theme,
          "screenshots",
          filename
        );
        const master = readPng(masterPath);
        const candidate = readPng(candidatePath);

        if (master.width !== candidate.width || master.height !== candidate.height) {
          throw new Error(
            `Screenshot dimensions differ for ${platform}/${theme}/${checkpoint}: ` +
              `master ${master.width}x${master.height}, ` +
              `candidate ${candidate.width}x${candidate.height}`
          );
        }

        const diff = new PNG({ width: master.width, height: master.height });
        const differingPixels = pixelmatch(
          master.data,
          candidate.data,
          diff.data,
          master.width,
          master.height,
          {
            threshold: 0.1,
            includeAA: false,
            alpha: 0.35,
            diffColor: [255, 0, 90],
          }
        );
        const diffPath = path.join(diffRoot, platform, theme, filename);
        fs.mkdirSync(path.dirname(diffPath), { recursive: true });
        fs.writeFileSync(diffPath, PNG.sync.write(diff));

        const masterLeadingBlackRows = leadingBlackRows(master);
        const candidateLeadingBlackRows = leadingBlackRows(candidate);
        const ignoredTopRows =
          masterLeadingBlackRows > candidateLeadingBlackRows ? masterLeadingBlackRows : 0;
        const contentHeight = master.height - ignoredTopRows;
        const contentOffset = ignoredTopRows * master.width * 4;
        const contentDifferingPixels = pixelmatch(
          master.data.subarray(contentOffset),
          candidate.data.subarray(contentOffset),
          null,
          master.width,
          contentHeight,
          { threshold: 0.1, includeAA: false }
        );

        results.push({
          platform,
          theme,
          checkpoint,
          width: master.width,
          height: master.height,
          differingPixels,
          diffRatio: differingPixels / (master.width * master.height),
          ignoredTopRows,
          contentDifferingPixels,
          contentDiffRatio: contentDifferingPixels / (master.width * contentHeight),
          master: relativeUrl(runRoot, masterPath),
          candidate: relativeUrl(runRoot, candidatePath),
          diff: relativeUrl(runRoot, diffPath),
        });
      }
    }
  }

  fs.writeFileSync(
    path.join(runRoot, "visual-report.json"),
    `${JSON.stringify({ runId: options.runId, results }, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(runRoot, "visual-report.html"),
    buildHtml(results, options.maxDiffRatio)
  );

  for (const result of results) {
    console.log(
      `${result.platform.padEnd(7)} ${result.theme.padEnd(5)} ${result.checkpoint.padEnd(
        8
      )} raw ${formatPercent(result.diffRatio).padStart(7)}  content ${formatPercent(
        result.contentDiffRatio
      ).padStart(7)}`
    );
  }
  console.log(`\nReport: ${path.join(runRoot, "visual-report.html")}`);

  if (
    options.maxDiffRatio !== undefined &&
    results.some((result) => result.diffRatio > options.maxDiffRatio)
  ) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
