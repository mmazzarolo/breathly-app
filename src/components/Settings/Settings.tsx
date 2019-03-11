import React, { FC } from "react";
import { Animated, StyleSheet } from "react-native";
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
    darkModeFlag,
    timerDuration,
    setTimerDuration,
    toggleDarkMode
  } = useAppContext();

  return (
    <PageContainer
      title="Settings"
      visible={visible}
      onBackButtonPress={onBackButtonPress}
      onHide={onHide}
    >
      <Animated.View style={styles.content}>
        <SettingsSection label={"Theme"}>
          <SettingsItemSwitch
            label="Dark mode"
            color={theme.mainColor}
            value={darkModeFlag}
            onValueChange={toggleDarkMode}
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
    marginVertical: 12
  }
});
