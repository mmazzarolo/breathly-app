import { StepMetadata } from "../types/step-metadata";

// Given an array of durations (e.g.: [4, 4, 4, 4]) maps it to an array of
// objects with the steps informations
export const buildStepsMetadata = (
  durations: number[]
): [StepMetadata, StepMetadata, StepMetadata, StepMetadata] => [
  {
    id: "inhale",
    label: "Inhale",
    audioId: "breatheIn",
    duration: durations[0],
    showDots: false,
    skipped: durations[0] === 0,
  },
  {
    id: "afterInhale",
    label: "Hold",
    audioId: "hold",
    duration: durations[1],
    showDots: true,
    skipped: durations[1] === 0,
  },
  {
    id: "exhale",
    label: "Exhale",
    audioId: "breatheOut",
    duration: durations[2],
    showDots: false,
    skipped: durations[2] === 0,
  },
  {
    id: "afterExhale",
    label: "Hold",
    audioId: "hold",
    duration: durations[3],
    showDots: true,
    skipped: durations[3] === 0,
  },
];
