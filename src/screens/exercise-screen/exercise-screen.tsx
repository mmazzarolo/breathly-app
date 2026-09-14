import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useKeepAwake } from "expo-keep-awake";
import React, { FC, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Animated, AppState, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "@breathly/common/pressable";
import { RootStackParamList } from "@breathly/core/navigator";
import { colors } from "@breathly/design/colors";
import { widestDeviceDimension } from "@breathly/design/metrics";
import { useColorScheme, useThemeColors } from "@breathly/design/theme";
import { fontFamilies, fontSizes } from "@breathly/design/typography";
import {
  announceForScreenReader,
  announceLiveRegionUpdate,
  getStepAccessibilityLabel,
  sessionPausedAnnouncement,
} from "@breathly/screens/exercise-screen/accessibility-announcements";
import { AnimatedDots } from "@breathly/screens/exercise-screen/animated-dots";
import {
  createExerciseSession,
  exerciseSessionReducer,
  getExerciseStepTransition,
  type ResumableExerciseStatus,
} from "@breathly/screens/exercise-screen/exercise-session";
import { StepDescription } from "@breathly/screens/exercise-screen/step-description";
import { useExerciseAudio } from "@breathly/screens/exercise-screen/use-exercise-audio";
import { useExerciseHaptics } from "@breathly/screens/exercise-screen/use-exercise-haptics";
import { useExerciseLoop } from "@breathly/screens/exercise-screen/use-exercise-loop";
import { StarsBackground } from "@breathly/screens/home-screen/stars-background";
import { useSelectedPatternSteps, useSettingsStore } from "@breathly/stores/settings";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";
import { StepMetadata } from "@breathly/types/step-metadata";
import { animate } from "@breathly/utils/animate";
import { buildStepsMetadata } from "@breathly/utils/build-steps-metadata";
import { useScreenReaderEnabled } from "@breathly/utils/use-accessibility-preferences";
import { useOnUpdate } from "@breathly/utils/use-on-update";
import { BreathingAnimation } from "./breathing-animation";
import { ExerciseComplete } from "./complete";
import { ExerciseInterlude } from "./interlude";
import { Timer } from "./timer";

// The voice that the exercise uses for a user of a screen reader who disabled
// it. It is the default voice of the app.
const screenReaderFallbackVoice: GuidedBreathingMode = "paul";

export const ExerciseScreen: FC<NativeStackScreenProps<RootStackParamList, "Exercise">> = ({
  navigation,
}) => {
  const { guidedBreathingVoice, preparationTime } = useSettingsStore();
  const screenReaderEnabled = useScreenReaderEnabled();
  // A user of a screen reader who disabled the voice has no channel that works
  // without sight, because the visuals carry the whole exercise. The voice
  // therefore starts, but the app does not write the setting: the user keeps
  // the choice made in the settings screen.
  const effectiveGuidedBreathingVoice =
    screenReaderEnabled && guidedBreathingVoice === "disabled"
      ? screenReaderFallbackVoice
      : guidedBreathingVoice;
  const [session, dispatchSession] = useReducer(
    exerciseSessionReducer,
    undefined,
    createExerciseSession,
  );
  const activeElapsedMs = useRef(0);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = useThemeColors();

  const { playExerciseStepAudio, playExerciseCompletedAudio, stopExerciseAudio } = useExerciseAudio(
    effectiveGuidedBreathingVoice,
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // iOS reports "inactive" for the Control Center, the Notification Center,
      // the app switcher and the banner of an incoming call. The app stays on
      // the screen and the user comes back to a live session, thus only a real
      // background interrupts the exercise.
      if (nextAppState === "background") {
        stopExerciseAudio();
        dispatchSession({ type: "pause", activeElapsedMs: activeElapsedMs.current });
        return;
      }

      // Coming back, silence anything expo-audio resumed on its own. It pauses the players
      // it interrupted and replays them afterwards, and the JS AppState event arrives after
      // its native observers have already run — so a cue caught mid-word would otherwise
      // finish in the middle of the wrong step, seconds or minutes later.
      if (nextAppState === "active") stopExerciseAudio();
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
    [playExerciseStepAudio],
  );

  const handleExerciseComplete = useCallback(() => {
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
      testID="exercise.screen"
      style={[
        styles.screen,
        {
          // Paddings to handle safe area
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {session.status === "interlude" && (
        <ExerciseInterlude preparationTime={preparationTime} onComplete={handleInterludeComplete} />
      )}
      {session.status === "running" && (
        <>
          {colorScheme === "dark" && (
            <StarsBackground size={widestDeviceDimension * 0.8} fadeIn={true} />
          )}
          <ExerciseRunningFragment
            onComplete={handleExerciseComplete}
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
      {/* The countdown and the paused screen need the display awake as much as the exercise
          does — a screen that locks during the countdown pauses the session before it starts.
          The completion screen does not: it never dismisses itself, so holding the display on
          there would keep it lit until the user came back to the phone. */}
      {session.status !== "completed" && <KeepDisplayAwake />}
      <View style={styles.closeButtonRow}>
        <Pressable
          style={[styles.closeButton, { borderColor: theme.control }]}
          onPress={navigation.goBack}
          testID="exercise.close"
          accessibilityLabel="Close breathing session"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={22} color={theme.control} />
        </Pressable>
      </View>
    </View>
  );
};

// `useKeepAwake` releases on unmount, so mounting it conditionally is what scopes it.
const KeepDisplayAwake: FC = () => {
  useKeepAwake();
  return null;
};

interface ExerciseRunningFragmentProps {
  onComplete: () => unknown;
  onStepChange: (stepMetadata: StepMetadata) => unknown;
  onStepIndexChange: (stepIndex: number) => void;
  initialActiveElapsedMs: number;
  onActiveElapsedChange: (elapsedMs: number) => void;
  initialStepIndex: number;
}

const unmountAnimDuration = 300;

const ExerciseRunningFragment: FC<ExerciseRunningFragmentProps> = ({
  onComplete,
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
    [selectedPatternSteps],
  );

  const { currentStep, exerciseAnimVal, textAnimVal } = useExerciseLoop(
    stepsMetadata,
    initialStepIndex,
    onStepIndexChange,
  );

  const playStepHaptic = useExerciseHaptics(vibrationEnabled);

  // The time limit does not stop the exercise on its own: it only arms the
  // completion. The step transition below then stops the exercise at the end of
  // the first step that leaves the lungs empty.
  const timeLimitReachedRef = useRef(false);
  const completionStartedRef = useRef(false);

  const startCompletion = () => {
    if (completionStartedRef.current) return;
    completionStartedRef.current = true;
    animate(unmountContentAnimVal, {
      toValue: 0,
      duration: unmountAnimDuration,
    }).start(({ finished }) => {
      if (finished) {
        onComplete();
      }
    });
  };

  useOnUpdate(
    (prevStepMetadata) => {
      // An empty pattern would leave no current step. The duration limits stop that today,
      // but nothing here should depend on that.
      if (!currentStep) return;

      const transition = getExerciseStepTransition(
        prevStepMetadata?.id,
        currentStep.id,
        timeLimitReachedRef.current,
      );
      if (transition === "complete") {
        startCompletion();
      } else if (transition === "startStep") {
        onStepChange(currentStep);
        playStepHaptic();
        announceLiveRegionUpdate(
          getStepAccessibilityLabel(currentStep.label, currentStep.duration),
        );
      }
    },
    currentStep,
    true,
  );

  const handleTimeLimitReached = useCallback(() => {
    timeLimitReachedRef.current = true;
  }, []);

  const contentAnimatedStyle = {
    opacity: unmountContentAnimVal,
  };

  return (
    <Animated.View style={[styles.runningContent, contentAnimatedStyle]} testID="exercise.running">
      <Timer
        limit={timeLimit}
        initialActiveElapsedMs={initialActiveElapsedMs}
        onActiveElapsedChange={onActiveElapsedChange}
        onLimitReached={handleTimeLimitReached}
      />
      {currentStep && (
        <View style={styles.stepContent}>
          <BreathingAnimation animationValue={exerciseAnimVal} />
          <StepDescription
            label={currentStep.label}
            durationMs={currentStep.duration}
            animationValue={textAnimVal}
          />
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

const ExercisePaused: FC<ExercisePausedProps> = ({ resumeStatus, onResume }) => {
  const isDarkMode = useColorScheme() === "dark";
  const theme = useThemeColors();

  // The step announcements simply stop when the session pauses. Without this a screen-reader
  // user is told nothing at all, and the completion screen already announces itself.
  useEffect(() => {
    announceForScreenReader(sessionPausedAnnouncement);
  }, []);

  return (
    <View style={styles.pausedScreen} testID="exercise.paused">
      <Text
        accessibilityRole="header"
        style={[styles.pausedTitle, isDarkMode && styles.pausedTitleDark]}
      >
        Paused
      </Text>
      <Text style={[styles.pausedDescription, { color: theme.textSecondary }]}>
        {resumeStatus === "interlude"
          ? "The starting countdown was interrupted."
          : "The session paused while Breathly was in the background."}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Resume breathing session"
        style={styles.resumeButton}
        onPress={onResume}
        testID="exercise.resume"
      >
        <Text style={styles.resumeButtonLabel}>Resume</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: "center",
    borderRadius: 9999,
    borderWidth: 2,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  closeButtonRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
    paddingTop: 24,
  },
  pausedDescription: {
    ...fontSizes.lg,
    fontFamily: fontFamilies.regular,
    marginBottom: 32,
    textAlign: "center",
  },
  pausedScreen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  pausedTitle: {
    ...fontSizes.xxl5,
    color: colors["slate-800"],
    fontFamily: fontFamilies.serifMedium,
    marginBottom: 16,
    textAlign: "center",
  },
  pausedTitleDark: {
    color: colors.white,
  },
  resumeButton: {
    alignItems: "center",
    backgroundColor: colors.pastel["orange-light"],
    borderRadius: 8,
    maxWidth: 320,
    paddingHorizontal: 32,
    paddingVertical: 8,
    width: 288,
  },
  resumeButtonLabel: {
    ...fontSizes.lg,
    color: colors["slate-800"],
    paddingVertical: 4,
  },
  runningContent: {
    flex: 1,
  },
  screen: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  stepContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
