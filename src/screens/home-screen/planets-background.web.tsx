import ms from "ms";
import React, { FC, useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "@breathly/design/colors";

const PLANET_ANIM_DURATION = ms("8 sec");

export const PlanetsBackground: FC = () => {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Planet
        size={220}
        color={colors.pastel.orange}
        coords={{ top: -44, left: -64 }}
        gradient="linear-gradient(188deg, black 0%, rgba(0, 0, 0, 0.9) 42%, transparent 82%)"
        background="radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0) 35%)"
        rotateOutputRange={["0deg", "-40deg"]}
        translateYOutputRange={[0, 10]}
        translateXOutputRange={[0, 0]}
      />
      <Planet
        size={220}
        color={colors.pastel.gray}
        coords={{ top: 214, right: -72 }}
        gradient="linear-gradient(315deg, black 0%, rgba(0, 0, 0, 0.82) 44%, transparent 84%)"
        background="radial-gradient(circle at 68% 70%, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0) 38%)"
      />
      <Planet
        size={220}
        color={colors.pastel.green}
        coords={{ bottom: -72, left: -76 }}
        gradient="linear-gradient(90deg, black 0%, rgba(0, 0, 0, 0.86) 45%, transparent 86%)"
        background="radial-gradient(circle at 28% 70%, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0) 36%)"
      />
    </View>
  );
};

interface PlanetProps {
  size: number;
  color: string;
  gradient: string;
  background: string;
  coords: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  rotateOutputRange?: number[] | string[];
  translateYOutputRange?: number[] | string[];
  translateXOutputRange?: number[] | string[];
}

type WebMaskStyle = ViewStyle & {
  backgroundImage: string;
  maskImage: string;
  maskRepeat: string;
  maskSize: string;
  WebkitMaskImage: string;
  WebkitMaskRepeat: string;
  WebkitMaskSize: string;
};

export const Planet: FC<PlanetProps> = ({
  size,
  coords,
  color,
  gradient,
  background,
  rotateOutputRange = ["10deg", "0deg"],
  translateYOutputRange = [0, 20],
  translateXOutputRange = [0, 20],
}) => {
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: PLANET_ANIM_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: PLANET_ANIM_DURATION,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animationValue]);

  return (
    <Animated.View
      style={[
        styles.planetContainer,
        coords,
        {
          transform: [
            {
              rotate: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: rotateOutputRange,
                extrapolate: "clamp",
              }),
            },
            {
              translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: translateYOutputRange,
                extrapolate: "clamp",
              }),
            },
            {
              translateX: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: translateXOutputRange,
                extrapolate: "clamp",
              }),
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.planet,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            backgroundImage: background,
            maskImage: gradient,
            maskRepeat: "no-repeat",
            maskSize: "100% 100%",
            WebkitMaskImage: gradient,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "100% 100%",
          } as WebMaskStyle,
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  planetContainer: {
    position: "absolute",
  },
  planet: {
    opacity: 0.9,
  },
});
