#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Usage: npm run visual:capture -- <android|ios> <master|candidate> <device-id> [run-id]"
}

if [[ $# -lt 3 || $# -gt 4 ]]; then
  usage >&2
  exit 2
fi

platform="$1"
revision="$2"
device_id="$3"
run_id="${4:-local}"
app_id="${VISUAL_APP_ID:-com.mmazzarolo.breathly}"

if [[ "$platform" != "android" && "$platform" != "ios" ]]; then
  usage >&2
  exit 2
fi

if [[ "$revision" != "master" && "$revision" != "candidate" ]]; then
  usage >&2
  exit 2
fi

for theme in light dark; do
  if [[ "$platform" == "android" ]]; then
    if [[ "$theme" == "light" ]]; then
      adb -s "$device_id" shell cmd uimode night no >/dev/null
    else
      adb -s "$device_id" shell cmd uimode night yes >/dev/null
    fi
    adb -s "$device_id" shell am force-stop "$app_id"
  else
    xcrun simctl ui "$device_id" appearance "$theme"
    xcrun simctl status_bar "$device_id" override \
      --time 9:41 \
      --batteryState charged \
      --batteryLevel 100 \
      --wifiBars 3 \
      --cellularBars 4
    # A cold launch prevents stale light-mode layers after changing simulator appearance.
    xcrun simctl terminate "$device_id" "$app_id" >/dev/null 2>&1 || true
  fi

  output_dir="artifacts/visual-e2e/runs/${run_id}/${platform}/${revision}/${theme}"
  mkdir -p "$output_dir"

  if maestro test \
      --udid "$device_id" \
      --env "VISUAL_VARIANT=${theme}" \
      --test-output-dir "$output_dir" \
      --format HTML-DETAILED \
      --output "${output_dir}-report.html" \
      .maestro/visual/static-parity.yaml; then
    test_status=0
  else
    test_status=$?
  fi

  node scripts/visual-e2e/sanitize-artifacts.mjs \
    --redact "$device_id" \
    "$output_dir" \
    "${output_dir}-report.html"

  if [[ $test_status -ne 0 ]]; then
    exit "$test_status"
  fi
done
