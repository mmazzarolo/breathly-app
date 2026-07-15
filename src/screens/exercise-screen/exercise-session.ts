export type ResumableExerciseStatus = "interlude" | "running";
export type ExerciseStatus = ResumableExerciseStatus | "paused" | "completed";

export interface ExerciseSession {
  status: ExerciseStatus;
  resumeStatus?: ResumableExerciseStatus;
  activeElapsedMs: number;
  currentStepIndex: number;
}

export type ExerciseSessionAction =
  | { type: "start" }
  | { type: "pause"; activeElapsedMs: number }
  | { type: "resume" }
  | { type: "complete"; activeElapsedMs: number }
  | { type: "stepChanged"; stepIndex: number };

export const createExerciseSession = (): ExerciseSession => ({
  status: "interlude",
  activeElapsedMs: 0,
  currentStepIndex: 0,
});

export const getSessionNowMs = () => globalThis.performance?.now() ?? Date.now();

export const getActiveTickDeltaMs = (
  previousTickAtMs: number,
  currentTickAtMs: number,
  appIsActive: boolean,
  maximumActiveTickGapMs: number
) => {
  const tickDeltaMs = currentTickAtMs - previousTickAtMs;
  if (!appIsActive || tickDeltaMs < 0 || tickDeltaMs > maximumActiveTickGapMs) return 0;
  return tickDeltaMs;
};

export const exerciseSessionReducer = (
  session: ExerciseSession,
  action: ExerciseSessionAction
): ExerciseSession => {
  switch (action.type) {
    case "start":
      if (session.status !== "interlude") return session;
      return {
        ...session,
        status: "running",
      };
    case "pause":
      if (session.status === "interlude") {
        return {
          ...session,
          status: "paused",
          resumeStatus: "interlude",
        };
      }
      if (session.status !== "running") return session;
      return {
        ...session,
        status: "paused",
        resumeStatus: "running",
        activeElapsedMs: Math.max(session.activeElapsedMs, action.activeElapsedMs),
      };
    case "resume":
      if (session.status !== "paused" || session.resumeStatus == null) return session;
      if (session.resumeStatus === "interlude") {
        return {
          ...session,
          status: "interlude",
          resumeStatus: undefined,
        };
      }
      return {
        ...session,
        status: "running",
        resumeStatus: undefined,
      };
    case "complete":
      if (session.status !== "running") return session;
      return {
        ...session,
        status: "completed",
        activeElapsedMs: Math.max(session.activeElapsedMs, action.activeElapsedMs),
      };
    case "stepChanged":
      if (session.status !== "running" || action.stepIndex < 0) return session;
      return {
        ...session,
        currentStepIndex: action.stepIndex,
      };
  }
};
