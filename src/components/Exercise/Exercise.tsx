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

type Status = "interlude" | "running" | "completed";

type Props = {};

const unmountAnimDuration = 300;

export const Exercise: FC<Props> = () => {
  const { technique, timerDuration } = useAppContext();
  const [status, setStatus] = useState<Status>("interlude");
  const [unmountContentAnimVal] = useState(new Animated.Value(1));
  const steps = buildExerciseSteps(technique.durations);

  const unmountContentAnimation = animate(unmountContentAnimVal, {
    toValue: 0,
    duration: unmountAnimDuration
  });

  const handleInterludeComplete = () => {
    setStatus("running");
  };

  const handleTimeLimitReached = () => {
    unmountContentAnimation.start(({ finished }) => {
      if (finished) {
        setStatus("completed");
      }
    });
  };

  const contentAnimatedStyle = {
    opacity: unmountContentAnimVal
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
          <ExerciseCircle steps={steps} />
        </Animated.View>
      )}
      {status === "completed" && <ExerciseComplete />}
      <KeepAwake />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: buttonAnimatorContentHeight
  },
  content: {
    height: buttonAnimatorContentHeight
  }
});
