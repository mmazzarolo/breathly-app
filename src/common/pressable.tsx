import * as Haptics from "expo-haptics";
import React, { FC } from "react";
import {
  GestureResponderEvent,
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

export type PressableProps = TouchableOpacityProps;

export const Pressable: FC<PressableProps> = ({ children, onPress, ...otherProps }) => {
  // Increase the hitslop a bit for accessibility purposes.
  const hitSlop = {
    top: 4,
    bottom: 4,
    left: 4,
    right: 4,
  };
  // On iOS, I feel most "touch" events in the app work better with a light haptic feedback.
  const handlePress = (event: GestureResponderEvent) => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  return (
    <TouchableOpacity hitSlop={hitSlop} onPress={handlePress} {...otherProps}>
      {children}
    </TouchableOpacity>
  );
};
