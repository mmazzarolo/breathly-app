import { Animated, Easing } from "react-native";

// Reduces the boilerplate for the most used animation config
export const animate = (
  value: Animated.Value,
  config: Animated.TimingAnimationConfig
) => {
  return Animated.timing(value, {
    ...config,
    useNativeDriver: true,
    easing: Easing.inOut(Easing.quad)
  });
};
