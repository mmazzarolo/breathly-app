# Breathly end-to-end tests

These Maestro flows exercise the installed release app through the native accessibility tree. The
same top-level flows run on Android and iOS; small subflows isolate the navigation and picker
differences between platforms.

## Prerequisites

- Maestro CLI available as `maestro`.
- One booted Android emulator or iOS Simulator.
- A release build installed with the application identifier `com.mmazzarolo.breathly`.

Install Maestro using its official instructions. On Homebrew installations that require explicit
third-party formula trust:

```sh
brew tap mobile-dev-inc/tap
brew trust --formula mobile-dev-inc/tap/maestro
brew install --formula mobile-dev-inc/tap/maestro
```

## Build and run

```sh
npm run e2e:build:android
npm run e2e:android
```

```sh
npm run e2e:build:ios
npm run e2e:ios
```

Use `npm run e2e` when exactly one compatible simulator or emulator is available. To run one flow
while developing it, pass the path directly to Maestro, for example:

```sh
maestro test .maestro/flows/settings-persistence.yaml
```

Each top-level flow resets application data so it can run independently. The settings flow also
kills and relaunches the app without clearing data to verify AsyncStorage persistence.

## Cross-version visual comparison

Install the `master` or candidate release build, then capture its light and dark screenshots:

```sh
npm run visual:capture -- android master <emulator-id> local
npm run visual:capture -- ios candidate <simulator-udid> local
```

After capturing both revisions for both platforms under the same run ID, generate the PNG, JSON,
and HTML comparison:

```sh
npm run visual:compare -- --run-id local
```

Visual outputs live under the ignored `artifacts/visual-e2e` directory. Text artifacts are scrubbed
of workspace paths, home-directory paths, and device identifiers after every capture, including
failed runs.

These flows validate UI-visible state and navigation. Simulator runs cannot prove that audible
guidance, the iOS silent switch, or physical haptics behave correctly; keep those checks in the
real-device release matrix.
