import { Animated } from "react-native";

export const interpolate = (
  field: "scale" | "translateY",
  value: Animated.Value,
  config: Animated.InterpolationConfigType
) => {
  return {
    [field]: value.interpolate({
      inputRange: [0, 1],
      ...config
    })
  };
};

export const interpolateScale = (
  value: Animated.Value,
  config: Animated.InterpolationConfigType
) => {
  return interpolate("scale", value, config);
};

export const interpolateTranslateY = (
  value: Animated.Value,
  config: Animated.InterpolationConfigType
) => {
  return interpolate("translateY", value, config);
};
