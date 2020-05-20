import React, { FC } from "react";
import {
  Animated,
  StyleSheet,
  LayoutAnimation,
  ScrollView,
} from "react-native";
import { timerLimits } from "../../config/timerLimits";
import { useAppContext } from "../../context/AppContext";
import { PageContainer } from "../PageContainer/PageContainer";
import { SettingsItemPicker } from "./SettingsItemPicker";
import { SettingsItemSwitch } from "./SettingsItemSwitch";
import { SettingsSection } from "./SettingsSection";
import { SettingsItemRadio } from "./SettingsItemRadio";
import { GuidedBreathingMode } from "../../types/GuidedBreathingMode";

interface Props {
  visible: boolean;
  onHide: () => void;
  onBackButtonPress: () => void;
}

export const Settings: FC<Props> = ({ visible, onHide, onBackButtonPress }) => {
  const {
    theme,
    systemColorScheme,
    customDarkModeFlag,
    guidedBreathingMode,
    timerDuration,
    setTimerDuration,
    stepVibrationFlag,
    followSystemDarkModeFlag,
    toggleCustomDarkMode,
    toggleFollowSystemDarkMode,
    setGuidedBreathingMode,
    toggleStepVibration,
  } = useAppContext();

  const guidedBreathingItems: {
    value: GuidedBreathingMode;
    label: string;
  }[] = [
    { value: "disabled", label: "Disabled" },
    { value: "laura", label: "Laura's voice" },
    { value: "paul", label: "Paul's voice" },
    { value: "bell", label: "Bell cue" },
  ];

  return (
    <PageContainer
      title="Settings"
      visible={visible}
      onBackButtonPress={onBackButtonPress}
      onHide={onHide}
    >
      <ScrollView style={styles.content}>
        <SettingsSection label={"Dark mode"}>
          {systemColorScheme !== "no-preference" && (
            <SettingsItemSwitch
              label="Follow system settings"
              color={theme.mainColor}
              value={followSystemDarkModeFlag}
              onValueChange={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                toggleFollowSystemDarkMode();
              }}
            />
          )}
          {(systemColorScheme === "no-preference" ||
            !followSystemDarkModeFlag) && (
            <SettingsItemSwitch
              label="Use dark mode"
              color={theme.mainColor}
              value={customDarkModeFlag}
              onValueChange={toggleCustomDarkMode}
            />
          )}
        </SettingsSection>
        <SettingsSection label={"Vibration"}>
          <SettingsItemSwitch
            label="Vibrate on step change"
            color={theme.mainColor}
            value={stepVibrationFlag}
            onValueChange={toggleStepVibration}
          />
        </SettingsSection>
        <SettingsSection label={"Guided Breathing"}>
          {guidedBreathingItems.map(({ label, value }, index) => (
            <SettingsItemRadio
              key={value}
              index={index}
              label={label}
              color={theme.mainColor}
              selected={value === guidedBreathingMode}
              onPress={() => setGuidedBreathingMode(value)}
            />
          ))}
        </SettingsSection>
        <SettingsSection label={"Timer"}>
          <SettingsItemPicker
            label="Timer duration"
            color={theme.mainColor}
            items={timerLimits}
            value={timerDuration}
            onValueChange={setTimerDuration}
          />
        </SettingsSection>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginHorizontal: 36,
    marginVertical: 12,
  },
});
