import { AccessibilityInfo, Platform } from "react-native";

// A screen reader says nothing when the text of an animation changes, thus a
// user without sight cannot follow the session. Android reads an
// `accessibilityLiveRegion` on its own, but iOS has no live regions: there the
// change needs an announcement.
export const announceLiveRegionUpdate = (message: string) => {
  if (Platform.OS !== "ios") return;
  AccessibilityInfo.announceForAccessibility(message);
};

// An announcement for a text that no live region covers.
export const announceForScreenReader = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

// The custom pattern allows steps of half a second, thus a step duration is not
// always a whole number of seconds.
const formatStepDuration = (durationMs: number) => {
  const seconds = Math.round(Math.max(0, durationMs) / 100) / 10;
  const value = Number.isInteger(seconds) ? String(seconds) : seconds.toFixed(1);
  return `${value} ${value === "1" ? "second" : "seconds"}`;
};

// E.g.: "Inhale, 4 seconds".
export const getStepAccessibilityLabel = (label: string, durationMs: number) =>
  `${label}, ${formatStepDuration(durationMs)}`;

export const getInterludeAccessibilityLabel = (secondsLeft: number) =>
  `Starting session in ${secondsLeft} ${secondsLeft === 1 ? "second" : "seconds"}`;

export const sessionCompleteAnnouncement = "Session complete";

export const sessionPausedAnnouncement = "Session paused";
