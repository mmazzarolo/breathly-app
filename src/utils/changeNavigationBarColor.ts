import { NativeModules, Platform } from "react-native";

export const changeNavigationBarColor = async (
  color: string,
  darkContent: boolean = false
) => {
  if (Platform.OS === "android") {
    return NativeModules.NavigationBarColor.changeNavigationBarColor(
      color,
      darkContent
    );
  }
};
