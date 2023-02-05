import { useEffect } from "react";
import {
  setupGuidedBreathingAudio,
  releaseGuidedBreathingAudio,
  playEndingBellSound,
  playGuidedBreathingSound,
} from "@breathly/services/audio";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";
import { StepMetadata } from "@breathly/types/step-metadata";

export const useExerciseAudio = (guidedBreathingVoice: GuidedBreathingMode) => {
  useEffect(() => {
    if (guidedBreathingVoice !== "disabled") setupGuidedBreathingAudio(guidedBreathingVoice);
    return () => {
      if (guidedBreathingVoice !== "disabled") releaseGuidedBreathingAudio();
    };
  }, []);

  return {
    playExerciseStepAudio(stepMetadata: StepMetadata) {
      playGuidedBreathingSound(stepMetadata.audioId);
    },
    playExerciseCompletedAudio: playEndingBellSound,
  };
};
