import { produce } from "immer";
import React, {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { Appearance } from "react-native";
import { techniques } from "../config/techniques";
import { darkThemeColors, lightThemeColors } from "../config/themes";
import {
  restoreString,
  restoreNumber,
  restoreBoolean,
  persistString,
  persistNumber,
  persistBoolean,
} from "../services/storage";
import { GuidedBreathingMode } from "../types/guided-breathing-mode";

type SystemColorScheme = "no-preference" | "dark" | "light";

type Action =
  | { type: "INITIALIZE"; payload: State }
  | { type: "SET_SYSTEM_COLOR_SCHEME"; payload: SystemColorScheme }
  | { type: "SET_TECHNIQUE_ID"; payload: string }
  | { type: "SET_TIMER_DURATION"; payload: number }
  | { type: "SET_GUIDED_BREATHING_MODE"; payload: GuidedBreathingMode }
  | { type: "TOGGLE_FOLLOW_SYSTEM_DARK_MODE" }
  | { type: "TOGGLE_CUSTOM_DARK_MODE" }
  | { type: "TOGGLE_STEP_VIBRATION" }
  | { type: "SET_CUSTOM_PATTERN_DURATIONS"; payload: number[] };

interface State {
  ready: boolean;
  systemColorScheme: SystemColorScheme;
  techniqueId: string;
  timerDuration: number;
  customDarkModeFlag: boolean;
  followSystemDarkModeFlag: boolean;
  guidedBreathingMode: GuidedBreathingMode;
  stepVibrationFlag: boolean;
  customPatternDurations: number[];
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
const initialCustomPatternDurations = techniques.find((x) => x.id === "custom")?.durations!;

const initialState: State = {
  ready: false,
  systemColorScheme: "no-preference",
  techniqueId: "square",
  timerDuration: 0,
  followSystemDarkModeFlag: false,
  customDarkModeFlag: false,
  guidedBreathingMode: "disabled",
  stepVibrationFlag: false,
  customPatternDurations: initialCustomPatternDurations,
};

const reducer = produce((draft: State = initialState, action: Action) => {
  if (__DEV__) {
    console.log(action);
  }
  switch (action.type) {
    case "INITIALIZE": {
      return { ...initialState, ...action.payload, ready: true };
    }
    case "SET_SYSTEM_COLOR_SCHEME": {
      draft.systemColorScheme = action.payload;
      return;
    }
    case "SET_TECHNIQUE_ID": {
      draft.techniqueId = action.payload;
      return;
    }
    case "SET_TIMER_DURATION": {
      draft.timerDuration = action.payload;
      return;
    }
    case "TOGGLE_CUSTOM_DARK_MODE": {
      draft.customDarkModeFlag = !draft.customDarkModeFlag;
      return;
    }
    case "TOGGLE_STEP_VIBRATION": {
      draft.stepVibrationFlag = !draft.stepVibrationFlag;
      return;
    }
    case "TOGGLE_FOLLOW_SYSTEM_DARK_MODE": {
      draft.followSystemDarkModeFlag = !draft.followSystemDarkModeFlag;
      draft.customDarkModeFlag = false;
      return;
    }
    case "SET_GUIDED_BREATHING_MODE": {
      draft.guidedBreathingMode = action.payload;
      return;
    }
    case "SET_CUSTOM_PATTERN_DURATIONS": {
      draft.customPatternDurations = action.payload;
      return;
    }
  }
});

const getTechnique = (state: State) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return techniques.find((x) => x.id === state.techniqueId)!;
};

const getTheme = (state: State) => {
  const technique = getTechnique(state);
  let darkMode = false;
  if (state.followSystemDarkModeFlag) {
    darkMode = state.systemColorScheme === "dark";
  } else {
    darkMode = state.customDarkModeFlag;
  }
  return {
    darkMode: darkMode,
    ...(darkMode ? darkThemeColors : lightThemeColors),
    mainColor: technique.color,
  };
};

interface AppContext {
  state: State;
  dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContext>({
  state: initialState,
  dispatch: () => null,
});

export const AppContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    // TODO: Fix this readyonly Array error
    // @ts-ignore
    <AppContext.Provider value={{ state: state!, dispatch }}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => {
  const { state, dispatch } = useContext(AppContext);
  const initialize = async () => {
    const [
      techniqueId,
      timerDuration,
      customDarkModeFlag,
      followSystemDarkModeFlag,
      _guidedBreathingMode,
      stepVibrationFlag,
      customPatternDurationsStr,
    ] = await Promise.all([
      restoreString("techniqueId", "square"),
      restoreNumber("timerDuration", 0),
      restoreBoolean("customDarkModeFlag"),
      restoreBoolean("followSystemDarkModeFlag"),
      restoreString("guidedBreathingMode", "disabled"),
      restoreBoolean("stepVibrationFlag"),
      restoreString("customPatternDurations", initialCustomPatternDurations.join(",")),
    ]);
    const colorScheme: SystemColorScheme = Appearance.getColorScheme() || "no-preference";
    const guidedBreathingMode = _guidedBreathingMode as GuidedBreathingMode;
    const payload = {
      ...initialState,
      systemColorScheme: colorScheme,
      techniqueId,
      timerDuration,
      customDarkModeFlag,
      followSystemDarkModeFlag,
      guidedBreathingMode,
      stepVibrationFlag,
      customPatternDurations: customPatternDurationsStr.split(",").map(Number),
    };
    dispatch({ type: "INITIALIZE", payload: payload });
  };
  const setSystemColorScheme = (systemColorScheme: SystemColorScheme) => {
    dispatch({ type: "SET_SYSTEM_COLOR_SCHEME", payload: systemColorScheme });
  };
  const setTechniqueId = (techniqueId: string) => {
    persistString("techniqueId", techniqueId);
    dispatch({ type: "SET_TECHNIQUE_ID", payload: techniqueId });
  };
  const setTimerDuration = (timerDuration: number) => {
    persistNumber("timerDuration", timerDuration);
    dispatch({ type: "SET_TIMER_DURATION", payload: timerDuration });
  };
  const toggleTimer = () => {
    const timerDuration = state.timerDuration ? 0 : 3 * 1000 * 60;
    persistNumber("timerDuration", timerDuration);
    dispatch({ type: "SET_TIMER_DURATION", payload: timerDuration });
  };
  const toggleCustomDarkMode = () => {
    persistBoolean("customDarkModeFlag", !state.customDarkModeFlag);
    dispatch({ type: "TOGGLE_CUSTOM_DARK_MODE" });
  };
  const toggleFollowSystemDarkMode = () => {
    persistBoolean("followSystemDarkModeFlag", !state.followSystemDarkModeFlag);
    dispatch({ type: "TOGGLE_FOLLOW_SYSTEM_DARK_MODE" });
  };
  const setGuidedBreathingMode = (guidedBreathingMode: GuidedBreathingMode) => {
    persistString("guidedBreathingMode", guidedBreathingMode);
    dispatch({
      type: "SET_GUIDED_BREATHING_MODE",
      payload: guidedBreathingMode,
    });
  };
  const toggleStepVibration = () => {
    persistBoolean("stepVibrationFlag", !state.stepVibrationFlag);
    dispatch({ type: "TOGGLE_STEP_VIBRATION" });
  };
  const updateCustomPatternDuration = (index: number, update: number) => {
    const newCustomPatternDurations = produce(state.customPatternDurations, (draft) => {
      draft[index] += update;
    });
    persistString("customPatternDurations", newCustomPatternDurations.join(","));
    dispatch({
      type: "SET_CUSTOM_PATTERN_DURATIONS",
      payload: newCustomPatternDurations,
    });
  };
  const technique = getTechnique(state);
  return {
    ...state,
    theme: getTheme(state),
    technique: {
      ...technique,
      durations: technique.id === "custom" ? state.customPatternDurations : technique.durations,
    },
    initialize,
    setSystemColorScheme,
    setTechniqueId,
    setTimerDuration,
    toggleCustomDarkMode,
    toggleFollowSystemDarkMode,
    toggleStepVibration,
    toggleTimer,
    setGuidedBreathingMode,
    updateCustomPatternDuration,
  };
};
