import React, {
  createContext,
  Dispatch,
  FC,
  useContext,
  useReducer,
} from "react";
import { Appearance } from "react-native";
import { produce } from "immer";
import { darkThemeColors, lightThemeColors } from "../config/themes";
import {
  restoreString,
  restoreNumber,
  restoreBoolean,
  persistString,
  persistNumber,
  persistBoolean,
} from "../services/storage";
import { techniques } from "../config/techniques";

type SystemColorScheme = "no-preference" | "dark" | "light";

type Action =
  | { type: "INITIALIZE"; payload: State }
  | { type: "SET_SYSTEM_COLOR_SCHEME"; payload: SystemColorScheme }
  | { type: "SET_TECHNIQUE_ID"; payload: string }
  | { type: "SET_TIMER_DURATION"; payload: number }
  | { type: "TOGGLE_GUIDED_BREATHING" }
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
  guidedBreathingFlag: boolean;
  stepVibrationFlag: boolean;
  customPatternDurations: number[];
}

const initialCustomPatternDurations = techniques.find((x) => x.id === "custom")
  ?.durations!;

const initialState: State = {
  ready: false,
  systemColorScheme: "no-preference",
  techniqueId: "square",
  timerDuration: 0,
  followSystemDarkModeFlag: false,
  customDarkModeFlag: false,
  guidedBreathingFlag: false,
  stepVibrationFlag: false,
  customPatternDurations: initialCustomPatternDurations,
};

const reducer = produce((draft: State = initialState, action: Action) => {
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
    case "TOGGLE_CUSTOM_DARK_MODE":
      draft.customDarkModeFlag = !draft.customDarkModeFlag;
      return;
    case "TOGGLE_STEP_VIBRATION":
      draft.stepVibrationFlag = !draft.stepVibrationFlag;
      return;
    case "TOGGLE_FOLLOW_SYSTEM_DARK_MODE":
      draft.followSystemDarkModeFlag = !draft.followSystemDarkModeFlag;
      draft.customDarkModeFlag = false;
      return;
    case "TOGGLE_GUIDED_BREATHING":
      draft.guidedBreathingFlag = !draft.guidedBreathingFlag;
      return;
    case "SET_CUSTOM_PATTERN_DURATIONS":
      draft.customPatternDurations = action.payload;
  }
});

const getTechnique = (state: State) => {
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

export const AppContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    // TODO: Fix this readyonly Array error
    // @ts-ignore
    <AppContext.Provider value={{ state: state!, dispatch }}>
      {children}
    </AppContext.Provider>
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
      guidedBreathingFlag,
      stepVibrationFlag,
      customPatternDurationsStr,
    ] = await Promise.all([
      restoreString("techniqueId", "square"),
      restoreNumber("timerDuration", 0),
      restoreBoolean("customDarkModeFlag"),
      restoreBoolean("followSystemDarkModeFlag"),
      restoreBoolean("guidedBreathingFlag"),
      restoreBoolean("stepVibrationFlag"),
      restoreString(
        "customPatternDurations",
        initialCustomPatternDurations.join(",")
      ),
    ]);
    const colorScheme: SystemColorScheme =
      Appearance.getColorScheme() || "no-preference";
    const payload = {
      ...initialState,
      systemColorScheme: colorScheme,
      techniqueId,
      timerDuration,
      customDarkModeFlag,
      followSystemDarkModeFlag,
      guidedBreathingFlag,
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
  const toggleCustomDarkMode = () => {
    persistBoolean("customDarkModeFlag", !state.customDarkModeFlag);
    dispatch({ type: "TOGGLE_CUSTOM_DARK_MODE" });
  };
  const toggleFollowSystemDarkMode = () => {
    persistBoolean("followSystemDarkModeFlag", !state.followSystemDarkModeFlag);
    dispatch({ type: "TOGGLE_FOLLOW_SYSTEM_DARK_MODE" });
  };
  const toggleGuidedBreathing = () => {
    persistBoolean("guidedBreathingFlag", !state.guidedBreathingFlag);
    dispatch({ type: "TOGGLE_GUIDED_BREATHING" });
  };
  const toggleStepVibration = () => {
    persistBoolean("stepVibrationFlag", !state.stepVibrationFlag);
    dispatch({ type: "TOGGLE_STEP_VIBRATION" });
  };
  const updateCustomPatternDuration = (index: number, update: number) => {
    const newCustomPatternDurations = produce(
      state.customPatternDurations,
      (draft) => {
        draft[index] += update;
      }
    );
    persistString(
      "customPatternDurations",
      newCustomPatternDurations.join(",")
    );
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
      durations:
        technique.id === "custom"
          ? state.customPatternDurations
          : technique.durations,
    },
    initialize,
    setSystemColorScheme,
    setTechniqueId,
    setTimerDuration,
    toggleCustomDarkMode,
    toggleFollowSystemDarkMode,
    toggleStepVibration,
    toggleGuidedBreathing,
    updateCustomPatternDuration,
  };
};
