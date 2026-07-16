import { useCallback, useEffect, useState } from "react";
import {
  setupGuidedBreathingAudio,
  releaseGuidedBreathingAudio,
  playEndingBellSound,
  playGuidedBreathingSound,
  stopGuidedBreathingAudio,
} from "@breathly/services/audio";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";
import { StepMetadata } from "@breathly/types/step-metadata";

export const useExerciseAudio = (guidedBreathingVoice: GuidedBreathingMode) => {
  const [audioReady, setAudioReady] = useState(guidedBreathingVoice === "disabled");

  useEffect(() => {
    let active = true;
    if (guidedBreathingVoice === "disabled") {
      setAudioReady(true);
      return;
    }

    setAudioReady(false);
    setupGuidedBreathingAudio(guidedBreathingVoice)
      .then(() => {
        if (active) setAudioReady(true);
      })
      .catch(() => {
        if (active) setAudioReady(false);
      });

    return () => {
      active = false;
      void releaseGuidedBreathingAudio().catch(() => undefined);
    };
  }, [guidedBreathingVoice]);

  const playExerciseStepAudio = useCallback(
    (stepMetadata: StepMetadata) => {
      if (audioReady) void playGuidedBreathingSound(stepMetadata.audioId);
    },
    [audioReady]
  );

  const playExerciseCompletedAudio = useCallback(() => {
    if (audioReady) void playEndingBellSound();
  }, [audioReady]);

  return {
    audioReady,
    playExerciseStepAudio,
    playExerciseCompletedAudio,
    stopExerciseAudio: stopGuidedBreathingAudio,
  };
};
