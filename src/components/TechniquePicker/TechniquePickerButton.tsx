import React, { FC } from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { images } from "../../config/images";

interface Props {
  disabled: boolean;
  onPress: () => void;
  direction: "prev" | "next";
}

export const TechniquePickerButton: FC<Props> = ({
  disabled,
  onPress,
  direction,
}) => {
  const { theme } = useAppContext();
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={styles.container}
      hitSlop={{
        top: 4,
        bottom: 4,
        left: 4,
        right: 4,
      }}
    >
      <Image
        source={images.iconLeftArrow}
        style={[
          styles.image,
          {
            tintColor: theme.textColorLighter,
            transform: [{ rotate: direction === "prev" ? "0deg" : "180deg" }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {},
  image: {
    width: 20,
    height: 20,
  },
});
