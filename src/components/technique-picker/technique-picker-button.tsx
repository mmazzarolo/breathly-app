import React, { FC } from "react";
import { StyleSheet, Image } from "react-native";
import { images } from "../../assets/images";
import { Touchable, TouchableProps } from "../../common/touchable";
import { useAppContext } from "../../context/app-context";

interface Props extends TouchableProps {
  disabled: boolean;
  onPress: () => void;
  direction: "prev" | "next";
}

export const TechniquePickerButton: FC<Props> = ({
  disabled,
  onPress,
  direction,
  ...otherProps
}) => {
  const { theme } = useAppContext();
  return (
    <Touchable disabled={disabled} onPress={onPress} style={styles.container} {...otherProps}>
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
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {},
  image: {
    width: 20,
    height: 20,
  },
});
