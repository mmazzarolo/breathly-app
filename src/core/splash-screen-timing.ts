import ms from "ms";

export const minimumSplashDurationMs = ms("1.5 sec");
export const maximumSplashWaitMs = ms("8 sec");

export const getRemainingSplashDurationMs = (mountedAtMs: number, currentTimeMs: number) =>
  Math.max(0, minimumSplashDurationMs - Math.max(0, currentTimeMs - mountedAtMs));
