import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ms from "ms";
import React, { FC } from "react";
import { Animated, ScrollView, LayoutAnimation, Button, Platform } from "react-native";
import { patternPresets } from "@breathly/assets/pattern-presets";
import { SettingsStackParamList } from "@breathly/core/navigator";
import { SettingsUI } from "@breathly/screens/settings-screen/settings-ui";
import {
  useSelectedPatternSteps,
  useSelectedPatternName,
  useSettingsStore,
} from "@breathly/stores/settings";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";

const customDurationLimits = [
  [ms("1 sec"), ms("99 sec")],
  [0, ms("99 sec")],
  [ms("1 sec"), ms("99 sec")],
  [0, ms("99 sec")],
];

const maxTimeLimit = ms("60 min");

export const SettingsRootScreen: FC<
  NativeStackScreenProps<SettingsStackParamList, "SettingsRoot">
> = ({ navigation }) => {
  const selectedPatternName = useSelectedPatternName();
  const selectedPatternDurations = useSelectedPatternSteps();
  const guidedBreathingVoice = useSettingsStore((state) => state.guidedBreathingVoice);
  const setGuidedBreathingVoice = useSettingsStore((state) => state.setGuidedBreathingVoice);
  const timeLimit = useSettingsStore((state) => state.timeLimit);
  const increaseTimeLimit = useSettingsStore((state) => state.increaseTimeLimit);
  const decreaseTimeLimit = useSettingsStore((state) => state.decreaseTimeLimit);
  const shouldFollowSystemDarkMode = useSettingsStore((state) => state.shouldFollowSystemDarkMode);
  const setShouldFollowSystemDarkMode = useSettingsStore(
    (state) => state.setShouldFollowSystemDarkMode
  );
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const vibrationEnabled = useSettingsStore((state) => state.vibrationEnabled);
  const setVibrationEnabled = useSettingsStore((state) => state.setVibrationEnabled);

  React.useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    if (Platform.OS === "ios") {
      navigation.setOptions({
        headerRight: () => <Button onPress={navigation.goBack} title="Done" />,
      });
    }
  }, [navigation]);

  return (
    <>
      <Animated.View className="h-full w-full">
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingHorizontal: Platform.OS === "android" ? undefined : 18,
          }}
        >
          <SettingsUI.Section label="Breathing pattern">
            <SettingsUI.LinkItem
              label="Pattern"
              iconName="ios-body"
              iconBackgroundColor="#bfdbfe"
              value={`${selectedPatternName} (${selectedPatternDurations
                .map((duration) => duration / ms("1 sec"))
                .join("-")})`}
              onPress={() => navigation.navigate("SettingsPatternPicker")}
            />
          </SettingsUI.Section>
          <SettingsUI.Section label="Guided breathing">
            <SettingsUI.PickerItem
              label="Voice"
              iconName="ios-volume-medium"
              iconBackgroundColor="#fdba74"
              value={guidedBreathingVoice}
              options={
                [
                  { value: "laura", label: "Laura" },
                  { value: "paul", label: "Paul" },
                  { value: "bell", label: "Bell" },
                  { value: "disabled", label: "Disabled" },
                ] as { value: GuidedBreathingMode; label: string }[] // TODO:// Move to satisfies once prettier supports it
              }
              onValueChange={setGuidedBreathingVoice}
            />
          </SettingsUI.Section>
          <SettingsUI.Section label="Appearance">
            <SettingsUI.SwitchItem
              label="Use system theme"
              secondaryLabel="Follow system light/dark mode"
              iconName="ios-moon"
              iconBackgroundColor="#a5b4fc"
              value={shouldFollowSystemDarkMode}
              onValueChange={setShouldFollowSystemDarkMode}
            />
            {!shouldFollowSystemDarkMode && (
              <SettingsUI.PickerItem
                label="Theme"
                iconName="ios-color-palette"
                iconBackgroundColor="#d8b4fe"
                options={[
                  { value: "light", label: "Light theme" },
                  { value: "dark", label: "Dark theme" },
                ]}
                value={theme}
                onValueChange={setTheme}
              />
            )}
          </SettingsUI.Section>
          <SettingsUI.Section label="Haptics">
            <SettingsUI.SwitchItem
              label="Vibration"
              secondaryLabel="Vibrate on step change"
              iconName="ios-ellipse"
              iconBackgroundColor="aquamarine"
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
            />
          </SettingsUI.Section>
          <SettingsUI.Section label="Timer" hideBottomBorderAndroid>
            <SettingsUI.StepperItem
              label="Exercise timer"
              secondaryLabel="Time limit in minutes"
              value={timeLimit > 0 ? timeLimit / ms("1 min") : "∞"}
              iconName="ios-timer"
              iconBackgroundColor="#fb7185"
              onIncrease={increaseTimeLimit}
              onDecrease={decreaseTimeLimit}
              decreaseDisabled={timeLimit <= 0}
              increaseDisabled={timeLimit >= maxTimeLimit}
            />
          </SettingsUI.Section>
        </ScrollView>
      </Animated.View>
    </>
  );
};

