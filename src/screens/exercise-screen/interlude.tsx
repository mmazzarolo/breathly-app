import React, { FC, useRef, useState } from "react";
import { Animated, Text } from "react-native";
import { animate } from "@breathly/utils/animate";
import { delay } from "@breathly/utils/delay";
import { interpolateTranslateY } from "@breathly/utils/interpolate";
import { useOnMount } from "@breathly/utils/use-on-mount";

interface Props {
  onComplete: () => void;
}

const interludeInitialDelay = 600;
const interludeAnimDuration = 400;

export const ExerciseInterlude: FC<Props> = ({ onComplete }) => {
  const isMountedRef = useRef(true);
  const containerAnimVal = useRef(new Animated.Value(1)).current;
  const subtitleAnimVal = useRef(new Animated.Value(0)).current;
  const [step, setStep] = useState(3);

  const showSubtitleAnimation = animate(subtitleAnimVal, {
    toValue: 1,
    duration: interludeAnimDuration,
  });

  const hideContainerAnimation = animate(containerAnimVal, {
    toValue: 0,
    duration: interludeAnimDuration,
  });

  const animateInterlude = async () => {
    await delay(interludeInitialDelay);
    showSubtitleAnimation.start(async ({ finished }) => {
      if (!finished) return;
      await delay(1000);
      if (!isMountedRef.current) return;
      setStep(2);
      await delay(1000);
      if (!isMountedRef.current) return;
      setStep(1);
      await delay(1000);
      if (!isMountedRef.current) return;
      hideContainerAnimation.start((done) => done && onComplete());
    });
  };

  useOnMount(() => {
    animateInterlude();
    return () => {
      isMountedRef.current = false;
      showSubtitleAnimation.stop();
      hideContainerAnimation.stop();
    };
  });

  const containerAnimatedStyle = {
    opacity: containerAnimVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
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
    transform: [
      interpolateTranslateY(subtitleAnimVal, {
        inputRange: [0, 1],
        outputRange: [0, -8],
      }),
    ],
  };

  return (
    <Animated.View className="flex-1 items-center justify-center" style={containerAnimatedStyle}>
      <Text className="mb-4 text-center font-breathly-serif-medium text-5xl text-slate-800 dark:text-white">
        Relax
      </Text>
      <Animated.View style={subtitleAnimatedStyle}>
        <Text className="text-center font-breathly-regular text-xl text-slate-500 ">
          {`Starting session in \n${step}`}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};
