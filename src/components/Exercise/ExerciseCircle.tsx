import React, { FC, useState } from "react";
import { Animated, StyleSheet, Platform, Vibration } from "react-native";
import { deviceWidth } from "../../config/constants";
import { fontThin } from "../../config/fonts";
import { useOnMount } from "../../hooks/useOnMount";
import { playGuidedBreathingSound } from "../../services/audio";
import { Haptics } from "../../services/haptics";
import { GuidedBreathingMode } from "../../types/GuidedBreathingMode";
import { Step } from "../../types/Step";
import { animate } from "../../utils/animate";
import { interpolateScale, interpolateTranslateY } from "../../utils/interpolate";
import { loopAnimations } from "../../utils/loopAnimations";
import { ExerciseCircleDots } from "./ExerciseCircleDots";

type Props = {
  steps: Step[];
  guidedBreathingMode: GuidedBreathingMode;
  vibrationEnabled: boolean;
};

const circleSize = deviceWidth * 0.8;
const fadeInAnimDuration = 400;

export const ExerciseCircle: FC<Props> = ({ steps, guidedBreathingMode, vibrationEnabled }) => {
  const [showUpAnimVal] = useState(new Animated.Value(0));
  const [scaleAnimVal] = useState(new Animated.Value(0));
  const [textAnimVal] = useState(new Animated.Value(1));
  const [circleMinAnimVal] = useState(new Animated.Value(0));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const activeSteps = steps.filter((x) => !x.skipped);
  const currentStep = activeSteps[currentStepIndex];

  const animateStep = (toValue: number, duration: number) => {
    const textDuration = fadeInAnimDuration;
    return Animated.stagger(duration - textDuration, [
      Animated.parallel([
        animate(scaleAnimVal, {
          toValue: toValue,
          duration: duration,
        }),
        animate(textAnimVal, {
          toValue: 1,
          duration: textDuration,
        }),
      ]),
      animate(textAnimVal, {
        toValue: 0,
        duration: textDuration,
      }),
    ]);
  };

  const showCircleMinAnimation = animate(circleMinAnimVal, {
    toValue: 1,
    duration: fadeInAnimDuration,
  });

  const hideCircleMinAnimation = animate(circleMinAnimVal, {
    toValue: 0,
    duration: fadeInAnimDuration,
  });

  const showUpAnimation = animate(showUpAnimVal, {
    toValue: 1,
    duration: fadeInAnimDuration,
  });

  const onStepStart = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    const step = activeSteps[stepIndex];
    if (step.id === "exhale") {
      playGuidedBreathingSound("breatheOut");
      showCircleMinAnimation.start();
    } else if (step.id === "inhale") {
      playGuidedBreathingSound("breatheIn");
      hideCircleMinAnimation.start();
    } else if (step.id === "afterExhale") {
      playGuidedBreathingSound("hold");
      hideCircleMinAnimation.start();
    } else if (step.id === "afterInhale") {
      playGuidedBreathingSound("hold");
    }
    if (vibrationEnabled) {
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (Platform.OS === "android") {
        Vibration.vibrate(200);
      }
    }
  };

  const startAnimationSteps = () => {
    const createStepAnimations = () =>
      activeSteps.map((x) =>
        animateStep(x.id === "inhale" || x.id === "afterInhale" ? 1 : 0, x.duration)
      );
    const stopLoop = loopAnimations(createStepAnimations, onStepStart);
    return stopLoop;
  };

  useOnMount(() => {
    let cleanUpAnimationsSteps: () => void;
    showUpAnimation.start(({ finished }) => {
      if (finished) {
        cleanUpAnimationsSteps = startAnimationSteps();
      }
    });
    return () => {
      cleanUpAnimationsSteps && cleanUpAnimationsSteps();
      showUpAnimation.stop();
      showCircleMinAnimation.stop();
      hideCircleMinAnimation.stop();
    };
  });

  const containerAnimatedStyle = {
    opacity: showUpAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  const circleAnimatedStyle = {
    transform: [
      interpolateScale(scaleAnimVal, {
        inputRange: [0, 1],
        outputRange: [0.6, 1],
      }),
    ],
  };

  const contentAnimatedStyle = {
    opacity: textAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      interpolateScale(scaleAnimVal, {
        inputRange: [0, 1],
        outputRange: [1, 1.3],
      }),
      interpolateTranslateY(textAnimVal, {
        inputRange: [0, 1],
        outputRange: [-8, 0],
      }),
    ],
  };

  const circleMinAnimatedStyle = {
    opacity: circleMinAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Animated.View style={[styles.circle, circleAnimatedStyle]} />
      <Animated.View style={[styles.circleMin, circleMinAnimatedStyle]} />
      <Animated.View style={styles.circleMax} />
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <Animated.Text style={styles.text}>{currentStep.label}</Animated.Text>
        <ExerciseCircleDots
          visible={currentStep.showDots}
          numberOfDots={3}
          totalDuration={currentStep.duration}
        />
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
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "white",
    borderWidth: StyleSheet.hairlineWidth,
  },
  circleMin: {
    position: "absolute",
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: [{ scale: 0.6 }],
  },
  circleMax: {
    position: "absolute",
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  content: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: Math.floor(24),
    textAlign: "center",
    color: "white",
    ...fontThin,
  },
});
