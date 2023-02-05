import * as Haptics from "expo-haptics";
import { Platform, Vibration } from "react-native";
import { StepMetadata } from "@breathly/types/step-metadata";
import { useOnUpdate } from "@breathly/utils/use-on-update";

export const useExerciseHaptics = (
  currentStepMetadata: StepMetadata,
  vibrationEnabled: boolean
) => {
  useOnUpdate(
    (prevStepMetadata) => {
      if (currentStepMetadata?.id !== prevStepMetadata?.id) {
        if (vibrationEnabled) {
          if (Platform.OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else if (Platform.OS === "android") {
            Vibration.vibrate(20);
          }
        }
      }
    },
    currentStepMetadata,
    true
  );
};
