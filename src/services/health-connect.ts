import { requireOptionalNativeModule } from "expo-modules-core";

export type HealthConnectStatus =
  | "unavailable"
  | "updateRequired"
  | "unsupported"
  | "permissionRequired"
  | "authorized";

interface BreathlyHealthConnectNativeModule {
  getStatusAsync: () => Promise<HealthConnectStatus>;
  requestPermissionAsync: () => Promise<boolean>;
  writeBreathingSessionAsync: (
    startTimeMs: number,
    endTimeMs: number,
    clientRecordId: string,
  ) => Promise<HealthConnectWriteResult>;
}

export interface CompletedBreathingSession {
  startedAtMs: number;
  completedAtMs: number;
  clientRecordId: string;
}

export type HealthConnectWriteResult = HealthConnectStatus | "saved" | "error";

const healthConnectModule =
  requireOptionalNativeModule<BreathlyHealthConnectNativeModule>("BreathlyHealthConnect");

const validStatuses: HealthConnectStatus[] = [
  "unavailable",
  "updateRequired",
  "unsupported",
  "permissionRequired",
  "authorized",
];

const isValidStatus = (value: unknown): value is HealthConnectStatus =>
  validStatuses.includes(value as HealthConnectStatus);

const isValidWriteResult = (value: unknown): value is HealthConnectWriteResult =>
  value === "saved" || value === "error" || isValidStatus(value);

export const getHealthConnectStatus = async (): Promise<HealthConnectStatus> => {
  if (!healthConnectModule) return "unavailable";
  const status = await healthConnectModule.getStatusAsync();
  return isValidStatus(status) ? status : "unavailable";
};

export const requestHealthConnectPermission = async () =>
  healthConnectModule ? healthConnectModule.requestPermissionAsync() : false;

export const saveCompletedBreathingSession = async ({
  startedAtMs,
  completedAtMs,
  clientRecordId,
}: CompletedBreathingSession): Promise<HealthConnectWriteResult> => {
  if (!healthConnectModule) return "unavailable";

  if (
    !Number.isFinite(startedAtMs) ||
    startedAtMs < 0 ||
    !Number.isFinite(completedAtMs) ||
    completedAtMs <= startedAtMs ||
    typeof clientRecordId !== "string" ||
    clientRecordId.length === 0
  ) {
    return "error";
  }

  try {
    const result = await healthConnectModule.writeBreathingSessionAsync(
      startedAtMs,
      completedAtMs,
      clientRecordId,
    );
    return isValidWriteResult(result) ? result : "error";
  } catch (error) {
    console.warn("[health-connect] could not save the completed breathing session", error);
    return "error";
  }
};
