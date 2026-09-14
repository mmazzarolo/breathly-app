import ms from "ms";
import { PatternPreset } from "@breathly/types/pattern-preset";

// Sorted by display name. The `id` of a preset is persisted in the settings store and
// validated by `normalizePersistedSettingsState`, so ids must never change: an id that
// no longer matches silently resets that user to the Square pattern.
//
// Typed as a non-empty tuple, so the first entry can serve as a total fallback without an
// assertion.
export const patternPresets: [PatternPreset, ...PatternPreset[]] = [
  {
    id: "ratio-1-4-2",
    name: "1-4-2 Ratio",
    steps: [ms("5s"), ms("20s"), ms("10s"), 0],
    description: "An advanced breathing ratio with a long hold after the inhale.",
  },
  {
    id: "deep-calm",
    name: "4-7-8 Deep Calm",
    steps: [ms("4s"), ms("7s"), ms("8s"), 0],
    description: "A natural tranquilizer for the nervous system. Do it at least twice a day.",
  },
  {
    id: "advanced-5-7-9",
    name: "Advanced 5-7-9",
    steps: [ms("5s"), ms("7s"), ms("9s"), 0],
    description: "A longer cycle with a hold after the inhale and an extended exhale.",
  },
  {
    id: "awake",
    name: "Awake",
    steps: [ms("6s"), 0, ms("2s"), 0],
    description:
      "Use this technique first thing in the morning for quick burst of energy and alertness.",
  },
  {
    id: "coherent",
    name: "Coherent",
    steps: [ms("5.5s"), 0, ms("5.5s"), 0],
    description:
      "Equal inhales and exhales at about five and a half breaths per minute. This pace brings the heart rate and the breath into step.",
  },
  {
    id: "extended-exhale",
    name: "Extended Exhale",
    steps: [ms("4s"), 0, ms("6s"), 0],
    description:
      "The exhale lasts longer than the inhale, which is the simplest way to settle. Use it when you have only a minute.",
  },
  {
    id: "pranayama",
    name: "Pranayama",
    steps: [ms("7s"), ms("4s"), ms("8s"), ms("4s")],
    description: "A main component of yoga, an exercise for physical and mental wellness.",
  },
  {
    id: "rectangular",
    name: "Rectangular",
    steps: [ms("5s"), ms("8s"), ms("5s"), ms("8s")],
    description: "A slower box-breathing rhythm with longer holds between equal breaths.",
  },
  {
    id: "square",
    name: "Square",
    steps: [ms("4s"), ms("4s"), ms("4s"), ms("4s")],
    description:
      "Box breathing, also referred to as square breathing, can help you slow down your breathing and reduce stress.",
  },
  {
    id: "ujjayi",
    name: "Ujjayi",
    steps: [ms("7s"), 0, ms("7s"), 0],
    description:
      "Balance influence on the cardiorespiratory system, release feelings of irritation, and calm the mind and body.",
  },
  {
    id: "wim-hof",
    name: "Wim Hof Method",
    steps: [ms("2s"), 0, ms("2s"), 0],
    description:
      "A steady rhythm for the active breathing phase. It does not include the method's retention phase.",
  },
];
