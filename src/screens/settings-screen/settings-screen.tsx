import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ms from "ms";
import React, { FC } from "react";
import { Animated, ScrollView, LayoutAnimation, Button, Platform, StyleSheet } from "react-native";
import { patternPresets } from "@breathly/assets/pattern-presets";
import { SettingsStackParamList } from "@breathly/core/navigator";
import { useColorScheme } from "@breathly/design/theme";
import { SettingsUI } from "@breathly/screens/settings-screen/settings-ui";
import {
  useSelectedPatternSteps,
  useSelectedPatternName,
  useSettingsStore,
} from "@breathly/stores/settings";
import {
  customPatternDurationLimits,
  customPatternStepSizeMs,
  maximumPreparationTimeMs,
  maximumTimeLimitMs,
  minimumPreparationTimeMs,
  type Theme,
} from "@breathly/stores/settings-state";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";

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
  const preparationTime = useSettingsStore((state) => state.preparationTime);
  const increasePreparationTime = useSettingsStore((state) => state.increasePreparationTime);
  const decreasePreparationTime = useSettingsStore((state) => state.decreasePreparationTime);
  const shouldFollowSystemDarkMode = useSettingsStore((state) => state.shouldFollowSystemDarkMode);
  const setShouldFollowSystemDarkMode = useSettingsStore(
    (state) => state.setShouldFollowSystemDarkMode,
  );
  const theme = useSettingsStore((state) => state.theme);
  const resolvedColorScheme = useColorScheme();
  const setTheme = useSettingsStore((state) => state.setTheme);
  const vibrationEnabled = useSettingsStore((state) => state.vibrationEnabled);
  const setVibrationEnabled = useSettingsStore((state) => state.setVibrationEnabled);

  React.useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    if (Platform.OS === "ios") {
      navigation.setOptions({
        headerRight: () => (
          <Button onPress={navigation.goBack} title="Done" testID="settings.done" />
        ),
      });
    }
  }, [navigation]);

  return (
    <>
      <Animated.View style={styles.screen}>
        <SettingsUI.Header title="Customizations" onBack={navigation.goBack} />
        <ScrollView
          testID="settings.screen"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingHorizontal: Platform.OS === "android" ? undefined : 18,
          }}
        >
          <SettingsUI.Section label="Breathing pattern">
            <SettingsUI.LinkItem
              label="Pattern"
              iconName="body"
              iconBackgroundColor="#bfdbfe"
              value={`${selectedPatternName} (${selectedPatternDurations
                .map((duration) => duration / ms("1 sec"))
                .join("-")})`}
              onPress={() => navigation.navigate("SettingsPatternPicker")}
              testID="settings.pattern"
            />
          </SettingsUI.Section>
          <SettingsUI.Section label="Guided breathing">
            <SettingsUI.PickerItem
              label="Voice"
              iconName="volume-medium"
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
              onValueChange={(value) => setGuidedBreathingVoice(value as GuidedBreathingMode)}
              testID="settings.voice"
            />
          </SettingsUI.Section>
          <SettingsUI.Section label="Appearance">
            <SettingsUI.SwitchItem
              label="Use system theme"
              secondaryLabel="Follow system light/dark mode"
              iconName="moon"
              iconBackgroundColor="#a5b4fc"
              value={shouldFollowSystemDarkMode}
              onValueChange={(shouldFollow) => {
                // Turning this off must keep the appearance the user is looking at. The
                // stored theme defaults to "light", so a user on a dark phone who switched
                // this off to *keep* dark was flipped to light in front of them.
                if (!shouldFollow) setTheme(resolvedColorScheme);
                setShouldFollowSystemDarkMode(shouldFollow);
              }}
              testID="settings.system-theme"
            />
            {!shouldFollowSystemDarkMode && (
              <SettingsUI.PickerItem
                label="Theme"
                iconName="color-palette"
                iconBackgroundColor="#d8b4fe"
                options={[
                  { value: "light", label: "Light theme" },
                  { value: "dark", label: "Dark theme" },
                ]}
                value={theme}
                onValueChange={(value) => setTheme(value as Theme)}
                testID="settings.theme"
              />
            )}
          </SettingsUI.Section>
          <SettingsUI.Section label="Haptics">
            <SettingsUI.SwitchItem
              label="Vibration"
              secondaryLabel="Vibrate on step change"
              iconName="ellipse"
              iconBackgroundColor="aquamarine"
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              testID="settings.vibration"
            />
          </SettingsUI.Section>
          <SettingsUI.Section label="Timer" hideBottomBorderWeb>
            <SettingsUI.StepperItem
              label="Preparation time"
              secondaryLabel="Time before the exercise starts, in seconds"
              value={preparationTime / ms("1 sec")}
              iconName="hourglass"
              iconBackgroundColor="#fdba74"
              onIncrease={increasePreparationTime}
              onDecrease={decreasePreparationTime}
              decreaseDisabled={preparationTime <= minimumPreparationTimeMs}
              increaseDisabled={preparationTime >= maximumPreparationTimeMs}
              testID="settings.preparation-time"
            />
            <SettingsUI.StepperItem
              label="Exercise timer"
              secondaryLabel="Time limit in minutes"
              value={timeLimit > 0 ? timeLimit / ms("1 min") : "∞"}
              iconName="timer"
              iconBackgroundColor="#fb7185"
              onIncrease={increaseTimeLimit}
              onDecrease={decreaseTimeLimit}
              decreaseDisabled={timeLimit <= 0}
              increaseDisabled={timeLimit >= maximumTimeLimitMs}
              testID="settings.timer"
            />
          </SettingsUI.Section>
        </ScrollView>
      </Animated.View>
    </>
  );
};

