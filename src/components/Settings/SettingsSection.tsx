import React, { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/AppContext";

interface Props {
  label: string;
}

export const SettingsSection: FC<Props> = ({ label, children }) => {
  const { theme } = useAppContext();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textColor }]}>
        {label.toUpperCase()}
      </Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 26
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12
  }
});
