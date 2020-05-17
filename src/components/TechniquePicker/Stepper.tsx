import React, { FC } from "react";
import { StyleSheet, TouchableOpacity, Animated, View } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { fontLight } from "../../config/fonts";

interface Props {
  onPress: (update: number) => void;
  leftDisabled?: boolean;
  rightDisabled?: boolean;
}

export const Stepper: FC<Props> = ({
  onPress,
  leftDisabled,
  rightDisabled,
}) => {
  const { theme } = useAppContext();
  return (
    <Animated.View style={styles.container}>
      <TouchableOpacity onPress={() => onPress(-1)} disabled={leftDisabled}>
        <View
          style={[
            styles.left,
            {
              borderColor: theme.textColorLighter,
              opacity: leftDisabled ? 0.4 : 1,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.text,
              {
                color: theme.textColorLighter,
                opacity: leftDisabled ? 0.4 : 1,
              },
            ]}
          >
            -
          </Animated.Text>
        </View>
      </TouchableOpacity>
      <View
        style={[styles.separator, { backgroundColor: theme.textColorLighter }]}
      />
      <TouchableOpacity disabled={rightDisabled} onPress={() => onPress(+1)}>
        <View
          style={[
            styles.right,
            {
              borderColor: theme.textColorLighter,
              opacity: rightDisabled ? 0.4 : 1,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.text,
              {
                color: theme.textColorLighter,
                opacity: rightDisabled ? 0.4 : 1,
              },
            ]}
          >
            +
          </Animated.Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  left: {
    borderRadius: 4,
    borderWidth: 1,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRightWidth: 0,
  },
  right: {
    borderRadius: 4,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  separator: {
    width: 1,
  },
  text: {
    ...fontLight,
    fontWeight: "bold",
    fontSize: 19,
    width: 14,
    textAlign: "center",
  },
});
