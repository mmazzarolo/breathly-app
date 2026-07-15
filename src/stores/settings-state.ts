import ms from "ms";
import { patternPresets } from "@breathly/assets/pattern-presets";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";

export type CustomPatternSteps = [number, number, number, number];
export type Theme = "dark" | "light";

export interface PersistedSettingsState {
  customPatternEnabled: boolean;
  customPatternSteps: CustomPatternSteps;
  selectedPatternPresetId: string;
  guidedBreathingVoice: GuidedBreathingMode;
  timeLimit: number;
  shouldFollowSystemDarkMode: boolean;
  theme: Theme;
  vibrationEnabled: boolean;
}

export const customPatternDurationLimits: [number, number][] = [
  [ms("1 sec"), ms("99 sec")],
  [0, ms("99 sec")],
  [ms("1 sec"), ms("99 sec")],
  [0, ms("99 sec")],
];
export const customPatternStepSizeMs = ms("0.5 sec");
export const timeLimitStepMs = ms("1 min");
export const maximumTimeLimitMs = ms("60 min");

export const defaultSettingsState: PersistedSettingsState = {
  customPatternEnabled: false,
  customPatternSteps: [ms("4 sec"), ms("2 sec"), ms("4 sec"), ms("2 sec")],
  selectedPatternPresetId: "square",
  guidedBreathingVoice: "paul",
  timeLimit: ms("2 min"),
  shouldFollowSystemDarkMode: true,
  theme: "light",
  vibrationEnabled: true,
};

const guidedBreathingModes: GuidedBreathingMode[] = ["laura", "paul", "bell", "disabled"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const clampFiniteNumber = (value: unknown, minimum: number, maximum: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback;

export const setCustomPatternStepValue = (
  steps: CustomPatternSteps,
  stepIndex: number,
  stepValue: number
): CustomPatternSteps => {
  const limits = customPatternDurationLimits[stepIndex];
  if (!limits) return steps;

  const nextSteps = [...steps] as CustomPatternSteps;
  nextSteps[stepIndex] = clampFiniteNumber(
    stepValue,
    limits[0],
    limits[1],
    defaultSettingsState.customPatternSteps[stepIndex]
  );
  return nextSteps;
};

export const adjustTimeLimit = (timeLimit: number, deltaMs: number) =>
  clampFiniteNumber(timeLimit + deltaMs, 0, maximumTimeLimitMs, defaultSettingsState.timeLimit);

export const normalizePersistedSettingsState = (value: unknown): PersistedSettingsState => {
  const candidate = isRecord(value) ? value : {};
  const candidateSteps = Array.isArray(candidate.customPatternSteps)
    ? candidate.customPatternSteps
    : [];
  const customPatternSteps = defaultSettingsState.customPatternSteps.map((fallback, index) =>
    clampFiniteNumber(
      candidateSteps[index],
      customPatternDurationLimits[index][0],
      customPatternDurationLimits[index][1],
      fallback
    )
  ) as CustomPatternSteps;
  const selectedPatternPresetId = patternPresets.some(
    (preset) => preset.id === candidate.selectedPatternPresetId
  )
    ? (candidate.selectedPatternPresetId as string)
    : defaultSettingsState.selectedPatternPresetId;
  const guidedBreathingVoice = guidedBreathingModes.includes(
    candidate.guidedBreathingVoice as GuidedBreathingMode
  )
    ? (candidate.guidedBreathingVoice as GuidedBreathingMode)
    : defaultSettingsState.guidedBreathingVoice;
  const theme =
    candidate.theme === "dark" || candidate.theme === "light" ? candidate.theme : "light";

  return {
    customPatternEnabled:
      typeof candidate.customPatternEnabled === "boolean"
        ? candidate.customPatternEnabled
        : defaultSettingsState.customPatternEnabled,
    customPatternSteps,
    selectedPatternPresetId,
    guidedBreathingVoice,
    timeLimit: clampFiniteNumber(
      candidate.timeLimit,
      0,
      maximumTimeLimitMs,
      defaultSettingsState.timeLimit
    ),
    shouldFollowSystemDarkMode:
      typeof candidate.shouldFollowSystemDarkMode === "boolean"
        ? candidate.shouldFollowSystemDarkMode
        : defaultSettingsState.shouldFollowSystemDarkMode,
    theme,
    vibrationEnabled:
      typeof candidate.vibrationEnabled === "boolean"
        ? candidate.vibrationEnabled
        : defaultSettingsState.vibrationEnabled,
  };
};

export const mergePersistedSettingsState = <CurrentState extends PersistedSettingsState>(
  persistedState: unknown,
  currentState: CurrentState
): CurrentState =>
  ({
    ...currentState,
    ...normalizePersistedSettingsState(persistedState),
  } as CurrentState);
