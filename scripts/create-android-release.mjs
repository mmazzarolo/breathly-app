import fs from "node:fs";
import { pathToFileURL } from "node:url";

function requireString(value, name) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`EAS build response has no ${name}`);
  }

  return value;
}

export function createAndroidRelease(builds, appConfig) {
  if (!Array.isArray(builds) || builds.length !== 1) {
    throw new Error("EAS must return exactly one Android build");
  }

  const build = builds[0];
  const appVersion = requireString(appConfig?.expo?.version, "Expo version");
  const appBuildVersion = requireString(build?.appBuildVersion, "Android version code");
  const archiveUrl = requireString(build?.artifacts?.applicationArchiveUrl, "APK URL");

  if (!/^[0-9A-Za-z][0-9A-Za-z.+-]*$/.test(appVersion)) {
    throw new Error("Expo version cannot be used in an Android release tag");
  }

  if (!/^[1-9][0-9]*$/.test(appBuildVersion)) {
    throw new Error("EAS returned an invalid Android version code");
  }

  if (archiveUrl.includes("\n") || archiveUrl.includes("\r")) {
    throw new Error("EAS returned an invalid APK URL");
  }

  const parsedApkUrl = new URL(archiveUrl);
  if (parsedApkUrl.protocol !== "https:") {
    throw new Error("EAS returned an APK URL without HTTPS");
  }

  return {
    apkUrl: archiveUrl,
    releaseName: `Android ${appVersion} (${appBuildVersion})`,
    releaseTag: `android-${appVersion}-(${appBuildVersion})`,
  };
}

export function formatGitHubOutputs(release) {
  return [
    `apk_url=${release.apkUrl}`,
    `release_name=${release.releaseName}`,
    `release_tag=${release.releaseTag}`,
    "",
  ].join("\n");
}

function main() {
  const [buildPath, appConfigPath] = process.argv.slice(2);
  if (!buildPath || !appConfigPath) {
    throw new Error("Usage: create-android-release.mjs <eas-build.json> <app.json>");
  }

  const builds = JSON.parse(fs.readFileSync(buildPath, "utf8"));
  const appConfig = JSON.parse(fs.readFileSync(appConfigPath, "utf8"));
  process.stdout.write(formatGitHubOutputs(createAndroidRelease(builds, appConfig)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
