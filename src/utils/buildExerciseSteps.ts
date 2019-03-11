// Given an array of durations (e.g.: [4, 4, 4, 4]) maps it to an array of
// objects with the steps informations
export const buildExerciseSteps = (durations: number[]) => [
  {
    id: "inhale",
    label: "Breathe in",
    duration: durations[0] * 1000,
    showDots: false,
    skipped: durations[0] === 0
  },
  {
    id: "afterInhale",
    label: "Hold",
    duration: durations[1] * 1000,
    showDots: true,
    skipped: durations[1] === 0
  },
  {
    id: "exhale",
    label: "Breathe out",
    duration: durations[2] * 1000,
    showDots: false,
    skipped: durations[2] === 0
  },
  {
    id: "afterExhale",
    label: "Hold",
    duration: durations[3] * 1000,
    showDots: true,
    skipped: durations[3] === 0
  }
];
