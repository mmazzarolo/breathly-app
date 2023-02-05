import { Animated, ScaleTransform, TranslateYTransform } from "react-native";

export const interpolateScale = (
  value: Animated.Value,
  config: Animated.InterpolationConfigType
): Animated.WithAnimatedObject<ScaleTransform> => {
  return {
    scale: value.interpolate({
      inputRange: [0, 1],
      ...config,
    }),
  };
};

export const interpolateTranslateY = (
  value: Animated.Value,
  config: Animated.InterpolationConfigType
): Animated.WithAnimatedObject<TranslateYTransform> => {
  return {
    translateY: value.interpolate({
      inputRange: [0, 1],
      ...config,
    }),
  };
};
