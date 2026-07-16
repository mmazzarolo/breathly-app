import { Animated } from "react-native";

// Since loops using the native driver cannot contain `Animated.sequence`
// we handle them within a plain loop.
export const loopAnimations = (
  createAnimations: () => Animated.CompositeAnimation[],
  onStepStart: (stepIndex: number) => void,
  initialStepIndex = 0
) => {
  let animations = createAnimations();
  if (animations.length === 0) return () => undefined;

  let currentAnimationIndex = Math.min(Math.max(initialStepIndex, 0), animations.length - 1);
  const animateStep = () => {
    animations[currentAnimationIndex].start(({ finished }) => {
      if (!finished) return;
      currentAnimationIndex++;
      if (currentAnimationIndex >= animations.length) {
        currentAnimationIndex = 0;
        animations = createAnimations();
      }
      onStepStart(currentAnimationIndex);
      animateStep();
    });
  };
  onStepStart(currentAnimationIndex);
  animateStep();
  const stopLoop = () => {
    animations.forEach((animation) => animation.stop());
  };
  return stopLoop;
};
