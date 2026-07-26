import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource,
} from "expo-audio";
import { Asset } from "expo-asset";
import { Platform } from "react-native";
import { sounds } from "@breathly/assets/sounds";
import { GuidedBreathingMode } from "@breathly/types/guided-breathing-mode";
import { GuidedBreathingStep } from "@breathly/types/guided-breathing-step";

const configureAudioMode = () =>
  setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    interruptionMode: Platform.OS === "android" ? "duckOthers" : "mixWithOthers",
  });

type GuidedBreathingAudioSounds = {
  [key in GuidedBreathingMode]: {
    [key in GuidedBreathingStep]: AudioSource | undefined;
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
  [key in GuidedBreathingStep]: AudioPlayer;
};

let currentGuidedBreathingSounds: CurrentGuidedBreathingSounds | undefined;
let endingBellSound: AudioPlayer | undefined;
let audioOperation = Promise.resolve();
let requestedAudioGeneration = 0;

const enqueueAudioOperation = (operation: () => Promise<void>) => {
  const result = audioOperation.then(operation, operation);
  audioOperation = result.catch(() => undefined);
  return result;
};

const disposeCurrentAudio = async () => {
  const guidedBreathingSounds = currentGuidedBreathingSounds;
  const bellSound = endingBellSound;

  currentGuidedBreathingSounds = undefined;
  endingBellSound = undefined;

  bellSound?.remove();
  guidedBreathingSounds?.breatheIn.remove();
  guidedBreathingSounds?.breatheOut.remove();
  guidedBreathingSounds?.hold.remove();
};

const prepareAudioSource = async (source: AudioSource): Promise<AudioSource> => {
  if (typeof source !== "number") return source;

  // Materialize bundled audio before creating the native player. This gives setup
  // an awaitable readiness boundary and avoids Android resource-URI loading races.
  const asset = Asset.fromModule(source);
  await asset.downloadAsync();

  return {
    assetId: source,
    uri: asset.localUri ?? asset.uri,
  };
};

export function setupGuidedBreathingAudio(guidedBreathingMode: GuidedBreathingMode) {
  const audioGeneration = ++requestedAudioGeneration;
  const audioSources = [
    sounds.endingBell,
    guidedBreathingAudioAssets[guidedBreathingMode].breatheIn,
    guidedBreathingAudioAssets[guidedBreathingMode].breatheOut,
    guidedBreathingAudioAssets[guidedBreathingMode].hold,
  ].filter((source): source is AudioSource => source != null);

  return enqueueAudioOperation(async () => {
    await disposeCurrentAudio();
    if (audioGeneration !== requestedAudioGeneration) return;

    await configureAudioMode();
    const preparedAudioSources = await Promise.all(audioSources.map(prepareAudioSource));
    if (audioGeneration !== requestedAudioGeneration) return;

    endingBellSound = createAudioPlayer(preparedAudioSources[0]);
    currentGuidedBreathingSounds = {
      breatheIn: createAudioPlayer(preparedAudioSources[1]),
      breatheOut: createAudioPlayer(preparedAudioSources[2]),
      hold: createAudioPlayer(preparedAudioSources[3]),
    };
  });
}

export const releaseGuidedBreathingAudio = () => {
  requestedAudioGeneration++;
  return enqueueAudioOperation(disposeCurrentAudio);
};

export const stopGuidedBreathingAudio = () => {
  endingBellSound?.pause();
  currentGuidedBreathingSounds?.breatheIn.pause();
  currentGuidedBreathingSounds?.breatheOut.pause();
  currentGuidedBreathingSounds?.hold.pause();
};

export const playGuidedBreathingSound = async (guidedBreathingStep: GuidedBreathingStep) => {
  const player = currentGuidedBreathingSounds?.[guidedBreathingStep];
  try {
    await player?.seekTo(0);
    if (player === currentGuidedBreathingSounds?.[guidedBreathingStep]) player?.play();
  } catch {
    // Audio cues are optional; keep the visual exercise running if a native player fails.
  }
};

export const playEndingBellSound = async () => {
  const player = endingBellSound;
  try {
    await player?.seekTo(0);
    if (player === endingBellSound) player?.play();
  } catch {
    // Completion must not fail because the optional ending bell could not play.
  }
};
