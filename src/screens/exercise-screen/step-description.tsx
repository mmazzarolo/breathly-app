import React, { FC } from "react";
import { Animated } from "react-native";
import { interpolateTranslateY } from "@breathly/utils/interpolate";

interface Props {
  label: string;
  animationValue: Animated.Value;
}

export const StepDescription: FC<Props> = ({ label, animationValue }) => {
  const textAnimatedStyle = {
    opacity: animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateTranslateY(animationValue, {
        inputRange: [0, 1],
        outputRange: [0, -8],
      }),
    ],
  };

  return (
    <Animated.Text
      className="mb-4 text-center font-breathly-medium text-2xl text-slate-800 dark:text-white"
      style={textAnimatedStyle}
    >
      {label}
    </Animated.Text>
  );
};
