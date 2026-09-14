import { appendCompletedHealthConnectSegment } from "../health-connect-session";

describe("Health Connect exercise segments", () => {
  it("keeps active intervals on either side of a background pause", () => {
    const beforeBackground = appendCompletedHealthConnectSegment([], 1_000, 5_000, "session");
    const afterResume = appendCompletedHealthConnectSegment(
      beforeBackground,
      8_000,
      12_000,
      "session",
    );

    expect(afterResume).toEqual([
      { startedAtMs: 1_000, completedAtMs: 5_000, clientRecordId: "session-0" },
      { startedAtMs: 8_000, completedAtMs: 12_000, clientRecordId: "session-1" },
    ]);
  });

  it("does not create an empty segment", () => {
    const segments = [{ startedAtMs: 1_000, completedAtMs: 5_000, clientRecordId: "session-0" }];

    expect(appendCompletedHealthConnectSegment(segments, undefined, 7_000, "session")).toBe(
      segments,
    );
    expect(appendCompletedHealthConnectSegment(segments, 8_000, 8_000, "session")).toBe(segments);
  });
});
