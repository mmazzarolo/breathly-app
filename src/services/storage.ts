import AsyncStorage from "@react-native-community/async-storage";

export const restoreTechniqueId = async () => {
  const storedTechniqueId = await AsyncStorage.getItem("techniqueId");
  return storedTechniqueId ? storedTechniqueId : "square";
};

export const persistTechniqueId = async (techniqueId: string) => {
  return await AsyncStorage.setItem("techniqueId", techniqueId);
};

export const restoreTimerDuration = async () => {
  const storedTimerDuration = await AsyncStorage.getItem("timerDuration");
  return storedTimerDuration ? Number(storedTimerDuration) : 0;
};

export const persistTimerDuration = async (timerDuration: number) => {
  return await AsyncStorage.setItem("timerDuration", timerDuration.toString());
};

export const restoreDarkModeFlag = async () => {
  const storedDarkModeFlag = await AsyncStorage.getItem("darkModeFlag");
  if (storedDarkModeFlag === "true") {
    return true;
  } else {
    return false;
  }
};

export const persistDarkModeFlag = async (darkModeFlag: boolean) => {
  return await AsyncStorage.setItem("darkModeFlag", darkModeFlag.toString());
};

export const restorGuidedBreathingFlag = async () => {
  const storedGuidedBreathingFlag = await AsyncStorage.getItem(
    "guidedBreathingFlag"
  );
  if (storedGuidedBreathingFlag === "true") {
    return true;
  } else {
    return false;
  }
};

export const persistGuidedBreathingFlag = async (
  guidedBreathingFlag: boolean
) => {
  return await AsyncStorage.setItem(
    "guidedBreathingFlag",
    guidedBreathingFlag.toString()
  );
};

export const restoreAll = async () => {
  const [
    techniqueId,
    timerDuration,
    darkModeFlag,
    guidedBreathingFlag
  ] = await Promise.all([
    restoreTechniqueId(),
    restoreTimerDuration(),
    restoreDarkModeFlag(),
    restorGuidedBreathingFlag()
  ]);
  return {
    techniqueId,
    timerDuration,
    darkModeFlag,
    guidedBreathingFlag
  };
};
