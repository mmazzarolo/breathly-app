import ms from "ms";
import { PatternPreset } from "../types/pattern-preset";

export const patternPresets: PatternPreset[] = [
  {
    id: "awake",
    name: "Awake",
    steps: [ms("6s"), 0, ms("2s"), 0],
    description:
      "Use this technique first thing in the morning for quick burst of energy and alertness.",
  },
  {
    id: "deep-calm",
    name: "Deep Calm",
    steps: [ms("4s"), ms("7s"), ms("8s"), 0],
    description: "A natural tranquilizer for the nervous system. Do it at least twice a day.",
  },
  {
    id: "pranayama",
    name: "Pranayama",
    steps: [ms("7s"), ms("4s"), ms("8s"), ms("4s")],
    description: "A main component of yoga, an exercise for physical and mental wellness.",
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
];
