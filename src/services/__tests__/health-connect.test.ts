const mockGetStatusAsync = jest.fn();
const mockRequestPermissionAsync = jest.fn();
const mockWriteBreathingSessionAsync = jest.fn();

const mockHealthConnectModule = {
  getStatusAsync: mockGetStatusAsync,
  requestPermissionAsync: mockRequestPermissionAsync,
  writeBreathingSessionAsync: mockWriteBreathingSessionAsync,
};

let healthConnect: typeof import("../health-connect");

describe("Health Connect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.doMock("expo-modules-core", () => ({
      ...jest.requireActual("expo-modules-core"),
      requireOptionalNativeModule: () => mockHealthConnectModule,
    }));
    healthConnect = require("../health-connect") as typeof import("../health-connect");
  });

  it.each([
    "unavailable",
    "updateRequired",
    "unsupported",
    "permissionRequired",
    "authorized",
  ] as const)("returns the native %s status", async (status) => {
    mockGetStatusAsync.mockResolvedValue(status);

    await expect(healthConnect.getHealthConnectStatus()).resolves.toBe(status);
  });

  it("treats an unknown native status as unavailable", async () => {
    mockGetStatusAsync.mockResolvedValue("unexpected");

    await expect(healthConnect.getHealthConnectStatus()).resolves.toBe("unavailable");
  });

  it("is unavailable when the Android module is not linked", async () => {
    jest.resetModules();
    jest.doMock("expo-modules-core", () => ({
      ...jest.requireActual("expo-modules-core"),
      requireOptionalNativeModule: () => null,
    }));
    const unavailableHealthConnect =
      require("../health-connect") as typeof import("../health-connect");

    await expect(unavailableHealthConnect.getHealthConnectStatus()).resolves.toBe("unavailable");
    await expect(unavailableHealthConnect.requestHealthConnectPermission()).resolves.toBe(false);
    await expect(
      unavailableHealthConnect.saveCompletedBreathingSession({
        startedAtMs: 1_000,
        completedAtMs: 10_000,
        clientRecordId: "session",
      }),
    ).resolves.toBe("unavailable");
  });

  it("returns the result of the write-permission request", async () => {
    mockRequestPermissionAsync.mockResolvedValue(true);

    await expect(healthConnect.requestHealthConnectPermission()).resolves.toBe(true);
  });

  it("writes the session's wall-clock interval", async () => {
    mockWriteBreathingSessionAsync.mockResolvedValue("saved");

    await expect(
      healthConnect.saveCompletedBreathingSession({
        startedAtMs: 42_000,
        completedAtMs: 100_000,
        clientRecordId: "breathly-session-1",
      }),
    ).resolves.toBe("saved");
    expect(mockWriteBreathingSessionAsync).toHaveBeenCalledWith(
      42_000,
      100_000,
      "breathly-session-1",
    );
  });

  it("writes every active interval of an exercise resumed after the background", async () => {
    mockWriteBreathingSessionAsync.mockResolvedValue("saved");

    await Promise.all([
      healthConnect.saveCompletedBreathingSession({
        startedAtMs: 42_000,
        completedAtMs: 60_000,
        clientRecordId: "breathly-session-1-0",
      }),
      healthConnect.saveCompletedBreathingSession({
        startedAtMs: 80_000,
        completedAtMs: 100_000,
        clientRecordId: "breathly-session-1-1",
      }),
    ]);

    expect(mockWriteBreathingSessionAsync).toHaveBeenNthCalledWith(
      1,
      42_000,
      60_000,
      "breathly-session-1-0",
    );
    expect(mockWriteBreathingSessionAsync).toHaveBeenNthCalledWith(
      2,
      80_000,
      100_000,
      "breathly-session-1-1",
    );
  });

  it("passes through a lost Health Connect permission", async () => {
    mockWriteBreathingSessionAsync.mockResolvedValue("permissionRequired");

    await expect(
      healthConnect.saveCompletedBreathingSession({
        startedAtMs: 42_000,
        completedAtMs: 100_000,
        clientRecordId: "breathly-session-1",
      }),
    ).resolves.toBe("permissionRequired");
  });

  it("treats an unknown write result as an error", async () => {
    mockWriteBreathingSessionAsync.mockResolvedValue("unexpected");

    await expect(
      healthConnect.saveCompletedBreathingSession({
        startedAtMs: 42_000,
        completedAtMs: 100_000,
        clientRecordId: "breathly-session-1",
      }),
    ).resolves.toBe("error");
  });

  it.each([
    { startedAtMs: -1, completedAtMs: 100_000, clientRecordId: "session" },
    {
      startedAtMs: Number.NaN,
      completedAtMs: 100_000,
      clientRecordId: "session",
    },
    {
      startedAtMs: 100_000,
      completedAtMs: 100_000,
      clientRecordId: "session",
    },
    {
      startedAtMs: 100_001,
      completedAtMs: 100_000,
      clientRecordId: "session",
    },
    {
      startedAtMs: 1_000,
      completedAtMs: Number.NaN,
      clientRecordId: "session",
    },
    { startedAtMs: 1_000, completedAtMs: 100_000, clientRecordId: "" },
    {
      startedAtMs: 1_000,
      completedAtMs: 100_000,
      clientRecordId: undefined as never,
    },
  ])("does not send an invalid session: %p", async (session) => {
    await expect(healthConnect.saveCompletedBreathingSession(session)).resolves.toBe("error");
    expect(mockWriteBreathingSessionAsync).not.toHaveBeenCalled();
  });

  it("does not interrupt completion when Health Connect rejects the write", async () => {
    const error = new Error("provider stopped");
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockWriteBreathingSessionAsync.mockRejectedValue(error);

    await expect(
      healthConnect.saveCompletedBreathingSession({
        startedAtMs: 1_000,
        completedAtMs: 10_000,
        clientRecordId: "session",
      }),
    ).resolves.toBe("error");
    expect(warnSpy).toHaveBeenCalledWith(
      "[health-connect] could not save the completed breathing session",
      error,
    );

    warnSpy.mockRestore();
  });
});
