import ms from "ms";
import React, { FC, useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, ViewStyle } from "react-native";
import { images } from "@breathly/assets/images";
import { widestDeviceDimension } from "@breathly/design/metrics";

const BACKGROUND_ANIM_DURATION = ms("2 min");

interface Props {
  fadeIn?: boolean;
  onImageLoaded?: () => unknown;
  size?: number;
}

type WebMaskStyle = ViewStyle & {
  maskImage: string;
  maskRepeat: string;
  maskSize: string;
  WebkitMaskImage: string;
  WebkitMaskRepeat: string;
  WebkitMaskSize: string;
};

export const StarsBackground: FC<Props> = ({
  fadeIn,
  onImageLoaded,
  size = widestDeviceDimension * 0.6,
}) => {
  const backgroundAnimValue = useRef(new Animated.Value(0)).current;
  const fadeInAnimValue = useRef(new Animated.Value(fadeIn ? 0 : 1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnimValue, {
          toValue: 1,
          duration: BACKGROUND_ANIM_DURATION,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
        Animated.timing(backgroundAnimValue, {
          toValue: 0,
          duration: BACKGROUND_ANIM_DURATION,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [backgroundAnimValue]);

  const backgroundTransform = [
    {
      translateX: backgroundAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -size],
        extrapolate: "clamp",
      }),
    },
    {
      translateY: backgroundAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -size],
        extrapolate: "clamp",
      }),
    },
  ];

  const handleLoad = () => {
    onImageLoaded?.();
    if (fadeIn) {
      Animated.timing(fadeInAnimValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.quad),
      }).start();
    }
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          height: size,
          opacity: fadeInAnimValue,
          maskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 92%)",
          maskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 92%)",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
        } as WebMaskStyle,
      ]}
    >
      <Animated.View
        style={[{ height: size * 2, width: size * 2 }, { transform: backgroundTransform }]}
      >
        <Image
          style={styles.image}
          source={images.starsBackgroundHorizontal}
          resizeMode="cover"
          onLoad={handleLoad}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
  },
  image: {
    position: "absolute",
    top: 0,
    zIndex: 10,
    height: "100%",
    width: "100%",
  },
});
