import React, { FC } from "react";
import { Animated, SegmentedControlIOS, StyleSheet, Text } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { fontLight } from "../../config/fonts";

interface Props {
  label: string;
  items: { value: number; label: string }[];
  value: number;
  color?: string;
  onValueChange: (newValue: number) => void;
}

export const SettingsItemPickerIOS: FC<Props> = ({
  label,
  items,
  value,
  color,
  onValueChange
}) => {
  const { theme } = useAppContext();
  const valueIndex = items.findIndex(x => x.value === value);
  const handleValueChange = (selectedLabel: string) => {
    const selectedItem = items.find(x => x.label === selectedLabel)!;
    onValueChange(selectedItem.value);
  };
  return (
    <Animated.View style={styles.container}>
      <Text style={[styles.label, { color: theme.textColor }]}>{label}</Text>
      <SegmentedControlIOS
        values={items.map(x => x.label)}
        selectedIndex={valueIndex}
        tintColor={color}
        onValueChange={handleValueChange}
        style={styles.picker}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12
  },
  label: {
    fontSize: 20,
    ...fontLight
  },
  picker: {
    marginTop: 8
  }
});
