import React, { FC, useEffect, useMemo } from "react";
import { Animated } from "react-native";
import { animate } from "@breathly/utils/animate";
import { interpolateScale } from "@breathly/utils/interpolate";
import { times } from "@breathly/utils/times";

const dotSize = Math.floor(4);
const fadeInAnimDuration = 400;

interface Props {
  visible?: boolean;
  numberOfDots: number;
  totalDuration: number;
}

export const AnimatedDots: FC<Props> = ({ visible = false, numberOfDots, totalDuration }) => {
  const dotAnimVals = useMemo(
    () => times(numberOfDots).map(() => new Animated.Value(0)),
    [numberOfDots]
  );

  const delayDuration = Math.max(
    0,
    Math.floor(totalDuration / Math.max(numberOfDots, 1) - fadeInAnimDuration)
  );

  useEffect(() => {
    const resetDots = () => dotAnimVals.forEach((value) => value.setValue(0));
    resetDots();
    if (!visible || dotAnimVals.length === 0) return;

    const sequence = Animated.sequence(
      dotAnimVals.flatMap((value) => [
        animate(value, {
          toValue: 1,
          duration: fadeInAnimDuration,
        }),
        Animated.delay(delayDuration),
      ])
    );
    sequence.start(({ finished }) => {
      if (finished) resetDots();
    });
    return () => sequence.stop();
  }, [delayDuration, dotAnimVals, visible]);

  const dotsAnimatedStyles = dotAnimVals.map((val) => ({
    opacity: val.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateScale(val, {
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    ],
  }));

  return (
    <Animated.View className="flex-row items-center justify-center">
      {times(numberOfDots).map((index) => (
        <Animated.View
          key={`dot_${index}`}
          className="bg-slate-800 dark:bg-white"
          style={[
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              margin: dotSize * 0.7,
            },
            dotsAnimatedStyles[index],
          ]}
        />
      ))}
    </Animated.View>
  );
};
