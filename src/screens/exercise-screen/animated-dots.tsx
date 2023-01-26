import React, { FC, useEffect, useRef } from "react";
import { Animated } from "react-native";
import { animate } from "@breathly/utils/animate";
import { interpolateScale } from "@breathly/utils/interpolate";
import { times } from "@breathly/utils/times";
import { useOnUpdate } from "@breathly/utils/use-on-update";

const dotSize = Math.floor(4);
const fadeInAnimDuration = 400;

interface Props {
  visible?: boolean;
  numberOfDots: number;
  totalDuration: number;
}

export const AnimatedDots: FC<Props> = ({ visible = false, numberOfDots, totalDuration }) => {
  const dotAnimVals = useRef(times(numberOfDots).map(() => new Animated.Value(0))).current;

  const delayDuration = Math.floor(totalDuration / numberOfDots - fadeInAnimDuration);

  const createDotAnimation = (index: number) => {
    return animate(dotAnimVals[index], {
      toValue: 1,
      duration: fadeInAnimDuration,
    });
  };
  const sequenceAnimations: Animated.CompositeAnimation[] = [];
  times(numberOfDots).forEach((index) => {
    sequenceAnimations.push(createDotAnimation(index));
    sequenceAnimations.push(Animated.delay(delayDuration));
  });
  const resetDotsAnimVals = () => dotAnimVals.forEach((val) => val.setValue(0));
  const dotsAnimation = Animated.sequence(sequenceAnimations);

  useEffect(() => {
    if (visible) {
      dotsAnimation.start(resetDotsAnimVals);
    }
    return () => {
      dotsAnimation.stop();
    };
  }, []);

  useOnUpdate((prevVisible) => {
    if (!prevVisible && visible) {
      dotsAnimation.start(resetDotsAnimVals);
    }
  }, visible);

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
