import type { CompletedBreathingSession } from "@breathly/services/health-connect";

export const appendCompletedHealthConnectSegment = (
  segments: CompletedBreathingSession[],
  startedAtMs: number | undefined,
  completedAtMs: number,
  sessionId: string,
): CompletedBreathingSession[] => {
  if (startedAtMs == null || completedAtMs <= startedAtMs) return segments;

  return [
    ...segments,
    {
      startedAtMs,
      completedAtMs,
      clientRecordId: `${sessionId}-${segments.length}`,
    },
  ];
};
