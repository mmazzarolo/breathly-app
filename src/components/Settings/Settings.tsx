import React, { FC } from "react";
import { StyleSheet, LayoutAnimation, ScrollView } from "react-native";
import { useAppContext } from "../../context/app-context";
import { GuidedBreathingMode } from "../../types/guided-breathing-mode";
import { PageContainer } from "../page-container/page-container";
import { SettingsItemMinutesInput } from "./settings-item-minutes-input";
import { SettingsItemRadio } from "./settings-item-radio";
import { SettingsItemSwitch } from "./settings-item-switch";
import { SettingsSection } from "./settings-section";

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
    toggleTimer,
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
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                toggleFollowSystemDarkMode();
              }}
            />
          )}
          {(systemColorScheme === "no-preference" || !followSystemDarkModeFlag) && (
            <SettingsItemSwitch
              label="Use dark mode"
              color={theme.mainColor}
              value={customDarkModeFlag}
              onValueChange={toggleCustomDarkMode}
            />
          )}
        </SettingsSection>
        <SettingsSection label={"Timer"}>
          <SettingsItemSwitch
            label="Enable excercise timer"
            color={theme.mainColor}
            value={!!timerDuration}
            onValueChange={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              toggleTimer();
            }}
          />
          {!!timerDuration && (
            <SettingsItemMinutesInput
              label="Timer duration (minutes)"
              color={theme.mainColor}
              value={timerDuration}
              onValueChange={(value) => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setTimerDuration(value);
              }}
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
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 36,
    marginVertical: 12,
  },
});