export const SettingsPatternPickerScreen: FC<
  NativeStackScreenProps<SettingsStackParamList, "SettingsPatternPicker">
> = ({ navigation }) => {
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
      <Animated.View style={styles.screen}>
        <SettingsUI.Header title="Breathing Patterns" onBack={navigation.goBack} />
        <ScrollView
          testID="settings.patterns.screen"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingHorizontal: Platform.OS === "android" ? undefined : 18,
          }}
        >
          <SettingsUI.Section label="Custom pattern">
            <SettingsUI.SwitchItem
              label="Custom breathing pattern"
              iconName="person"
              iconBackgroundColor="#60a5fa"
              value={customPatternEnabled}
              onValueChange={(newValue: boolean) => {
                LayoutAnimation.easeInEaseOut();
                setCustomPatternEnabled(newValue);
              }}
              testID="settings.custom-pattern"
            />
            {customPatternEnabled &&
              customPatternDurations.map((stepValue, stepIndex) => {
                const limits = customPatternDurationLimits[stepIndex];
                if (!limits) return null;

                const [lowerLimit, upperLimit] = limits;
                const stepLabel = ["Inhale", "Hold after inhale", "Exhale", "Hold after exhale"][
                  stepIndex
                ];
                return (
                  <SettingsUI.StepperItem
                    key={stepIndex}
                    label={stepLabel}
                    value={stepValue / ms("1 sec")}
                    fractionDigits={1}
                    secondaryLabel={"Time in seconds"}
                    decreaseDisabled={stepValue <= lowerLimit}
                    increaseDisabled={stepValue >= upperLimit}
                    onIncrease={() =>
                      setCustomPatternDurationsStep(stepIndex, stepValue + customPatternStepSizeMs)
                    }
                    onDecrease={() =>
                      setCustomPatternDurationsStep(stepIndex, stepValue - customPatternStepSizeMs)
                    }
                    testID={`settings.custom-pattern.step.${stepIndex}`}
                  />
                );
              })}
          </SettingsUI.Section>
          <SettingsUI.Section label="Pattern presets" hideBottomBorderWeb>
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
                  testID={`settings.pattern.${patternPreset.id}`}
                />
              );
            })}
          </SettingsUI.Section>
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    height: "100%",
    width: "100%",
  },
});
