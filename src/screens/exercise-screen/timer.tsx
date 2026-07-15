import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, AppState } from "react-native";
import {
  getActiveTickDeltaMs,
  getSessionNowMs,
} from "@breathly/screens/exercise-screen/exercise-session";
import { animate } from "@breathly/utils/animate";
import { formatTimer } from "@breathly/utils/format-timer";
import { useInterval } from "@breathly/utils/use-interval";
import { useOnMount } from "@breathly/utils/use-on-mount";

type Props = {
  limit: number;
  initialActiveElapsedMs: number;
  onActiveElapsedChange: (elapsedMs: number) => void;
  onLimitReached: () => void;
};

const timerRefreshIntervalMs = 250;
const maximumActiveTickGapMs = timerRefreshIntervalMs * 4;

export const Timer: FC<Props> = ({
  limit,
  initialActiveElapsedMs,
  onActiveElapsedChange,
  onLimitReached,
}) => {
  const [elapsedTimeMs, setElapsedTimeMs] = useState(initialActiveElapsedMs);
  const elapsedTimeRef = useRef(initialActiveElapsedMs);
  const previousTickAtMs = useRef(getSessionNowMs());
  const opacityAnimVal = useRef(new Animated.Value(0)).current;
  const limitReachedRef = useRef(false);

  useInterval(() => {
    const currentTickAtMs = getSessionNowMs();
    const activeTickDeltaMs = getActiveTickDeltaMs(
      previousTickAtMs.current,
      currentTickAtMs,
      AppState.currentState === "active",
      maximumActiveTickGapMs
    );
    previousTickAtMs.current = currentTickAtMs;
    if (activeTickDeltaMs === 0) return;

    const nextElapsedTimeMs = limit
      ? Math.min(elapsedTimeRef.current + activeTickDeltaMs, limit)
      : elapsedTimeRef.current + activeTickDeltaMs;
    elapsedTimeRef.current = nextElapsedTimeMs;
    setElapsedTimeMs(nextElapsedTimeMs);
    onActiveElapsedChange(nextElapsedTimeMs);
  }, timerRefreshIntervalMs);

  const showContainerAnimation = animate(opacityAnimVal, {
    toValue: 1,
  });

  useOnMount(() => {
    showContainerAnimation.start();
    return () => {
      showContainerAnimation.stop();
    };
  });

  const remainingTimeMs = limit ? Math.max(0, limit - elapsedTimeMs) : undefined;

  useEffect(() => {
    if (remainingTimeMs === 0 && !limitReachedRef.current) {
      limitReachedRef.current = true;
      onLimitReached();
    }
  }, [onLimitReached, remainingTimeMs]);

  const containerAnimatedStyle = {
    opacity: opacityAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  const timerText =
    remainingTimeMs == null
      ? formatTimer(Math.floor(elapsedTimeMs / 1000))
      : formatTimer(Math.ceil(remainingTimeMs / 1000));

  return (
    <Animated.View className="mt-4" style={containerAnimatedStyle}>
      <Animated.Text
        className="text-center text-2xl text-slate-800 dark:text-white"
        style={{ fontVariant: ["tabular-nums"] }}
        testID="exercise.timer"
      >
        {timerText}
      </Animated.Text>
    </Animated.View>
  );
};
