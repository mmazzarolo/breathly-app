import React, { FC, PropsWithChildren, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { useOnMount } from "../../hooks/use-on-mount";
import { useOnUpdate } from "../../hooks/use-on-update";
import { animate } from "../../utils/animate";
import { interpolateTranslateY } from "../../utils/interpolate";
import { StarsBackground } from "../stars-background/stars-background";
import { PageContainerHeader } from "./page-container-header";

interface Props {
  visible: boolean;
  title: string;
  onHide: () => void;
  onBackButtonPress: () => void;
}

const mountAnimDuration = 800;
const mountAnimContentTranslateY = 40;
const unmountAnimDuration = 300;

export const PageContainer: FC<PropsWithChildren<Props>> = ({
  children,
  visible,
  title,
  onHide,
  onBackButtonPress,
}) => {
  const [mountAnimVal] = useState(new Animated.Value(0));

  const mountAnimation = animate(mountAnimVal, {
    toValue: 1,
    duration: mountAnimDuration,
    easing: Easing.linear,
  });

  const unmountAnimation = animate(mountAnimVal, {
    toValue: 0,
    duration: unmountAnimDuration,
    easing: Easing.linear,
  });

  useOnMount(() => {
    mountAnimation.start();
    return () => {
      mountAnimation.stop();
      unmountAnimation.stop();
    };
  });

  useOnUpdate((prevVisible) => {
    if (prevVisible && !visible) {
      unmountAnimation.start(() => {
        onHide();
      });
    }
  }, visible);

  const contentAnimatedStyle = {
    opacity: mountAnimVal.interpolate({
      inputRange: [0, 0.4],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    transform: [
      interpolateTranslateY(mountAnimVal, {
        inputRange: [0, 0.4],
        outputRange: [mountAnimContentTranslateY, 0],
        extrapolate: "clamp",
      }),
    ],
  };

  const headerAnimatedStyle = {
    opacity: mountAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
  };

  return (
    <>
      <StarsBackground expanded={false} animationDuration={1} />
      <Animated.View style={styles.container}>
        <PageContainerHeader
          title={title}
          onBackButtonPress={onBackButtonPress}
          style={headerAnimatedStyle}
        />
        <Animated.View style={[styles.content, contentAnimatedStyle]}>{children}</Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
