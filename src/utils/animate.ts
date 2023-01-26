import { Animated, Easing } from "react-native";

// Reduces the boilerplate for the most common animation config
export const animate = (value: Animated.Value, config: Partial<Animated.TimingAnimationConfig>) => {
  return Animated.timing(value, {
    toValue: config.toValue!,
    ...config,
    useNativeDriver: true,
    easing: Easing.inOut(Easing.quad),
  });
};
