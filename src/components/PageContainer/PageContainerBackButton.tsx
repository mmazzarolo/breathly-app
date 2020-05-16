import React, { FC } from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { images } from "../../config/images";
import { useAppContext } from "../../context/AppContext";

interface Props {
  onPress: () => void;
}

export const PageContainerBackButton: FC<Props> = ({ onPress }) => {
  const { theme } = useAppContext();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.touchable}
      hitSlop={{
        top: 4,
        bottom: 4,
        left: 4,
        right: 4,
      }}
    >
      <Image
        source={images.iconLeftArrow}
        style={[styles.image, { tintColor: theme.textColorLighter }]}
      />
      <Text style={[styles.label, { color: theme.textColor }]}>Back</Text>
    </TouchableOpacity>
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
