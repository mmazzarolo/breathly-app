import React, { FC, useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { animate } from "@breathly/utils/animate";
import { interpolateTranslateY } from "@breathly/utils/interpolate";

const mountAnimDuration = 400;
const displayTitleTextStyle = {
  includeFontPadding: true,
  lineHeight: 80,
  paddingBottom: 8,
  textAlignVertical: "center" as const,
};

export const ExerciseComplete: FC = () => {
  const mountAnimVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mountAnimation = animate(mountAnimVal, {
      toValue: 1,
      duration: mountAnimDuration,
    });
    mountAnimation.start();
    return () => mountAnimation.stop();
  }, [mountAnimVal]);

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
    <Animated.View
      className="flex-1 items-center justify-center"
      style={containerAnimatedStyle}
      testID="exercise.complete"
    >
      <Text
        className="text-center font-breathly-serif-medium text-5xl text-slate-800 dark:text-white"
        style={displayTitleTextStyle}
      >
        Complete
      </Text>
    </Animated.View>
  );
};
