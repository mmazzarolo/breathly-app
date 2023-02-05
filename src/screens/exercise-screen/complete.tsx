import React, { FC, useEffect, useState } from "react";
import { Animated, Text } from "react-native";
import { animate } from "@breathly/utils/animate";
import { interpolateTranslateY } from "@breathly/utils/interpolate";

const mountAnimDuration = 400;
const unmountAnimDuration = 400;

export const ExerciseComplete: FC = () => {
  const [mountAnimVal] = useState(new Animated.Value(0));

  const mountAnimation = animate(mountAnimVal, {
    toValue: 1,
    duration: mountAnimDuration,
  });

  const unmountAnimation = animate(mountAnimVal, {
    toValue: 0,
    duration: unmountAnimDuration,
  });

  useEffect(() => {
    mountAnimation.start();
    return () => {
      mountAnimation.stop();
      unmountAnimation.stop();
    };
  }, []);

  const containerAnimatedStyle = {
    opacity: mountAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateTranslateY(mountAnimVal, {
        inputRange: [0, 1],
        outputRange: [0, 8],
      }),
    ],
  };

  return (
    <Animated.View className="flex-1 items-center justify-center" style={containerAnimatedStyle}>
      <Text className="text-center font-breathly-serif-medium text-5xl text-slate-800 dark:text-white">
        Complete
      </Text>
    </Animated.View>
  );
};
