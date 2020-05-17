import React, { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { fontMono, fontLight } from "../../config/fonts";
import { Stepper } from "./Stepper";
import { customDurationLimits } from "../../config/customDurationLimits";

interface Props {
  durations: number[];
}

export const TechniquePickerItemCustomization: FC<Props> = ({ durations }) => {
  const { theme, updateCustomPatternDuration } = useAppContext();
  const steps = [
    { id: "inhale", label: "Inhale", value: durations[0] },
    { id: "afterInhale", label: "Hold", value: durations[1] },
    { id: "exhale", label: "Exhale", value: durations[2] },
    { id: "afterExhale", label: "Hold", value: durations[3] },
  ];
  return (
    <View style={styles.container}>
      {steps.map(({ id, label, value }, index) => (
        <View key={id} style={styles.item}>
          <View style={styles.left}>
            <Text style={[styles.title, { color: theme.textColor }]}>
              {label}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textColor }]}>
              {value} seconds
            </Text>
          </View>
          <Stepper
            onPress={(update: number) =>
              updateCustomPatternDuration(index, update)
            }
            leftDisabled={value <= customDurationLimits[index][0]}
            rightDisabled={value >= customDurationLimits[index][1]}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginTop: 42,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  left: {},
  title: {
    fontSize: 22,
    ...fontLight,
  },
  subtitle: {
    fontSize: 20,
    ...fontMono,
  },
});
