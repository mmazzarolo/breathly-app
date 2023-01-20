import * as NavigationBar from "expo-navigation-bar";

export const changeNavigationBarColor = async (color: string, light = false) => {
  return Promise.all([
    NavigationBar.setBackgroundColorAsync(color),
    NavigationBar.setButtonStyleAsync(light ? "dark" : "light"),
  ]);
};
