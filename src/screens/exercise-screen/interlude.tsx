import React, { FC, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { colors } from "@breathly/design/colors";
import { useColorScheme, useThemeColors } from "@breathly/design/theme";
import { fontFamilies, fontSizes } from "@breathly/design/typography";
import {
  announceLiveRegionUpdate,
  getInterludeAccessibilityLabel,
} from "@breathly/screens/exercise-screen/accessibility-announcements";
import { animate } from "@breathly/utils/animate";
import { delay } from "@breathly/utils/delay";
import { interpolateTranslateY } from "@breathly/utils/interpolate";
import { useReduceMotion } from "@breathly/utils/use-accessibility-preferences";
import { useOnMount } from "@breathly/utils/use-on-mount";

interface Props {
  preparationTime: number;
  onComplete: () => void;
}

const interludeInitialDelay = 600;
const interludeAnimDuration = 400;
const secondMs = 1_000;

export const getInterludeInitialStep = (preparationTime: number) =>
  Math.max(1, Math.round(preparationTime / secondMs));

export const ExerciseInterlude: FC<Props> = ({ preparationTime, onComplete }) => {
  const isDarkMode = useColorScheme() === "dark";
  const theme = useThemeColors();
  const reduceMotionEnabled = useReduceMotion();
  const isMountedRef = useRef(true);
  const containerAnimVal = useRef(new Animated.Value(1)).current;
  const subtitleAnimVal = useRef(new Animated.Value(0)).current;
  const initialStep = getInterludeInitialStep(preparationTime);
  const [step, setStep] = useState(initialStep);

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    announceLiveRegionUpdate(getInterludeAccessibilityLabel(nextStep));
  };

  const showSubtitleAnimation = animate(subtitleAnimVal, {
    toValue: 1,
    duration: interludeAnimDuration,
  });

  const hideContainerAnimation = animate(containerAnimVal, {
    toValue: 0,
    duration: interludeAnimDuration,
  });

  const countDownAndHide = async () => {
    for (let nextStep = initialStep - 1; nextStep >= 1; nextStep--) {
      await delay(secondMs);
      if (!isMountedRef.current) return;
      goToStep(nextStep);
    }
    await delay(secondMs);
    if (!isMountedRef.current) return;
    hideContainerAnimation.start((done) => done && onComplete());
  };

  const animateInterlude = async () => {
    await delay(interludeInitialDelay);
    showSubtitleAnimation.start(({ finished }) => {
      if (!finished) return;
      announceLiveRegionUpdate(getInterludeAccessibilityLabel(initialStep));
      void countDownAndHide();
    });
  };

  useOnMount(() => {
    void animateInterlude();
    return () => {
      isMountedRef.current = false;
      showSubtitleAnimation.stop();
      hideContainerAnimation.stop();
    };
  });

  // The countdown only fades when the user asked the system for less motion.
  const containerAnimatedStyle = {
    opacity: containerAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: reduceMotionEnabled
      ? []
      : [
          interpolateTranslateY(containerAnimVal, {
            inputRange: [0, 1],
            outputRange: [0, 8],
          }),
        ],
  };
  const subtitleAnimatedStyle = {
    opacity: subtitleAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: reduceMotionEnabled
      ? []
      : [
          interpolateTranslateY(subtitleAnimVal, {
            inputRange: [0, 1],
            outputRange: [0, -8],
          }),
        ],
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]} testID="exercise.interlude">
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>Relax</Text>
      <Animated.View style={subtitleAnimatedStyle}>
        <Text
          style={[styles.subtitle, { color: theme.textSecondary }]}
          // Android reads the countdown from the live region. iOS has no live
          // regions: the countdown announces itself there.
          accessibilityLiveRegion="polite"
          accessibilityLabel={getInterludeAccessibilityLabel(step)}
        >{`Starting session in \n${step}`}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  subtitle: {
    ...fontSizes.xl,
    fontFamily: fontFamilies.regular,
    textAlign: "center",
  },
  title: {
    ...fontSizes.xxl5,
    color: colors["slate-800"],
    fontFamily: fontFamilies.serifMedium,
    includeFontPadding: true,
    lineHeight: 80,
    marginBottom: 16,
    paddingBottom: 8,
    textAlign: "center",
    textAlignVertical: "center",
  },
  titleDark: {
    color: colors.white,
  },
});
