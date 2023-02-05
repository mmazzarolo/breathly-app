import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useKeepAwake } from "expo-keep-awake";
import { useColorScheme } from "nativewind";
import React, { FC, useState } from "react";
import { Animated, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Touchable } from "@breathly/common/touchable";
import { RootStackParamList } from "@breathly/core/navigator";
import { widestDeviceDimension } from "@breathly/design/metrics";
import { AnimatedDots } from "@breathly/screens/exercise-screen/animated-dots";
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

export type ExerciseStatus = "interlude" | "running" | "completed";

export const ExerciseScreen: FC<NativeStackScreenProps<RootStackParamList, "Exercise">> = ({
  navigation,
}) => {
  const { guidedBreathingVoice } = useSettingsStore();
  const [status, setStatus] = useState<ExerciseStatus>("interlude");
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const { playExerciseStepAudio, playExerciseCompletedAudio } =
    useExerciseAudio(guidedBreathingVoice);

  useKeepAwake();

  const handleInterludeComplete = () => {
    setStatus("running");
  };

  const handleExerciseStepChange = (stepMetadata: StepMetadata) => {
    playExerciseStepAudio(stepMetadata);
  };

  const handleTimeLimitReached = () => {
    playExerciseCompletedAudio();
    setStatus("completed");
  };

  return (
    <View
      className="flex-1 flex-col justify-between"
      style={{
        // Paddings to handle safe area
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {status === "interlude" && <ExerciseInterlude onComplete={handleInterludeComplete} />}
      {status === "running" && (
        <>
          {colorScheme === "dark" && (
            <StarsBackground size={widestDeviceDimension * 0.8} fadeIn={true} />
          )}
          <ExerciseRunningFragment
            onTimeLimitReached={handleTimeLimitReached}
            onStepChange={handleExerciseStepChange}
          />
        </>
      )}
      {status === "completed" && <ExerciseComplete />}
      <View className="items-center justify-center pb-10 pt-6">
        <Touchable
          className="h-16 w-16 items-center justify-center rounded-full border-2 border-gray-300 text-center"
          onPress={navigation.goBack}
        >
          <Ionicons name="ios-close" size={22} color="lightgray" />
        </Touchable>
      </View>
    </View>
  );
};

interface ExerciseRunningFragmentProps {
  onTimeLimitReached: () => unknown;
  onStepChange: (stepMetadata: StepMetadata) => unknown;
}

const unmountAnimDuration = 300;

const ExerciseRunningFragment: FC<ExerciseRunningFragmentProps> = ({
  onTimeLimitReached,
  onStepChange,
}) => {
  const { timeLimit, vibrationEnabled } = useSettingsStore();
  const selectedPatternSteps = useSelectedPatternSteps();
  const [unmountContentAnimVal] = useState(new Animated.Value(1));
  const stepsMetadata = buildStepsMetadata(selectedPatternSteps);

  const { currentStep, exerciseAnimVal, textAnimVal } = useExerciseLoop(stepsMetadata);

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
    <Animated.View style={contentAnimatedStyle} className="flex-1">
      <Timer limit={timeLimit} onLimitReached={handleTimeLimitReached} />
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
