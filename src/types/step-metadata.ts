import { GuidedBreathingStep } from "@breathly/services/audio";

export interface StepMetadata {
  id: string;
  audioId: GuidedBreathingStep;
  label: string;
  duration: number;
  showDots: boolean;
  skipped: boolean;
}
