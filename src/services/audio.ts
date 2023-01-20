import { Audio } from "expo-av";
import { sounds } from "../assets/sounds";
import { GuidedBreathingMode } from "../types/guided-breathing-mode";

(async function () {
  Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
})();

type GuidedBreathingStep = "breatheIn" | "breatheOut" | "hold";

type GuidedBreathingAudioSounds = {
  [key in GuidedBreathingMode]: {
    [key in GuidedBreathingStep]: any;
  };
};

const guidedBreathingAudioAssets: GuidedBreathingAudioSounds = {
  laura: {
    breatheIn: sounds.lauraBreatheIn,
    breatheOut: sounds.lauraBreatheOut,
    hold: sounds.lauraHold,
  },
  paul: {
    breatheIn: sounds.paulBreatheIn,
    breatheOut: sounds.paulBreatheOut,
    hold: sounds.paulHold,
  },
  bell: {
    breatheIn: sounds.cueBell1,
    breatheOut: sounds.cueBell1,
    hold: sounds.cueBell2,
  },
  disabled: {
    breatheIn: undefined,
    breatheOut: undefined,
    hold: undefined,
  },
};

type CurrentGuidedBreathingSounds = {
  [key in GuidedBreathingStep]: Audio.Sound;
};

let currentGuidedBreathingSounds: CurrentGuidedBreathingSounds | undefined;
let endingBellSound: Audio.Sound | undefined;

export async function setupGuidedBreathingAudio(guidedBreathingMode: GuidedBreathingMode) {
  const [endingBellLoadResult, breatheInLoadResult, breatheOutLoadResult, holdLoadResult] =
    await Promise.all([
      Audio.Sound.createAsync(sounds.endingBell),
      Audio.Sound.createAsync(guidedBreathingAudioAssets[guidedBreathingMode].breatheIn),
      Audio.Sound.createAsync(guidedBreathingAudioAssets[guidedBreathingMode].breatheOut),
      Audio.Sound.createAsync(guidedBreathingAudioAssets[guidedBreathingMode].hold),
    ]);
  endingBellSound = endingBellLoadResult.sound;
  currentGuidedBreathingSounds = {
    breatheIn: breatheInLoadResult.sound,
    breatheOut: breatheOutLoadResult.sound,
    hold: holdLoadResult.sound,
  };
}

export const releaseGuidedBreathingAudio = async () => {
  await Promise.all([
    endingBellSound?.unloadAsync(),
    currentGuidedBreathingSounds?.breatheIn.unloadAsync(),
    currentGuidedBreathingSounds?.breatheOut.unloadAsync(),
    currentGuidedBreathingSounds?.hold.unloadAsync(),
  ]);
  currentGuidedBreathingSounds = undefined;
};

export const playGuidedBreathingSound = async (guidedBreathingStep: GuidedBreathingStep) => {
  return currentGuidedBreathingSounds?.[guidedBreathingStep].playFromPositionAsync(0);
};

export const playEndingBellSound = async () => {
  return endingBellSound?.playFromPositionAsync(0);
};
