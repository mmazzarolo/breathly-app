import React, { FC } from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { PageContainerBackButton } from "./PageContainerBackButton";

interface Props {
  title: string;
  onBackButtonPress: () => void;
  style?: StyleProp<ViewStyle> | Animated.WithAnimatedObject<ViewStyle>;
}

export const PageContainerHeader: FC<Props> = ({ title, onBackButtonPress, style }) => {
  const { theme } = useAppContext();
  return (
    <Animated.View style={[styles.container, style]}>
      <PageContainerBackButton onPress={onBackButtonPress} />
      <Animated.Text style={[styles.title, { color: theme.textColor }]}>{title}</Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 6,
  },
  title: {
    fontSize: 22,
    marginRight: 32,
    marginTop: -4,
    textAlign: "right",
    fontWeight: "500",
  },
});
