import { formatTimer } from "../format-timer";

describe("formatTimer", () => {
  test.each([
    [0, "00:00"],
    [9, "00:09"],
    [59, "00:59"],
    [60, "01:00"],
    [3_599, "59:59"],
    [3_600, "01:00:00"],
    [3_661, "01:01:01"],
  ])("formats %i seconds as %s", (seconds, expected) => {
    expect(formatTimer(seconds)).toBe(expected);
  });
});
