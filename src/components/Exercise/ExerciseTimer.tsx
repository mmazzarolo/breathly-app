import React, { FC, useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { useInterval } from "../../hooks/useInterval";
import { useOnMount } from "../../hooks/useOnMount";
import { animate } from "../../utils/animate";
import { formatTimer } from "../../utils/formatTimer";
import { buttonSize } from "../ButtonAnimator/ButtonAnimator";
import { fontMono } from "../../config/fonts";

type Props = {
  limit: number;
  onLimitReached: () => void;
};

export const ExerciseTimer: FC<Props> = ({ limit, onLimitReached }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [opacityAnimVal] = useState(new Animated.Value(0));

  const increaseElapsedTime = () => {
    setElapsedTime(prevElapsedTime => prevElapsedTime + 1);
  };

  useInterval(increaseElapsedTime, 1000);

  const showContainerAnimation = animate(opacityAnimVal, {
    toValue: 1
  });

  useOnMount(() => {
    showContainerAnimation.start();
    return () => {
      showContainerAnimation.stop();
    };
  });

  useEffect(() => {
    if (limit && elapsedTime * 1000 >= limit) {
      onLimitReached();
    }
  }, [limit, elapsedTime]);

  const containerAnimatedStyle = {
    opacity: opacityAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    })
  };

  const timerText = limit
    ? formatTimer(limit / 1000 - elapsedTime)
    : formatTimer(elapsedTime);

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Animated.Text style={styles.text}>{timerText}</Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: buttonSize
  },
  text: {
    textAlign: "center",
    fontSize: 26,
    color: "white",
    ...fontMono
  }
});
