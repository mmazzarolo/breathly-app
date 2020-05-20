import ReactNativeSound from "react-native-sound";

type SoundEffectId = keyof typeof soundEffects;

const soundEffects = {
  lauraBreatheIn: { path: "laurainhale.mp3", sound: null as any },
  lauraBreatheOut: { path: "lauraexhale.mp3", sound: null as any },
  lauraHold: { path: "laurahold.mp3", sound: null as any },
  paulBreatheIn: { path: "paulinhale.mp3", sound: null as any },
  paulBreatheOut: { path: "paulexhale.mp3", sound: null as any },
  paulHold: { path: "paulhold.mp3", sound: null as any },
  endingBell: { path: "endingbell1.mp3", sound: null as any },
  cueBell1: { path: "cuebell1.mp3", sound: null as any },
  cueBell2: { path: "cuebell2.mp3", sound: null as any },
};

const preloadSound = async (id: SoundEffectId) => {
  const soundEffect = soundEffects[id];
  return new Promise((resolve, reject) => {
    const sound: any = new ReactNativeSound(
      soundEffect.path,
      ReactNativeSound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          console.error("Failed to preload ", soundEffect.path);
          return reject(error);
        } else {
          soundEffect.sound = sound;
          resolve();
        }
      }
    );
  });
};

const releaseSound = (id: SoundEffectId) => {
  const soundEffect = soundEffects[id];
  if (soundEffect.sound && soundEffect.sound.stop) {
    soundEffect.sound.stop();
  }
  if (soundEffect.sound && soundEffect.sound.release) {
    soundEffect.sound.release();
  }
};

export const initializeAudio = async () => {
  // Enable playback in silence mode
  ReactNativeSound.setCategory("Playback");

  // Preload sound effects
  try {
    const soundEffectIds = Object.keys(soundEffects) as SoundEffectId[];
    Promise.all(soundEffectIds.map((id) => preloadSound(id)));
  } catch (error) {
    console.error("Failed to preload sound", error);
  }
};

export const playSound = async (id: SoundEffectId) => {
  const soundEffect = soundEffects[id];
  return new Promise((resolve, reject) => {
    if (soundEffect.sound && soundEffect.sound.play) {
      soundEffect.sound.play((success: boolean) =>
        success
          ? resolve()
          : reject("Playback failed due to audio decoding errors")
      );
    }
  });
};

export const releaseAudio = () => {
  const soundEffectIds = Object.keys(soundEffects) as SoundEffectId[];
  Promise.all(soundEffectIds.map((id) => releaseSound(id)));
};
