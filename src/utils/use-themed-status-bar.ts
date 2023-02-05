import { useColorScheme } from "nativewind";
import { Platform, StatusBar } from "react-native";

export const useThemedStatusBar = () => {
  const { colorScheme } = useColorScheme();

  if (Platform.OS === "android") {
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setTranslucent(true);
  }
  StatusBar.setBarStyle(colorScheme === "dark" ? "light-content" : "dark-content", true);
};
