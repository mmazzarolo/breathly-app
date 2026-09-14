import ms from "ms";
import { patternPresets } from "@breathly/assets/pattern-presets";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";
import type { PatternSteps } from "@breathly/types/pattern-preset";

export type CustomPatternSteps = PatternSteps;
export type Theme = "dark" | "light";

export interface PersistedSettingsState {
  customPatternEnabled: boolean;
  customPatternSteps: CustomPatternSteps;
  selectedPatternPresetId: string;
  guidedBreathingVoice: GuidedBreathingMode;
  healthConnectEnabled: boolean;
  timeLimit: number;
  shouldFollowSystemDarkMode: boolean;
  theme: Theme;
  vibrationEnabled: boolean;
}

// A tuple, not an array: `normalizePersistedSettingsState` maps over this to build the four
// steps, so its length is what guarantees the result really has four of them.
export const customPatternDurationLimits: [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
] = [
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
  healthConnectEnabled: false,
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
  stepValue: number,
): CustomPatternSteps => {
  const limits = customPatternDurationLimits[stepIndex];
  if (!limits) return steps;

  const nextSteps = [...steps] as CustomPatternSteps;
  nextSteps[stepIndex] = clampFiniteNumber(
    stepValue,
    limits[0],
    limits[1],
    defaultSettingsState.customPatternSteps[stepIndex] ?? limits[0],
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
  const customPatternSteps = customPatternDurationLimits.map(([minimum, maximum], index) =>
    clampFiniteNumber(
      candidateSteps[index],
      minimum,
      maximum,
      defaultSettingsState.customPatternSteps[index] ?? minimum,
    ),
  ) as CustomPatternSteps;
  const selectedPatternPresetId = patternPresets.some(
    (preset) => preset.id === candidate.selectedPatternPresetId,
  )
    ? (candidate.selectedPatternPresetId as string)
    : defaultSettingsState.selectedPatternPresetId;
  const guidedBreathingVoice = guidedBreathingModes.includes(
    candidate.guidedBreathingVoice as GuidedBreathingMode,
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
    healthConnectEnabled:
      typeof candidate.healthConnectEnabled === "boolean"
        ? candidate.healthConnectEnabled
        : defaultSettingsState.healthConnectEnabled,
    timeLimit: clampFiniteNumber(
      candidate.timeLimit,
      0,
      maximumTimeLimitMs,
      defaultSettingsState.timeLimit,
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
  currentState: CurrentState,
): CurrentState =>
  ({
    ...currentState,
    ...normalizePersistedSettingsState(persistedState),
  }) as CurrentState;
