import * as Haptics from "expo-haptics";
import React, { FC } from "react";
import {
  GestureResponderEvent,
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

export type TouchableProps = TouchableOpacityProps;

export const Touchable: FC<TouchableProps> = ({ children, onPress, ...otherProps }) => {
  const hitSlop = {
    top: 4,
    bottom: 4,
    left: 4,
    right: 4,
  };
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
