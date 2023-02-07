import { useColorScheme } from "nativewind";
import { Platform, StatusBar } from "react-native";

export const useThemedStatusBar = () => {
  const { colorScheme } = useColorScheme();

  if (Platform.OS === "ios") {
    StatusBar.setBarStyle(colorScheme === "dark" ? "light-content" : "dark-content", true);
  }
};
