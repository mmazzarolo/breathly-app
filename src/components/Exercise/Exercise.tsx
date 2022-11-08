import { useKeepAwake } from "expo-keep-awake";
import React, { FC, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { useOnMount } from "../../hooks/useOnMount";
import {
  setupGuidedBreathingAudio,
  releaseGuidedBreathingAudio,
  playEndingBellSound,
} from "../../services/audio";
import { animate } from "../../utils/animate";
import { buildExerciseSteps } from "../../utils/buildExerciseSteps";
import { buttonAnimatorContentHeight } from "../ButtonAnimator/ButtonAnimator";
import { ExerciseCircle } from "./ExerciseCircle";
import { ExerciseComplete } from "./ExerciseComplete";
import { ExerciseInterlude } from "./ExerciseInterlude";
import { ExerciseTimer } from "./ExerciseTimer";

type Status = "interlude" | "running" | "completed";

const unmountAnimDuration = 300;

export const Exercise: FC = () => {
  const { technique, timerDuration, guidedBreathingMode, stepVibrationFlag } = useAppContext();
  const [status, setStatus] = useState<Status>("interlude");
  const [unmountContentAnimVal] = useState(new Animated.Value(1));
  const steps = buildExerciseSteps(technique.durations);

  const unmountContentAnimation = animate(unmountContentAnimVal, {
    toValue: 0,
    duration: unmountAnimDuration,
  });

  useOnMount(() => {
    if (guidedBreathingMode !== "disabled") setupGuidedBreathingAudio(guidedBreathingMode);
    return () => {
      if (guidedBreathingMode !== "disabled") releaseGuidedBreathingAudio();
    };
  });

  useKeepAwake();

  const handleInterludeComplete = () => {
    setStatus("running");
  };

  const handleTimeLimitReached = () => {
    unmountContentAnimation.start(({ finished }) => {
      if (finished) {
        if (guidedBreathingMode !== "disabled") playEndingBellSound();
        setStatus("completed");
      }
    });
  };

  const contentAnimatedStyle = {
    opacity: unmountContentAnimVal,
  };

  return (
    <View style={styles.container}>
      {status === "interlude" && <ExerciseInterlude onComplete={handleInterludeComplete} />}
      {status === "running" && (
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <ExerciseTimer limit={timerDuration} onLimitReached={handleTimeLimitReached} />
          <ExerciseCircle
            steps={steps}
            guidedBreathingMode={guidedBreathingMode}
            vibrationEnabled={stepVibrationFlag}
          />
        </Animated.View>
      )}
      {status === "completed" && <ExerciseComplete />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: buttonAnimatorContentHeight,
  },
  content: {
    height: buttonAnimatorContentHeight,
  },
});
