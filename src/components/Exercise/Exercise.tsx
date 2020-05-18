import React, { FC, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import KeepAwake from "react-native-keep-awake";
import { useAppContext } from "../../context/AppContext";
import { animate } from "../../utils/animate";
import { buildExerciseSteps } from "../../utils/buildExerciseSteps";
import { buttonAnimatorContentHeight } from "../ButtonAnimator/ButtonAnimator";
import { ExerciseCircle } from "./ExerciseCircle";
import { ExerciseComplete } from "./ExerciseComplete";
import { ExerciseInterlude } from "./ExerciseInterlude";
import { ExerciseTimer } from "./ExerciseTimer";
import { useOnMount } from "../../hooks/useOnMount";
import { initializeAudio, releaseAudio, playSound } from "../../services/sound";

type Status = "interlude" | "running" | "completed";

type Props = {};

const unmountAnimDuration = 300;

export const Exercise: FC<Props> = () => {
  const {
    technique,
    timerDuration,
    guidedBreathingFlag,
    stepVibrationFlag,
  } = useAppContext();
  const [status, setStatus] = useState<Status>("interlude");
  const [unmountContentAnimVal] = useState(new Animated.Value(1));
  const steps = buildExerciseSteps(technique.durations);

  const unmountContentAnimation = animate(unmountContentAnimVal, {
    toValue: 0,
    duration: unmountAnimDuration,
  });

  useOnMount(() => {
    if (guidedBreathingFlag) initializeAudio();
    return () => {
      if (guidedBreathingFlag) releaseAudio();
    };
  });

  const handleInterludeComplete = () => {
    setStatus("running");
  };

  const handleTimeLimitReached = () => {
    unmountContentAnimation.start(({ finished }) => {
      if (finished) {
        if (guidedBreathingFlag) playSound("bell");
        setStatus("completed");
      }
    });
  };

  const contentAnimatedStyle = {
    opacity: unmountContentAnimVal,
  };

  return (
    <View style={styles.container}>
      {status === "interlude" && (
        <ExerciseInterlude onComplete={handleInterludeComplete} />
      )}
      {status === "running" && (
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <ExerciseTimer
            limit={timerDuration}
            onLimitReached={handleTimeLimitReached}
          />
          <ExerciseCircle
            steps={steps}
            soundEnabled={guidedBreathingFlag}
            vibrationEnabled={stepVibrationFlag}
          />
        </Animated.View>
      )}
      {status === "completed" && <ExerciseComplete />}
      <KeepAwake />
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
