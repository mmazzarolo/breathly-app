import AsyncStorage from "@react-native-async-storage/async-storage";
import ms from "ms";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { patternPresets } from "@breathly/assets/pattern-presets";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";

interface SettingsStore {
  customPatternEnabled: boolean;
  setCustomPatternEnabled: (enabled: boolean) => unknown;
  customPatternSteps: [number, number, number, number];
  setCustomPatternStep: (stepIndex: number, stepValue: number) => unknown;
  selectedPatternPresetId: string;
  setSelectedPatternPresetId: (patternPresetId: string) => unknown;
  guidedBreathingVoice: GuidedBreathingMode;
  setGuidedBreathingVoice: (guidedBreathingVoice: GuidedBreathingMode) => unknown;
  timeLimit: number;
  increaseTimeLimit: () => unknown;
  decreaseTimeLimit: () => unknown;
  shouldFollowSystemDarkMode: boolean;
  setShouldFollowSystemDarkMode: (shouldFollowSystemDarkMode: boolean) => unknown;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => unknown;
  vibrationEnabled: boolean;
  setVibrationEnabled: (vibrationEnabled: boolean) => unknown;
  rotatingCircleColorEnabled: boolean;
  setrotatingCircleColorEnabled: (rotatingCircleColorEnabled: boolean) => unknown;
  rotatingCircleColor: "blue-light" | "lilac" | "pink" | "blue-dark";
  setRotatingCircleColor: (
    rotatingCircleColor: "blue-light" | "lilac" | "pink" | "blue-dark"
  ) => unknown;
}

export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        customPatternEnabled: false,
        setCustomPatternEnabled: (enabled) => set({ customPatternEnabled: enabled }),
        customPatternSteps: [ms("4 sec"), ms("2 sec"), ms("4 sec"), ms("2 sec")],
        setCustomPatternStep: (stepIndex, stepValue) => {
          const customPatternSteps = Array.from(get().customPatternSteps) as [
            number,
            number,
            number,
            number
          ];
          customPatternSteps[stepIndex] = stepValue;
          set({ customPatternSteps });
        },
        selectedPatternPresetId: "square",
        setSelectedPatternPresetId: (selectedPatternPresetId) => set({ selectedPatternPresetId }),
        guidedBreathingVoice: "paul",
        setGuidedBreathingVoice: (guidedBreathingVoice) => set({ guidedBreathingVoice }),
        timeLimit: ms("2 min"),
        increaseTimeLimit: () => set({ timeLimit: get().timeLimit + ms("1 min") }),
        decreaseTimeLimit: () => set({ timeLimit: get().timeLimit - ms("1 min") }),
        shouldFollowSystemDarkMode: true,
        setShouldFollowSystemDarkMode: (shouldFollowSystemDarkMode) =>
          set({ shouldFollowSystemDarkMode }),
        theme: "light",
        setTheme: (theme) => set({ theme }),
        vibrationEnabled: true,
        setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
        rotatingCircleColorEnabled: false,
        setrotatingCircleColorEnabled: (rotatingCircleColorEnabled) =>
          set({ rotatingCircleColorEnabled }),
        rotatingCircleColor: "blue-light",
        setRotatingCircleColor: (rotatingCircleColor) => set({ rotatingCircleColor }),
      }),
      {
        name: "settings-storage",
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  )
);

export const useSelectedPatternName = () =>
  useSettingsStore((state) =>
    state.customPatternEnabled
      ? "Custom"
      : patternPresets.find((patternPreset) => patternPreset.id === state.selectedPatternPresetId)
          .name
  );

export const useSelectedPatternSteps = () =>
  useSettingsStore((state) =>
    state.customPatternEnabled
      ? state.customPatternSteps
      : patternPresets.find((patternPreset) => patternPreset.id === state.selectedPatternPresetId)
          .steps
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
