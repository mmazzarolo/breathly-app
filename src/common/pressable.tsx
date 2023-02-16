import * as Haptics from "expo-haptics";
import React, { FC, useState } from "react";
import {
  GestureResponderEvent,
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useInterval } from "@breathly/utils/use-interval";

interface PressableProps extends TouchableOpacityProps {
  onLongPressInterval?: () => unknown;
  longPressIntervalDelay?: number;
}

export const Pressable: FC<PressableProps> = ({
  children,
  onLongPressInterval,
  longPressIntervalDelay = 200,
  ...otherProps
}) => {
  const [currentlyLongPressed, setCurrentlyLongPressed] = useState(false);
  // Increase the hitslop a bit for accessibility purposes.
  const hitSlop = {
    top: 4,
    bottom: 4,
    left: 4,
    right: 4,
  };
  // On iOS, I feel most "touch" events in the app work better with a light haptic feedback.
  const handlePressIn = (event: GestureResponderEvent) => {
    if (Platform.OS === "ios" && !otherProps.disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    otherProps.onPressIn?.(event);
  };
  // Invoke a callback every n ms while the button is being long pressed
  useInterval(
    () => {
      if (otherProps.disabled) return;
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onLongPressInterval?.();
    },
    currentlyLongPressed && onLongPressInterval && !otherProps.disabled
      ? longPressIntervalDelay
      : null
  );
  const handleLongPress = (event: GestureResponderEvent) => {
    otherProps.onLongPress?.(event);
    setCurrentlyLongPressed(true);
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    otherProps.onPressOut?.(event);
    setCurrentlyLongPressed(false);
  };

  return (
    <TouchableOpacity
      hitSlop={hitSlop}
      onPressIn={handlePressIn}
      {...otherProps}
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
    >
      {children}
    </TouchableOpacity>
  );
};
