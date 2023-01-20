import React, { FC } from "react";
import { Animated, StyleSheet, Text, Image } from "react-native";
import { images } from "../../assets/images";
import { Touchable } from "../../common/touchable";
import { fontLight } from "../../config/fonts";
import { useAppContext } from "../../context/app-context";

interface Props {
  index: number;
  label: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}

export const SettingsItemRadio: FC<Props> = ({ index, label, color, selected, onPress }) => {
  const { theme } = useAppContext();
  return (
    <Touchable onPress={onPress}>
      <Animated.View style={[styles.container, { marginTop: index === 0 ? 8 : 18 }]}>
        <Text
          style={[
            styles.label,
            {
              color: theme.textColor,
              textDecorationLine: selected ? "underline" : undefined,
            },
          ]}
        >
          {label}
        </Text>
        {selected ? (
          <Image style={[styles.checkmark, { tintColor: color }]} source={images.iconCheck} />
        ) : undefined}
      </Animated.View>
    </Touchable>
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
  checkmark: {
    width: 22,
    height: 22,
  },
});
