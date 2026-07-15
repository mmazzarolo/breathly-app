import { getRemainingSplashDurationMs, minimumSplashDurationMs } from "../splash-screen-timing";

describe("splash screen timing", () => {
  it("keeps the splash visible for the remaining minimum duration", () => {
    expect(getRemainingSplashDurationMs(1_000, 1_250)).toBe(minimumSplashDurationMs - 250);
  });

  it("reveals immediately after the minimum duration", () => {
    expect(getRemainingSplashDurationMs(1_000, 1_000 + minimumSplashDurationMs)).toBe(0);
    expect(getRemainingSplashDurationMs(1_000, 10_000)).toBe(0);
  });

  it("does not extend startup if the wall clock moves backwards", () => {
    expect(getRemainingSplashDurationMs(2_000, 1_000)).toBe(minimumSplashDurationMs);
  });
});
