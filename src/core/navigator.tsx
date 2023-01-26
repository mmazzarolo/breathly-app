import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  NavigationState,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { FC } from "react";
import { Platform, Button } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@breathly/design/colors";
import { ExerciseScreen } from "@breathly/screens/exercise-screen/exercise-screen";
import { HomeScreen } from "@breathly/screens/home-screen/home-screen";
import {
  SettingsRootScreen,
  SettingsPatternPickerScreen,
} from "@breathly/screens/settings-screen/settings-screen";

export type RootStackParamList = {
  Home: undefined;
  Exercise: undefined;
  Settings: undefined;
};
const RootStack = createNativeStackNavigator<RootStackParamList>();

export type SettingsStackParamList = {
  SettingsRoot: undefined;
  SettingsPatternPicker: undefined;
};

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

interface Props {
  onStateChange: (state: NavigationState | undefined) => void;
}

export const navigationContainerRef = createNavigationContainerRef();

export const Navigator: FC<Props> = ({ onStateChange }) => {
  const { colorScheme } = useNativeWindColorScheme();
  const baseTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const backgroundColor = colorScheme === "dark" ? colors["slate-900"] : colors["stone-100"];
  const theme = {
    ...baseTheme,
    dark: colorScheme === "dark",
    colors: {
      ...baseTheme.colors,
      background: backgroundColor,
    },
  };
  return (
    <SafeAreaProvider style={{ backgroundColor }}>
      <NavigationContainer theme={theme} onStateChange={onStateChange} ref={navigationContainerRef}>
        <RootStack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <RootStack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              animation: Platform.OS === "ios" ? "fade" : "simple_push",
            }}
          />
          <RootStack.Screen
            name="Exercise"
            component={ExerciseScreen}
            options={{
              animation: Platform.OS === "ios" ? "fade" : "simple_push",
            }}
          />
          <RootStack.Screen
            name="Settings"
            options={{
              presentation: Platform.select({
                ios: "formSheet",
              }),
            }}
          >
            {() => {
              const commonHeaderSettings = {
                headerShadowVisible: Platform.OS === "ios",
                headerStyle: {
                  backgroundColor:
                    colorScheme === "dark" ? colors["slate-900"] : colors["stone-100"],
                },
                headerTintColor: Platform.OS === "ios" ? undefined : colors["blue-400"],
              };
              return (
                <SettingsStack.Navigator initialRouteName="SettingsRoot">
                  <SettingsStack.Screen
                    name="SettingsRoot"
                    component={SettingsRootScreen}
                    options={{
                      ...commonHeaderSettings,
                      headerLargeTitle: true,
                      headerTitle: "Customizations",
                      headerLargeTitleShadowVisible: true,
                      headerRight: () => (Platform.OS === "ios" ? <Button title="Done" /> : null),
                    }}
                  />
                  <SettingsStack.Screen
                    name="SettingsPatternPicker"
                    component={SettingsPatternPickerScreen}
                    options={{
                      headerTitle: "Breathing Patterns",
                      ...commonHeaderSettings,
                    }}
                  />
                </SettingsStack.Navigator>
              );
            }}
          </RootStack.Screen>
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
