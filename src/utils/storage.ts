import { AsyncStorage } from "react-native";

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

export const restoreAll = async () => {
  const [techniqueId, timerDuration, darkModeFlag] = await Promise.all([
    restoreTechniqueId(),
    restoreTimerDuration(),
    restoreDarkModeFlag()
  ]);
  return {
    techniqueId,
    timerDuration,
    darkModeFlag
  };
};
