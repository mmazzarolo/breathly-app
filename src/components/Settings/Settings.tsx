import React, { FC } from "react";
import { Animated, StyleSheet, LayoutAnimation } from "react-native";
import { timerLimits } from "../../config/timerLimits";
import { useAppContext } from "../../context/AppContext";
import { PageContainer } from "../PageContainer/PageContainer";
import { SettingsItemPicker } from "./SettingsItemPicker";
import { SettingsItemSwitch } from "./SettingsItemSwitch";
import { SettingsSection } from "./SettingsSection";

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
    guidedBreathingFlag,
    timerDuration,
    setTimerDuration,
    stepVibrationFlag,
    followSystemDarkModeFlag,
    toggleCustomDarkMode,
    toggleFollowSystemDarkMode,
    toggleGuidedBreathing,
    toggleStepVibration,
  } = useAppContext();

  return (
    <PageContainer
      title="Settings"
      visible={visible}
      onBackButtonPress={onBackButtonPress}
      onHide={onHide}
    >
      <Animated.View style={styles.content}>
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
        <SettingsSection label={"Audio"}>
          <SettingsItemSwitch
            label="Guided breathing"
            color={theme.mainColor}
            value={guidedBreathingFlag}
            onValueChange={toggleGuidedBreathing}
          />
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
      </Animated.View>
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
