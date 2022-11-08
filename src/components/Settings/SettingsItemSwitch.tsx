import React, { FC } from "react";
import { Animated, StyleSheet, Switch, Text, Platform } from "react-native";
import { fontLight } from "../../config/fonts";
import { useAppContext } from "../../context/AppContext";

interface Props {
  label: string;
  color: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const SettingsItemSwitch: FC<Props> = ({ label, color, value, onValueChange }) => {
  const { theme } = useAppContext();
  return (
    <Animated.View style={styles.container}>
      <Text style={[styles.label, { color: theme.textColor }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "undefined", true: color }}
        thumbColor={Platform.OS === "android" && value ? color : undefined}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    ...fontLight,
  },
});
