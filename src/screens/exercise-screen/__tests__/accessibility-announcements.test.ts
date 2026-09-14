import {
  getInterludeAccessibilityLabel,
  getStepAccessibilityLabel,
} from "../accessibility-announcements";

describe("exercise accessibility labels", () => {
  it("reads the step and its duration", () => {
    expect(getStepAccessibilityLabel("Inhale", 4_000)).toBe("Inhale, 4 seconds");
    expect(getStepAccessibilityLabel("Exhale", 8_000)).toBe("Exhale, 8 seconds");
  });

  it("reads a duration of one second in the singular", () => {
    expect(getStepAccessibilityLabel("Hold", 1_000)).toBe("Hold, 1 second");
  });

  // The custom pattern of the settings screen moves in steps of half a second.
  it("reads the half seconds of a custom pattern", () => {
    expect(getStepAccessibilityLabel("Hold", 500)).toBe("Hold, 0.5 seconds");
    expect(getStepAccessibilityLabel("Inhale", 4_500)).toBe("Inhale, 4.5 seconds");
    expect(getStepAccessibilityLabel("Exhale", 99_000)).toBe("Exhale, 99 seconds");
  });

  it("reads the countdown of the interlude", () => {
    expect(getInterludeAccessibilityLabel(3)).toBe("Starting session in 3 seconds");
    expect(getInterludeAccessibilityLabel(1)).toBe("Starting session in 1 second");
  });
});
