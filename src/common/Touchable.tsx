import React, { FC } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

export type TouchableProps = TouchableOpacityProps;

export const Touchable: FC<TouchableProps> = ({ children, ...otherProps }) => {
  const hitSlop = {
    top: 4,
    bottom: 4,
    left: 4,
    right: 4,
  };
  return (
    <TouchableOpacity hitSlop={hitSlop} {...otherProps}>
      {children}
    </TouchableOpacity>
  );
};
