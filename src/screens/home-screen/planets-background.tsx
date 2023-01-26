import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient, LinearGradientPoint } from "expo-linear-gradient";
import ms from "ms";
import { styled } from "nativewind";
import React, { FC, useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { colors } from "@breathly/design/colors";

const PLANET_ANIM_DURATION = ms("8 sec");

const StyledMaskedView = styled(MaskedView);

export const PlanetsBackground: FC = () => {
  return (
    <>
      <Planet
        size={200}
        color={colors.pastel.orange}
        coords={{ top: -8, left: -24 }}
        gradientStart={{ x: 0.2, y: 0 }}
        gradientEnd={{ x: 0.3, y: 1 }}
        rotateOutputRange={["0deg", "-40deg"]}
        translateYOutputRange={[0, 10]}
        translateXOutputRange={[0, 0]}
      />
      <Planet
        size={200}
        color={colors.pastel.gray}
        coords={{ top: 200, right: -22 }}
        gradientStart={{ x: 1, y: 1 }}
        gradientEnd={{ x: 0.4, y: 0.3 }}
      />
      <Planet
        size={200}
        color={colors.pastel.green}
        coords={{ bottom: -28, left: -32 }}
        gradientStart={{ x: 0, y: 1 }}
        gradientEnd={{ x: 1, y: 1 }}
      />
    </>
  );
};

interface PlanetProps {
  animationInitialValue?: number;
  size: number;
  color: string;
  gradientStart?: LinearGradientPoint;
  gradientEnd?: LinearGradientPoint;
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

export const Planet: FC<PlanetProps> = ({
  size,
  coords,
  color,
  gradientStart,
  gradientEnd,
  rotateOutputRange = ["10deg", "0deg"],
  translateYOutputRange = [0, 20],
  translateXOutputRange = [0, 20],
}) => {
  const animationValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: PLANET_ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: PLANET_ANIM_DURATION,
          useNativeDriver: true,
        }),
      ])
    ).start();
  });
  return (
    <Animated.View
      className="absolute"
      style={{
        ...coords,
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
      }}
    >
      <StyledMaskedView
        style={{ width: size, height: size }}
        className="transparent"
        maskElement={
          <View
            className="transparent"
            style={{
              // Transparent background because mask is based off alpha channel.
              backgroundColor: "transparent",
              width: size,
              height: size,
            }}
          >
            <LinearGradient
              colors={["black", "transparent"]}
              style={{ flex: 1 }}
              start={gradientStart}
              end={gradientEnd}
            />
          </View>
        }
      >
        <View className="h-full w-full rounded-full" style={{ backgroundColor: color }} />
      </StyledMaskedView>
    </Animated.View>
  );
};
