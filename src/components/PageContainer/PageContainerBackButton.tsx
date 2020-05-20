import React, { FC } from "react";
import { Image, StyleSheet, Text } from "react-native";
import { images } from "../../config/images";
import { useAppContext } from "../../context/AppContext";
import { Touchable } from "../../common/Touchable";

interface Props {
  onPress: () => void;
}

export const PageContainerBackButton: FC<Props> = ({ onPress }) => {
  const { theme } = useAppContext();
  return (
    <Touchable onPress={onPress} style={styles.touchable} testID="back-button">
      <Image
        source={images.iconLeftArrow}
        style={[styles.image, { tintColor: theme.textColorLighter }]}
      />
      <Text style={[styles.label, { color: theme.textColor }]}>Back</Text>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    textAlign: "center",
    marginHorizontal: 6,
  },
  image: {
    width: 22,
    height: 22,
    zIndex: 2,
  },
});
