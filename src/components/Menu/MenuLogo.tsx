import React, { FC } from "react";
import { Animated, StyleSheet } from "react-native";
import { deviceHeight, deviceWidth } from "../../config/constants";
import { images } from "../../config/images";

interface Props {
  color: string;
}

export const MenuLogo: FC<Props> = ({ color }) => {
  return (
    <Animated.View style={styles.container}>
      <Animated.Image
        source={images.logo}
        style={[styles.logoImage, { tintColor: color }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: deviceWidth,
    height: deviceWidth,
    maxWidth: deviceHeight * 0.6,
  },
});
