import { buildStepsMetadata } from "../build-steps-metadata";

describe("buildStepsMetadata", () => {
  test("maps the four breathing phases in execution order", () => {
    expect(buildStepsMetadata([4_000, 2_000, 6_000, 1_000])).toEqual([
      {
        id: "inhale",
        label: "Inhale",
        audioId: "breatheIn",
        duration: 4_000,
        showDots: false,
        skipped: false,
      },
      {
        id: "afterInhale",
        label: "Hold",
        audioId: "hold",
        duration: 2_000,
        showDots: true,
        skipped: false,
      },
      {
        id: "exhale",
        label: "Exhale",
        audioId: "breatheOut",
        duration: 6_000,
        showDots: false,
        skipped: false,
      },
      {
        id: "afterExhale",
        label: "Hold",
        audioId: "hold",
        duration: 1_000,
        showDots: true,
        skipped: false,
      },
    ]);
  });

  test("marks zero-duration phases as skipped without reordering them", () => {
    const steps = buildStepsMetadata([6_000, 0, 2_000, 0]);

    expect(steps.map(({ id, skipped }) => ({ id, skipped }))).toEqual([
      { id: "inhale", skipped: false },
      { id: "afterInhale", skipped: true },
      { id: "exhale", skipped: false },
      { id: "afterExhale", skipped: true },
    ]);
  });
});
