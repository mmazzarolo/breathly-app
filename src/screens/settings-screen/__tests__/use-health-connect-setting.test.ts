import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  getHealthConnectStatus,
  requestHealthConnectPermission,
} from "@breathly/services/health-connect";
import { useHealthConnectSetting } from "../use-health-connect-setting";

jest.mock("@breathly/services/health-connect", () => ({
  getHealthConnectStatus: jest.fn(),
  requestHealthConnectPermission: jest.fn(),
}));

const mockGetHealthConnectStatus = jest.mocked(getHealthConnectStatus);
const mockRequestHealthConnectPermission = jest.mocked(requestHealthConnectPermission);

const createDeferred = <Value>() => {
  let resolve: (value: Value) => void;
  const promise = new Promise<Value>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve: resolve! };
};

describe("useHealthConnectSetting", () => {
  const setHealthConnectEnabled = jest.fn();
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("enables the setting after Health Connect authorizes it", async () => {
    mockGetHealthConnectStatus.mockResolvedValue("authorized");
    const { result } = await renderHook(() => useHealthConnectSetting(setHealthConnectEnabled));

    await act(async () => {
      await result.current(true);
    });

    expect(setHealthConnectEnabled).toHaveBeenCalledWith(true);
    expect(mockRequestHealthConnectPermission).not.toHaveBeenCalled();
  });

  it("does not leave the toggle locked after duplicate enable taps", async () => {
    const firstStatus = createDeferred<"authorized">();
    mockGetHealthConnectStatus
      .mockReturnValueOnce(firstStatus.promise)
      .mockResolvedValue("authorized");
    const { result } = await renderHook(() => useHealthConnectSetting(setHealthConnectEnabled));

    const firstEnable = result.current(true);
    const duplicateEnable = result.current(true);
    firstStatus.resolve("authorized");
    await act(async () => {
      await Promise.all([firstEnable, duplicateEnable]);
      await result.current(true);
    });

    expect(mockGetHealthConnectStatus).toHaveBeenCalledTimes(2);
    expect(setHealthConnectEnabled).toHaveBeenCalledWith(true);
  });

  it("uses the latest enable intent when access resolves after an off/on sequence", async () => {
    const deferredStatus = createDeferred<"authorized">();
    mockGetHealthConnectStatus
      .mockReturnValueOnce(deferredStatus.promise)
      .mockResolvedValue("authorized");
    const { result } = await renderHook(() => useHealthConnectSetting(setHealthConnectEnabled));

    const enable = result.current(true).catch((error: unknown) => {
      throw error;
    });
    await act(async () => {
      await result.current(false);
    });
    const enableAgain = result.current(true);
    deferredStatus.resolve("authorized");
    await act(async () => {
      await enable;
      await enableAgain;
    });

    expect(setHealthConnectEnabled).toHaveBeenNthCalledWith(1, false);
    expect(setHealthConnectEnabled).toHaveBeenLastCalledWith(true);
    expect(mockGetHealthConnectStatus).toHaveBeenCalledTimes(1);
  });

  it("keeps the setting disabled and explains a denied permission request", async () => {
    mockGetHealthConnectStatus.mockResolvedValue("permissionRequired");
    mockRequestHealthConnectPermission.mockResolvedValue(false);
    const { result } = await renderHook(() => useHealthConnectSetting(setHealthConnectEnabled));

    await act(async () => {
      await result.current(true);
    });

    expect(setHealthConnectEnabled).toHaveBeenCalledWith(false);
    expect(alertSpy).toHaveBeenCalledWith(
      "Health Connect permission needed",
      "Allow Breathly to write mindfulness sessions to use this option.",
    );
  });

  it("enables the setting when the permission request succeeds", async () => {
    mockGetHealthConnectStatus.mockResolvedValue("permissionRequired");
    mockRequestHealthConnectPermission.mockResolvedValue(true);
    const { result } = await renderHook(() => useHealthConnectSetting(setHealthConnectEnabled));

    await act(async () => {
      await result.current(true);
    });

    expect(setHealthConnectEnabled).toHaveBeenCalledWith(true);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("does not show an alert after the settings screen unmounts", async () => {
    const deferredStatus = createDeferred<"unavailable">();
    mockGetHealthConnectStatus.mockReturnValue(deferredStatus.promise);
    const { result, unmount } = await renderHook(() =>
      useHealthConnectSetting(setHealthConnectEnabled),
    );

    const enable = result.current(true).catch((error: unknown) => {
      throw error;
    });
    await unmount();
    deferredStatus.resolve("unavailable");
    await act(async () => {
      await enable;
    });

    expect(alertSpy).not.toHaveBeenCalled();
  });
});
