jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(),
  setAudioModeAsync: jest.fn(),
}));

jest.mock("expo-asset", () => ({
  Asset: {
    fromModule: jest.fn(),
  },
}));

jest.mock("@breathly/assets/sounds", () => ({
  sounds: {
    endingBell: 1,
    lauraBreatheIn: 2,
    lauraBreatheOut: 3,
    lauraHold: 4,
    paulBreatheIn: 5,
    paulBreatheOut: 6,
    paulHold: 7,
    cueBell1: 8,
    cueBell2: 9,
  },
}));

import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Asset } from "expo-asset";
import { Platform } from "react-native";
import {
  playGuidedBreathingSound,
  releaseGuidedBreathingAudio,
  setupGuidedBreathingAudio,
} from "../audio";

const mockCreateAudioPlayer = createAudioPlayer as jest.Mock;
const mockSetAudioModeAsync = setAudioModeAsync as jest.Mock;
const mockAssetFromModule = Asset.fromModule as jest.Mock;
const mockPlayers: Array<{
  source: unknown;
  pause: jest.Mock;
  play: jest.Mock;
  remove: jest.Mock;
  seekTo: jest.Mock;
}> = [];
const originalPlatform = Platform.OS;

beforeAll(() => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
});

beforeEach(() => {
  mockSetAudioModeAsync.mockResolvedValue(undefined);
  mockCreateAudioPlayer.mockImplementation((source: unknown) => {
    const player = {
      source,
      pause: jest.fn(),
      play: jest.fn(),
      remove: jest.fn(),
      seekTo: jest.fn().mockResolvedValue(undefined),
    };
    mockPlayers.push(player);
    return player;
  });
  mockAssetFromModule.mockImplementation((assetId: number) => {
    const asset: {
      uri: string;
      localUri: string | null;
      downloadAsync: jest.Mock;
    } = {
      uri: `asset://${assetId}`,
      localUri: null,
      downloadAsync: jest.fn(),
    };
    asset.downloadAsync.mockImplementation(async () => {
      asset.localUri = `file:///audio/${assetId}.mp3`;
      return asset;
    });
    return asset;
  });
});

afterEach(async () => {
  await releaseGuidedBreathingAudio();
  mockPlayers.length = 0;
  jest.clearAllMocks();
});

afterAll(() => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform });
});

describe("guided breathing audio", () => {
  it("configures audio and materializes every bundled sound before creating players", async () => {
    await setupGuidedBreathingAudio("laura");

    expect(mockSetAudioModeAsync).toHaveBeenCalledWith({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "duckOthers",
    });
    expect(mockAssetFromModule).toHaveBeenCalledTimes(4);
    expect(mockCreateAudioPlayer.mock.calls.map(([source]) => source)).toEqual([
      { assetId: 1, uri: "file:///audio/1.mp3" },
      { assetId: 2, uri: "file:///audio/2.mp3" },
      { assetId: 3, uri: "file:///audio/3.mp3" },
      { assetId: 4, uri: "file:///audio/4.mp3" },
    ]);
  });

  it("rewinds a prepared cue before playing it", async () => {
    await setupGuidedBreathingAudio("bell");

    await playGuidedBreathingSound("breatheIn");

    expect(mockPlayers[1].seekTo).toHaveBeenCalledWith(0);
    expect(mockPlayers[1].play).toHaveBeenCalledTimes(1);
  });
});
