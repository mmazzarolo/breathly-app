import React, {
  createContext,
  Dispatch,
  FC,
  useContext,
  useReducer
} from "react";
import { darkThemeColors, lightThemeColors } from "../config/themes";
import { getTechnique } from "../utils/getTechinque";
import {
  persistDarkModeFlag,
  persistGuidedBreathingFlag,
  persistTechniqueId,
  persistTimerDuration,
  restoreAll
} from "../services/storage";

type Action =
  | {
      type: "INITIALIZE";
      payload: Pick<
        State,
        "techniqueId" | "timerDuration" | "darkModeFlag" | "guidedBreathingFlag"
      >;
    }
  | { type: "SET_TECHNIQUE_ID"; payload: string }
  | { type: "SET_TIMER_DURATION"; payload: number }
  | { type: "TOGGLE_GUIDED_BREATHING" }
  | { type: "TOGGLE_DARK_MODE" };

interface State {
  ready: boolean;
  techniqueId: string;
  timerDuration: number;
  darkModeFlag: boolean;
  guidedBreathingFlag: boolean;
  theme: {
    mainColor: string;
    textColor: string;
    textColorLighter: string;
    backgroundColor: string;
  };
}

const initialState: State = {
  ready: false,
  techniqueId: "square",
  timerDuration: 0,
  darkModeFlag: false,
  guidedBreathingFlag: false,
  theme: { ...lightThemeColors, mainColor: getTechnique("square").color }
};

const reducer = (state: State = initialState, action: Action) => {
  switch (action.type) {
    case "INITIALIZE": {
      const {
        techniqueId,
        timerDuration,
        darkModeFlag,
        guidedBreathingFlag
      } = action.payload;
      return {
        ...state,
        techniqueId: techniqueId,
        timerDuration: timerDuration,
        darkModeFlag: darkModeFlag,
        guidedBreathingFlag: guidedBreathingFlag,
        theme: {
          ...(darkModeFlag ? darkThemeColors : lightThemeColors),
          mainColor: getTechnique(techniqueId).color
        },
        ready: true
      };
    }
    case "SET_TECHNIQUE_ID": {
      return {
        ...state,
        techniqueId: action.payload,
        theme: { ...state.theme, mainColor: getTechnique(action.payload).color }
      };
    }
    case "SET_TIMER_DURATION": {
      return { ...state, timerDuration: action.payload };
    }
    case "TOGGLE_DARK_MODE":
      return state.darkModeFlag
        ? {
            ...state,
            theme: { ...state.theme, ...lightThemeColors },
            darkModeFlag: false
          }
        : {
            ...state,
            theme: { ...state.theme, ...darkThemeColors },
            darkModeFlag: true
          };
    case "TOGGLE_GUIDED_BREATHING":
      return { ...state, guidedBreathingFlag: !state.guidedBreathingFlag };
    default:
      return state;
  }
};

interface AppContext {
  state: State;
  dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContext>({
  state: initialState,
  dispatch: () => null
});

export const AppContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const { state, dispatch } = useContext(AppContext);
  const initialize = async () => {
    const payload = await restoreAll();
    dispatch({ type: "INITIALIZE", payload: payload });
  };
  const setTechniqueId = (techniqueId: string) => {
    persistTechniqueId(techniqueId);
    dispatch({ type: "SET_TECHNIQUE_ID", payload: techniqueId });
  };
  const setTimerDuration = (timerDuration: number) => {
    persistTimerDuration(timerDuration);
    dispatch({ type: "SET_TIMER_DURATION", payload: timerDuration });
  };
  const toggleDarkMode = () => {
    persistDarkModeFlag(!state.darkModeFlag);
    dispatch({ type: "TOGGLE_DARK_MODE" });
  };
  const toggleGuidedBreathing = () => {
    persistGuidedBreathingFlag(!state.guidedBreathingFlag);
    dispatch({ type: "TOGGLE_GUIDED_BREATHING" });
  };
  return {
    ...state,
    technique: getTechnique(state.techniqueId),
    initialize,
    setTechniqueId,
    setTimerDuration,
    toggleDarkMode,
    toggleGuidedBreathing
  };
};
