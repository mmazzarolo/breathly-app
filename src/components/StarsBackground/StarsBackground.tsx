import React, { FC, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { images } from "../../assets/images";
import { deviceHeight, deviceWidth } from "../../config/constants";
import { useOnMount } from "../../hooks/useOnMount";
import { useOnUpdate } from "../../hooks/useOnUpdate";
import { animate } from "../../utils/animate";
import { interpolateTranslateY } from "../../utils/interpolate";

interface Props {
  expanded: boolean;
  animationDuration: number;
}

const translateY = 100;

export const StarsBackground: FC<Props> = ({ expanded, animationDuration }) => {
  const [translateAnimVal] = useState(new Animated.Value(0));

  const translateUpAnimation = animate(translateAnimVal, {
    toValue: 1,
    duration: animationDuration,
  });
  const translateDownAnimation = animate(translateAnimVal, {
    toValue: 0,
    duration: animationDuration,
  });

  useOnMount(() => {
    return () => {
      translateUpAnimation.stop();
      translateDownAnimation.stop();
    };
  });

  useOnUpdate((prevExpanded) => {
    if (!prevExpanded && expanded) {
      translateUpAnimation.start();
    } else if (prevExpanded && !expanded) {
      translateDownAnimation.start();
    }
  }, expanded);

  const backgroundImageAnimatedStyle = {
    transform: [
      interpolateTranslateY(translateAnimVal, {
        inputRange: [0, 1],
        outputRange: [0, -translateY],
      }),
    ],
  };

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.Image
        source={images.starsBackground}
        resizeMode="cover"
        style={[styles.backgroundImage, backgroundImageAnimatedStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: deviceWidth,
    height: deviceHeight + 60,
  },
  backgroundImage: {
    height: "100%",
    width: "100%",
  },
});
