import React, { FC, useState } from "react";
import { Animated, Platform, StyleSheet, Text, TextInput } from "react-native";
import { fontLight } from "../../config/fonts";
import { useAppContext } from "../../context/AppContext";

interface Props {
  label: string;
  value: number;
  color?: string;
  onValueChange: (newValue: number) => void;
}

export const SettingsItemMinutesInput: FC<Props> = ({ label, value, color, onValueChange }) => {
  const [inputValue, setInputValue] = useState((value / 1000 / 60).toString());
  const { theme } = useAppContext();
  const onDone = () => {
    onValueChange(Number(inputValue || 0) * 1000 * 60);
  };
  return (
    <Animated.View style={styles.container}>
      <Text style={[styles.label, { color: theme.textColor }]}>{label}</Text>
      <TextInput
        value={inputValue}
        onChangeText={(text) => {
          setInputValue(text.replace(/[^0-9]/g, ""));
        }}
        style={[styles.input, { color: theme.textColor, borderBottomColor: theme.textColor }]}
        autoComplete="off"
        onFocus={() => setInputValue("")}
        clearTextOnFocus={true}
        keyboardType="numeric"
        maxLength={3}
        selectionColor={theme.mainColor}
        textContentType="none"
        underlineColorAndroid={theme.textColorLighter}
        blurOnSubmit={true}
        onSubmitEditing={onDone}
        onBlur={onDone}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 8 : 0,
  },
  label: {
    fontSize: 18,
    ...fontLight,
  },
  input: {
    fontSize: 18,
    ...fontLight,
    textAlign: "right",
    borderBottomWidth: Platform.OS === "ios" ? StyleSheet.hairlineWidth : 0,
    minWidth: 30,
  },
});
