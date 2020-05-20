import React, { FC } from "react";
import { Animated, StyleSheet, Text, Image } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { fontLight } from "../../config/fonts";
import { Touchable } from "../../common/Touchable";
import { images } from "../../config/images";

interface Props {
  index: number;
  label: string;
  color: string;
  selected: boolean;
  onPress: (value: any) => void;
}

export const SettingsItemRadio: FC<Props> = ({
  index,
  label,
  color,
  selected,
  onPress,
}) => {
  const { theme } = useAppContext();
  return (
    <Touchable
      accessible
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <Animated.View
        style={[styles.container, { marginTop: index === 0 ? 8 : 18 }]}
      >
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
          <Image
            style={[styles.checkmark, { tintColor: color }]}
            source={images.iconCheck}
          />
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
