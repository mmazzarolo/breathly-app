import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import { StepMetadata } from "@breathly/types/step-metadata";
import { animate } from "@breathly/utils/animate";
import { loopAnimations } from "@breathly/utils/loop-animations";

const textAnimDuration = 400;

export const useExerciseLoop = (
  stepsMetadata: [StepMetadata, StepMetadata, StepMetadata, StepMetadata],
  initialStepIndex: number,
  onStepStart: (stepIndex: number) => void
) => {
  const activeSteps = useMemo(() => stepsMetadata.filter((step) => !step.skipped), [stepsMetadata]);
  const safeInitialStepIndex = Math.min(
    Math.max(initialStepIndex, 0),
    Math.max(activeSteps.length - 1, 0)
  );
  const initialStep = activeSteps[safeInitialStepIndex];
  const initialExerciseAnimationValue =
    initialStep?.id === "afterInhale" || initialStep?.id === "exhale" ? 1 : 0;
  const [currentStepIndex, setCurrentStepIndex] = useState(safeInitialStepIndex);
  const textAnimVal = useRef(new Animated.Value(0)).current;
  const exerciseAnimVal = useRef(new Animated.Value(initialExerciseAnimationValue)).current;
  const currentStep: StepMetadata | undefined = activeSteps[currentStepIndex];

  const animateStep = useCallback(
    (toValue: number, duration: number) => {
      return Animated.stagger(duration - textAnimDuration, [
        Animated.parallel([
          animate(exerciseAnimVal, {
            toValue: toValue,
            duration: duration,
          }),
          animate(textAnimVal, {
            toValue: 1,
            duration: textAnimDuration,
          }),
        ]),
        animate(textAnimVal, {
          toValue: 0,
          duration: textAnimDuration,
        }),
      ]);
    },
    [exerciseAnimVal, textAnimVal]
  );

  useEffect(() => {
    const createStepAnimations = () =>
      activeSteps.map((x) =>
        animateStep(x.id === "inhale" || x.id === "afterInhale" ? 1 : 0, x.duration)
      );
    const cleanupExerciseLoop = loopAnimations(
      createStepAnimations,
      (stepIndex: number) => {
        setCurrentStepIndex(stepIndex);
        onStepStart(stepIndex);
      },
      safeInitialStepIndex
    );
    return () => {
      cleanupExerciseLoop();
    };
  }, [activeSteps, animateStep, onStepStart, safeInitialStepIndex]);

  return { currentStep, exerciseAnimVal, textAnimVal };
};
