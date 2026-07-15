import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useKeepAwake } from "expo-keep-awake";
import { useColorScheme } from "nativewind";
import React, { FC, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Animated, AppState, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "@breathly/common/pressable";
import { RootStackParamList } from "@breathly/core/navigator";
import { colors } from "@breathly/design/colors";
import { widestDeviceDimension } from "@breathly/design/metrics";
import { AnimatedDots } from "@breathly/screens/exercise-screen/animated-dots";
import {
  createExerciseSession,
  exerciseSessionReducer,
  type ResumableExerciseStatus,
} from "@breathly/screens/exercise-screen/exercise-session";
import { StepDescription } from "@breathly/screens/exercise-screen/step-description";
import { useExerciseAudio } from "@breathly/screens/exercise-screen/use-exercise-audio";
import { useExerciseHaptics } from "@breathly/screens/exercise-screen/use-exercise-haptics";
import { useExerciseLoop } from "@breathly/screens/exercise-screen/use-exercise-loop";
import { StarsBackground } from "@breathly/screens/home-screen/stars-background";
import { useSelectedPatternSteps, useSettingsStore } from "@breathly/stores/settings";
import { StepMetadata } from "@breathly/types/step-metadata";
import { animate } from "@breathly/utils/animate";
import { buildStepsMetadata } from "@breathly/utils/build-steps-metadata";
import { useOnUpdate } from "@breathly/utils/use-on-update";
import { BreathingAnimation } from "./breathing-animation";
import { ExerciseComplete } from "./complete";
import { ExerciseInterlude } from "./interlude";
import { Timer } from "./timer";

export const ExerciseScreen: FC<NativeStackScreenProps<RootStackParamList, "Exercise">> = ({
  navigation,
}) => {
  const { guidedBreathingVoice } = useSettingsStore();
  const [session, dispatchSession] = useReducer(
    exerciseSessionReducer,
    undefined,
    createExerciseSession
  );
  const activeElapsedMs = useRef(0);
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const { playExerciseStepAudio, playExerciseCompletedAudio, stopExerciseAudio } =
    useExerciseAudio(guidedBreathingVoice);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState !== "active") {
        stopExerciseAudio();
        dispatchSession({ type: "pause", activeElapsedMs: activeElapsedMs.current });
      }
    });

    return () => subscription.remove();
  }, [stopExerciseAudio]);

  const handleInterludeComplete = useCallback(() => {
    dispatchSession({ type: "start" });
  }, []);

  const handleExerciseStepChange = useCallback(
    (stepMetadata: StepMetadata) => {
      playExerciseStepAudio(stepMetadata);
    },
    [playExerciseStepAudio]
  );

  const handleTimeLimitReached = useCallback(() => {
    playExerciseCompletedAudio();
    dispatchSession({ type: "complete", activeElapsedMs: activeElapsedMs.current });
  }, [playExerciseCompletedAudio]);

  const handleStepIndexChange = useCallback((stepIndex: number) => {
    dispatchSession({ type: "stepChanged", stepIndex });
  }, []);

  const handleActiveElapsedChange = useCallback((elapsedMs: number) => {
    activeElapsedMs.current = elapsedMs;
  }, []);

  const handleResume = useCallback(() => {
    dispatchSession({ type: "resume" });
  }, []);

  return (
    <View
      className="flex-1 flex-col justify-between"
      testID="exercise.screen"
      style={{
        // Paddings to handle safe area
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {session.status === "interlude" && <ExerciseInterlude onComplete={handleInterludeComplete} />}
      {session.status === "running" && (
        <>
          {colorScheme === "dark" && (
            <StarsBackground size={widestDeviceDimension * 0.8} fadeIn={true} />
          )}
          <ExerciseRunningFragment
            onTimeLimitReached={handleTimeLimitReached}
            onStepChange={handleExerciseStepChange}
            onStepIndexChange={handleStepIndexChange}
            initialActiveElapsedMs={session.activeElapsedMs}
            onActiveElapsedChange={handleActiveElapsedChange}
            initialStepIndex={session.currentStepIndex}
          />
        </>
      )}
      {session.status === "paused" && (
        <ExercisePaused resumeStatus={session.resumeStatus} onResume={handleResume} />
      )}
      {session.status === "completed" && <ExerciseComplete />}
      <View className="items-center justify-center pb-10 pt-6">
        <Pressable
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-gray-300 text-center"
          onPress={navigation.goBack}
          testID="exercise.close"
          accessibilityLabel="Close breathing session"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={22} color="lightgray" />
        </Pressable>
      </View>
    </View>
  );
};

interface ExerciseRunningFragmentProps {
  onTimeLimitReached: () => unknown;
  onStepChange: (stepMetadata: StepMetadata) => unknown;
  onStepIndexChange: (stepIndex: number) => void;
  initialActiveElapsedMs: number;
  onActiveElapsedChange: (elapsedMs: number) => void;
  initialStepIndex: number;
}

const unmountAnimDuration = 300;

const ExerciseRunningFragment: FC<ExerciseRunningFragmentProps> = ({
  onTimeLimitReached,
  onStepChange,
  onStepIndexChange,
  initialActiveElapsedMs,
  onActiveElapsedChange,
  initialStepIndex,
}) => {
  const { timeLimit, vibrationEnabled } = useSettingsStore();
  const selectedPatternSteps = useSelectedPatternSteps();
  const [unmountContentAnimVal] = useState(new Animated.Value(1));
  const stepsMetadata = useMemo(
    () => buildStepsMetadata(selectedPatternSteps),
    [selectedPatternSteps]
  );

  const { currentStep, exerciseAnimVal, textAnimVal } = useExerciseLoop(
    stepsMetadata,
    initialStepIndex,
    onStepIndexChange
  );

  useKeepAwake();

  useOnUpdate(
    (prevStepMetadata) => {
      if (prevStepMetadata?.id !== currentStep.id) {
        onStepChange(currentStep);
      }
    },
    currentStep,
    true
  );

  useExerciseHaptics(currentStep, vibrationEnabled);

  const unmountContentAnimation = animate(unmountContentAnimVal, {
    toValue: 0,
    duration: unmountAnimDuration,
  });

  const handleTimeLimitReached = () => {
    unmountContentAnimation.start(({ finished }) => {
      if (finished) {
        onTimeLimitReached();
      }
    });
  };

  const contentAnimatedStyle = {
    opacity: unmountContentAnimVal,
  };

  return (
    <Animated.View style={contentAnimatedStyle} className="flex-1" testID="exercise.running">
      <Timer
        limit={timeLimit}
        initialActiveElapsedMs={initialActiveElapsedMs}
        onActiveElapsedChange={onActiveElapsedChange}
        onLimitReached={handleTimeLimitReached}
      />
      {currentStep && (
        <View className="flex-1 items-center justify-center">
          <BreathingAnimation animationValue={exerciseAnimVal} />
          <StepDescription label={currentStep.label} animationValue={textAnimVal} />
          <AnimatedDots
            numberOfDots={3}
            totalDuration={currentStep.duration}
            visible={currentStep.id === "afterInhale" || currentStep.id === "afterExhale"}
          />
        </View>
      )}
    </Animated.View>
  );
};

interface ExercisePausedProps {
  resumeStatus?: ResumableExerciseStatus;
  onResume: () => void;
}

const ExercisePaused: FC<ExercisePausedProps> = ({ resumeStatus, onResume }) => (
  <View className="flex-1 items-center justify-center px-8" testID="exercise.paused">
    <Text className="mb-4 text-center font-breathly-serif-medium text-5xl text-slate-800 dark:text-white">
      Paused
    </Text>
    <Text className="mb-8 text-center font-breathly-regular text-lg text-slate-500">
      {resumeStatus === "interlude"
        ? "The starting countdown was interrupted."
        : "Your session stopped while Breathly was in the background."}
    </Text>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Resume breathing session"
      className="w-72 max-w-xs items-center rounded-lg px-8 py-2"
      style={{ backgroundColor: colors.pastel["orange-light"] }}
      onPress={onResume}
      testID="exercise.resume"
    >
      <Text className="py-1 text-lg text-slate-800">Resume</Text>
    </Pressable>
  </View>
);
