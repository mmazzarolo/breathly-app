import React, { FC, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useOnMount } from "../../hooks/useOnMount";
import { animate } from "../../utils/animate";
import { interpolateTranslateY } from "../../utils/interpolate";
import { fontThin } from "../../config/fonts";

type Props = {};

const mountAnimDuration = 400;
const unmountAnimDuration = 400;

export const ExerciseComplete: FC<Props> = () => {
  const [mountAnimVal] = useState(new Animated.Value(0));

  const mountAnimation = animate(mountAnimVal, {
    toValue: 1,
    duration: mountAnimDuration
  });

  const unmountAnimation = animate(mountAnimVal, {
    toValue: 0,
    duration: unmountAnimDuration
  });

  useOnMount(() => {
    mountAnimation.start();
    return () => {
      mountAnimation.stop();
      unmountAnimation.stop();
    };
  });

  const containerAnimatedStyle = {
    opacity: mountAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    }),
    transform: [
      interpolateTranslateY(mountAnimVal, {
        inputRange: [0, 1],
        outputRange: [0, 8]
      })
    ]
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Text style={styles.title}>Complete</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 50,
    textAlign: "center",
    color: "white",
    ...fontThin
  }
});
