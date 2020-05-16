import React, { FC, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { useOnMount } from "../../hooks/useOnMount";
import { useOnUpdate } from "../../hooks/useOnUpdate";
import { animate } from "../../utils/animate";
import { interpolateScale } from "../../utils/interpolate";
import { times } from "../../utils/times";

const dotSize = Math.floor(4);
const fadeInAnimDuration = 400;

type Props = {
  visible?: boolean;
  numberOfDots: number;
  totalDuration: number;
};

export const ExerciseCircleDots: FC<Props> = ({
  visible = false,
  numberOfDots,
  totalDuration,
}) => {
  const [dotAnimVals] = useState(
    times(numberOfDots).map(() => new Animated.Value(0))
  );

  const delayDuration = Math.floor(
    totalDuration / numberOfDots - fadeInAnimDuration
  );

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

  useOnMount(() => {
    if (visible) {
      dotsAnimation.start(resetDotsAnimVals);
    }
    return () => {
      dotsAnimation.stop();
    };
  });

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
    <Animated.View style={[styles.container]}>
      {times(numberOfDots).map((index) => (
        <Animated.View
          key={`dot_${index}`}
          style={[styles.dot, dotsAnimatedStyles[index]]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    paddingTop: Math.floor(24) * 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: "white",
    margin: dotSize * 0.7,
  },
});
