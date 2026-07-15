import type { GuidedBreathingStep } from "@breathly/types/guided-breathing-step";

export interface StepMetadata {
  id: string;
  audioId: GuidedBreathingStep;
  label: string;
  duration: number;
  showDots: boolean;
  skipped: boolean;
}
