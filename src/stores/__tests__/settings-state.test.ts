import {
  adjustTimeLimit,
  customPatternDurationLimits,
  defaultSettingsState,
  maximumTimeLimitMs,
  mergePersistedSettingsState,
  normalizePersistedSettingsState,
  setCustomPatternStepValue,
} from "../settings-state";

describe("settings state", () => {
  it("fills missing persisted values with current defaults", () => {
    expect(normalizePersistedSettingsState(undefined)).toEqual(defaultSettingsState);
    expect(normalizePersistedSettingsState({ theme: "dark" })).toEqual({
      ...defaultSettingsState,
      theme: "dark",
    });
  });

  it("preserves a complete valid settings record", () => {
    const validSettings = {
      ...defaultSettingsState,
      customPatternEnabled: true,
      customPatternSteps: [1_500, 0, 8_000, 3_500] as [number, number, number, number],
      guidedBreathingVoice: "bell" as const,
      timeLimit: 0,
      shouldFollowSystemDarkMode: false,
      theme: "dark" as const,
      vibrationEnabled: false,
    };

    expect(normalizePersistedSettingsState(validSettings)).toEqual(validSettings);
  });

  it("repairs invalid legacy or malformed persisted values", () => {
    const normalized = normalizePersistedSettingsState({
      customPatternEnabled: "yes",
      customPatternSteps: [-1, Number.NaN, 200_000, 3_000],
      selectedPatternPresetId: "missing-preset",
      guidedBreathingVoice: "missing-voice",
      timeLimit: Number.POSITIVE_INFINITY,
      shouldFollowSystemDarkMode: null,
      theme: "sepia",
      vibrationEnabled: 1,
    });

    expect(normalized).toEqual({
      ...defaultSettingsState,
      customPatternSteps: [
        customPatternDurationLimits[0][0],
        defaultSettingsState.customPatternSteps[1],
        customPatternDurationLimits[2][1],
        3_000,
      ],
    });
  });

  it("keeps current store actions while merging normalized persisted data", () => {
    const action = jest.fn();
    const currentState = { ...defaultSettingsState, action };
    const mergedState = mergePersistedSettingsState(
      { theme: "dark", timeLimit: maximumTimeLimitMs + 1 },
      currentState
    );

    expect(mergedState.action).toBe(action);
    expect(mergedState.theme).toBe("dark");
    expect(mergedState.timeLimit).toBe(maximumTimeLimitMs);
  });

  it("clamps every time-limit adjustment inside the supported range", () => {
    expect(adjustTimeLimit(0, -60_000)).toBe(0);
    expect(adjustTimeLimit(maximumTimeLimitMs, 60_000)).toBe(maximumTimeLimitMs);
  });

  it("clamps custom steps and ignores invalid indexes", () => {
    const steps = defaultSettingsState.customPatternSteps;
    expect(setCustomPatternStepValue(steps, 0, 0)[0]).toBe(customPatternDurationLimits[0][0]);
    expect(setCustomPatternStepValue(steps, 4, 5_000)).toBe(steps);
  });
});
