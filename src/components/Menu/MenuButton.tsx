import React, { FC } from "react";
import { Image, ImageSourcePropType, StyleSheet, Text } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { Touchable, TouchableProps } from "../../common/Touchable";

interface Props extends TouchableProps {
  imageSource: ImageSourcePropType;
  label: string;
  onPress: () => void;
}

export const MenuButton: FC<Props> = ({
  imageSource,
  onPress,
  label,
  ...otherPops
}) => {
  const { theme } = useAppContext();
  return (
    <Touchable onPress={onPress} style={styles.touchable} {...otherPops}>
      <Text style={[styles.label, { color: theme.textColor }]}>{label}</Text>
      <Image
        source={imageSource}
        style={[styles.image, { tintColor: theme.textColorLighter }]}
      />
    </Touchable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    zIndex: 2,
  },
  label: {
    fontSize: 13,
    textAlign: "center",
    marginRight: 6,
  },
  image: {
    width: 26,
    height: 26,
  },
});