export const SettingsPatternPickerScreen: FC<
  NativeStackScreenProps<SettingsStackParamList, "SettingsPatternPicker">
> = () => {
  const {
    customPatternEnabled,
    setCustomPatternEnabled,
    customPatternSteps: customPatternDurations,
    setCustomPatternStep: setCustomPatternDurationsStep,
    selectedPatternPresetId,
    setSelectedPatternPresetId,
  } = useSettingsStore();
  return (
    <>
      <Animated.View className="h-full w-full">
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingHorizontal: Platform.OS === "android" ? undefined : 18,
          }}
        >
          <SettingsUI.Section label="Custom pattern">
            <SettingsUI.SwitchItem
              label="Custom breathing pattern"
              iconName="ios-person"
              iconBackgroundColor="#60a5fa"
              value={customPatternEnabled}
              onValueChange={(newValue) => {
                LayoutAnimation.easeInEaseOut();
                setCustomPatternEnabled(newValue);
              }}
            />
            {customPatternEnabled &&
              customPatternDurations.map((stepValue, stepIndex) => {
                const [lowerLimit, upperLimit] = customDurationLimits[stepIndex];
                const stepLabel = ["Inhale", "Hold", "Exhale", "Hold"][stepIndex];
                return (
                  <SettingsUI.StepperItem
                    key={stepIndex}
                    label={stepLabel}
                    value={stepValue / ms("1 sec")}
                    secondaryLabel={"Time in seconds"}
                    decreaseDisabled={stepValue <= lowerLimit}
                    increaseDisabled={stepValue >= upperLimit}
                    onIncrease={() =>
                      setCustomPatternDurationsStep(stepIndex, stepValue + ms("1 sec"))
                    }
                    onDecrease={() =>
                      setCustomPatternDurationsStep(stepIndex, stepValue + -ms("1 sec"))
                    }
                  />
                );
              })}
          </SettingsUI.Section>
          <SettingsUI.Section label="Pattern presets" hideBottomBorderAndroid>
            {patternPresets.map((patternPreset) => {
              return (
                <SettingsUI.RadioButtonItem
                  key={patternPreset.id}
                  disabled={customPatternEnabled}
                  selected={!customPatternEnabled && selectedPatternPresetId === patternPreset.id}
                  onPress={() => setSelectedPatternPresetId(patternPreset.id)}
                  label={`${patternPreset.name} (${patternPreset.steps
                    .map((duration) => duration / ms("1 sec"))
                    .join("-")})`}
                  secondaryLabel={patternPreset.description}
                />
              );
            })}
          </SettingsUI.Section>
        </ScrollView>
      </Animated.View>
    </>
  );
};
