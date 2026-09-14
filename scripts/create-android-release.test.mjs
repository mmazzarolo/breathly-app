import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidRelease, formatGitHubOutputs } from "./create-android-release.mjs";

const appConfig = { expo: { version: "2.2.0" } };
const build = {
  appBuildVersion: "3145751",
  artifacts: {
    applicationArchiveUrl: "https://example.test/Breathly.apk?signature=abc",
  },
};

test("uses the version code returned by EAS for the release tag", () => {
  const release = createAndroidRelease([build], appConfig);

  assert.deepEqual(release, {
    apkUrl: "https://example.test/Breathly.apk?signature=abc",
    releaseName: "Android 2.2.0 (3145751)",
    releaseTag: "android-2.2.0-(3145751)",
  });
  assert.equal(
    formatGitHubOutputs(release),
    "apk_url=https://example.test/Breathly.apk?signature=abc\n" +
      "release_name=Android 2.2.0 (3145751)\n" +
      "release_tag=android-2.2.0-(3145751)\n",
  );
});

test("rejects an incomplete EAS build response", () => {
  assert.throws(() => createAndroidRelease([], appConfig), /exactly one Android build/);
  assert.throws(
    () => createAndroidRelease([{ artifacts: build.artifacts }], appConfig),
    /Android version code/,
  );
  assert.throws(() => createAndroidRelease([{ ...build, artifacts: {} }], appConfig), /APK URL/);
});

test("rejects release values that cannot be safely published", () => {
  assert.throws(
    () => createAndroidRelease([{ ...build, appBuildVersion: "0" }], appConfig),
    /invalid Android version code/,
  );
  assert.throws(
    () =>
      createAndroidRelease(
        [
          {
            ...build,
            artifacts: { applicationArchiveUrl: "http://example.test/app.apk" },
          },
        ],
        appConfig,
      ),
    /without HTTPS/,
  );
  assert.throws(
    () =>
      createAndroidRelease(
        [
          {
            ...build,
            artifacts: {
              applicationArchiveUrl: "https://example.test/app.apk\nrelease_tag=bad",
            },
          },
        ],
        appConfig,
      ),
    /invalid APK URL/,
  );
  assert.throws(
    () => createAndroidRelease([build], { expo: { version: "2.2.0\ninvalid" } }),
    /cannot be used/,
  );
});
