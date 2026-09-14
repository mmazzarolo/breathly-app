import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import {
  persist,
  subscribeWithSelector,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";
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
import { delay } from "@breathly/utils/delay";

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
  setShouldKeepNavigationBarVisible: (shouldKeepNavigationBarVisible: boolean) => unknown;
}

const readRetryDelayMs = 50;

// An unreadable or damaged payload must never stop hydration. Zustand leaves `hasHydrated`
// false when the read rejects, `useHydration` then never turns true, and the app renders an
// empty view on every launch — with no way back, because the app has no network. Both
// failures mean the same thing here: there are no usable stored settings. Report that, and
// let the store start from its defaults.
const settingsStorage: PersistStorage<SettingsStore> = {
  getItem: async (name) => {
    // Falling back to the defaults means the next settings change overwrites whatever is on
    // disk. A transient failure — a briefly locked database, say — would then cost the user
    // their real settings, so give the read a second chance, after a pause long enough for
    // the lock to clear. Back to back the retry would only survive a bridge hiccup.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) await delay(readRetryDelayMs);
        const storedValue = await AsyncStorage.getItem(name);
        if (storedValue == null) return null;
        return JSON.parse(storedValue) as StorageValue<SettingsStore>;
      } catch (error) {
        // Damaged text will not parse on a retry either. Only a failed read is worth repeating.
        if (error instanceof SyntaxError) {
          console.warn("[settings] discarding a damaged settings payload", error);
          return null;
        }
        if (attempt === 1) {
          console.warn("[settings] could not read the stored settings", error);
          return null;
        }
      }
    }
    return null;
  },
  setItem: async (name, value) => {
    try {
      await AsyncStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      // A failed write costs the user one setting. Rejecting would only add an unhandled
      // rejection on top, and would not bring the value back. Leave a trace instead: the app
      // is offline, so a log is the only channel there is.
      console.warn("[settings] could not save the settings", error);
    }
  },
  removeItem: async (name) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.warn("[settings] could not clear the stored settings", error);
    }
  },
};

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
              stepValue,
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
        setShouldKeepNavigationBarVisible: (shouldKeepNavigationBarVisible) =>
          set({ shouldKeepNavigationBarVisible }),
      }),
      {
        name: "settings-storage",
        storage: settingsStorage,
        merge: mergePersistedSettingsState,
      },
    ),
  ),
);

export const useSelectedPatternName = () =>
  useSettingsStore((state) =>
    state.customPatternEnabled
      ? "Custom"
      : (patternPresets.find((patternPreset) => patternPreset.id === state.selectedPatternPresetId)
          ?.name ?? patternPresets[0].name),
  );

export const useSelectedPatternSteps = () =>
  useSettingsStore((state) =>
    state.customPatternEnabled
      ? state.customPatternSteps
      : (patternPresets.find((patternPreset) => patternPreset.id === state.selectedPatternPresetId)
          ?.steps ?? patternPresets[0].steps),
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
