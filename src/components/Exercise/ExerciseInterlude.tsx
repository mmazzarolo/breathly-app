import React, { FC, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useOnMount } from "../../hooks/useOnMount";
import { animate } from "../../utils/animate";
import { delay } from "../../utils/delay";
import { interpolateTranslateY } from "../../utils/interpolate";
import { fontThin } from "../../config/fonts";

type Props = {
  onComplete: () => void;
};

const interuldeInitialDelay = 600;
const interludeAnimDuration = 400;

export const ExerciseInterlude: FC<Props> = ({ onComplete }) => {
  const isMounted = useRef(true);
  const [containerAnimVal] = useState(new Animated.Value(1));
  const [subtitleAnimVal] = useState(new Animated.Value(0));
  const [step, setStep] = useState(3);

  const showSubtitleAnimation = animate(subtitleAnimVal, {
    toValue: 1,
    duration: interludeAnimDuration,
  });

  const hideContainerAnimation = animate(containerAnimVal, {
    toValue: 0,
    duration: interludeAnimDuration,
  });

  const animateInterlude = async () => {
    await delay(interuldeInitialDelay);
    showSubtitleAnimation.start(async ({ finished }) => {
      if (!finished) return;
      await delay(1000);
      if (!isMounted.current) return;
      setStep(2);
      await delay(1000);
      if (!isMounted.current) return;
      setStep(1);
      await delay(1000);
      if (!isMounted.current) return;
      hideContainerAnimation.start((done) => done && onComplete());
    });
  };

  useOnMount(() => {
    animateInterlude();
    return () => {
      isMounted.current = false;
      showSubtitleAnimation.stop();
      hideContainerAnimation.stop();
    };
  });

  const containerAnimatedStyle = {
    opacity: containerAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateTranslateY(containerAnimVal, {
        inputRange: [0, 1],
        outputRange: [0, 8],
      }),
    ],
  };
  const subtitleAnimatedStyle = {
    opacity: subtitleAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateTranslateY(subtitleAnimVal, {
        inputRange: [0, 1],
        outputRange: [0, -8],
      }),
    ],
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Text style={styles.title}>Relax</Text>
      <Animated.View style={subtitleAnimatedStyle}>
        <Animated.Text style={[styles.subtitleText]}>
          {`Starting session in \n${step}`}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 50,
    textAlign: "center",
    color: "white",
    ...fontThin,
  },
  subtitleText: {
    fontSize: 20,
    textAlign: "center",
    color: "white",
    ...fontThin,
  },
});
