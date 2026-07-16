import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { patternPresets } from "@breathly/assets/pattern-presets";
import {
  adjustTimeLimit,
  defaultSettingsState,
  mergePersistedSettingsState,
  setCustomPatternStepValue,
  timeLimitStepMs,
  type PersistedSettingsState,
  type Theme,
} from "@breathly/stores/settings-state";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";

interface SettingsStore extends PersistedSettingsState {
  setCustomPatternEnabled: (enabled: boolean) => unknown;
  setCustomPatternStep: (stepIndex: number, stepValue: number) => unknown;
  setSelectedPatternPresetId: (patternPresetId: string) => unknown;
  setGuidedBreathingVoice: (guidedBreathingVoice: GuidedBreathingMode) => unknown;
  increaseTimeLimit: () => unknown;
  decreaseTimeLimit: () => unknown;
  setShouldFollowSystemDarkMode: (shouldFollowSystemDarkMode: boolean) => unknown;
  setTheme: (theme: Theme) => unknown;
  setVibrationEnabled: (vibrationEnabled: boolean) => unknown;
}

export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...defaultSettingsState,
        setCustomPatternEnabled: (enabled) => set({ customPatternEnabled: enabled }),
        setCustomPatternStep: (stepIndex, stepValue) => {
          set({
            customPatternSteps: setCustomPatternStepValue(
              get().customPatternSteps,
              stepIndex,
              stepValue
            ),
          });
        },
        setSelectedPatternPresetId: (selectedPatternPresetId) => set({ selectedPatternPresetId }),
        setGuidedBreathingVoice: (guidedBreathingVoice) => set({ guidedBreathingVoice }),
        increaseTimeLimit: () =>
          set({ timeLimit: adjustTimeLimit(get().timeLimit, timeLimitStepMs) }),
        decreaseTimeLimit: () =>
          set({ timeLimit: adjustTimeLimit(get().timeLimit, -timeLimitStepMs) }),
        setShouldFollowSystemDarkMode: (shouldFollowSystemDarkMode) =>
          set({ shouldFollowSystemDarkMode }),
        setTheme: (theme) => set({ theme }),
        setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
      }),
      {
        name: "settings-storage",
        storage: createJSONStorage(() => AsyncStorage),
        merge: mergePersistedSettingsState,
      }
    )
  )
);

export const useSelectedPatternName = () =>
  useSettingsStore((state) =>
    state.customPatternEnabled
      ? "Custom"
      : patternPresets.find((patternPreset) => patternPreset.id === state.selectedPatternPresetId)
          ?.name ?? patternPresets[0].name
  );

export const useSelectedPatternSteps = () =>
  useSettingsStore((state) =>
    state.customPatternEnabled
      ? state.customPatternSteps
      : patternPresets.find((patternPreset) => patternPreset.id === state.selectedPatternPresetId)
          ?.steps ?? patternPresets[0].steps
  );

// https://github.com/pmndrs/zustand/blob/725c2c0cc08df936f42a52e3df3dec76780a6e01/docs/integrations/persisting-store-data.md
export const useHydration = () => {
  const [hydrated, setHydrated] = useState(useSettingsStore.persist.hasHydrated);

  useEffect(() => {
    const unsubFinishHydration = useSettingsStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    setHydrated(useSettingsStore.persist.hasHydrated());
    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
