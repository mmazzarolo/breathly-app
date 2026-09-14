jest.mock("expo-navigation-bar", () => ({
  NavigationBar: { setHidden: jest.fn() },
  useVisibility: jest.fn(),
}));

jest.mock("expo-status-bar", () => ({ setStatusBarHidden: jest.fn() }));

import { act, render } from "@testing-library/react-native";
import { NavigationBar, useVisibility } from "expo-navigation-bar";
import React from "react";
import { Platform } from "react-native";
import { useStickyImmersiveReset } from "../use-sticky-immersive-reset";

const mockSetHidden = NavigationBar.setHidden as jest.Mock;
const mockUseVisibility = useVisibility as jest.Mock;
const originalPlatform = Platform.OS;

const ImmersiveReset = ({
  shouldKeepNavigationBarVisible,
}: {
  shouldKeepNavigationBarVisible: boolean;
}) => {
  useStickyImmersiveReset(shouldKeepNavigationBarVisible);
  return null;
};

beforeAll(() => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
});

beforeEach(() => {
  jest.useFakeTimers();
  mockUseVisibility.mockReturnValue("visible");
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

afterAll(() => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform });
});

describe("sticky immersive navigation", () => {
  it("keeps navigation buttons visible without scheduling another hide", async () => {
    const { unmount } = await render(<ImmersiveReset shouldKeepNavigationBarVisible />);

    expect(mockSetHidden).toHaveBeenCalledWith(false);

    await act(() => jest.advanceTimersByTime(3_000));

    expect(mockSetHidden).not.toHaveBeenCalledWith(true);
    await unmount();
  });

  it("cancels a pending hide when navigation buttons are enabled", async () => {
    const { rerender, unmount } = await render(
      <ImmersiveReset shouldKeepNavigationBarVisible={false} />,
    );

    await rerender(<ImmersiveReset shouldKeepNavigationBarVisible />);
    await act(() => jest.advanceTimersByTime(3_000));

    expect(mockSetHidden).toHaveBeenCalledWith(false);
    expect(mockSetHidden).not.toHaveBeenCalledWith(true);
    await unmount();
  });

  it("returns to sticky immersive mode when navigation buttons are disabled", async () => {
    const { rerender, unmount } = await render(<ImmersiveReset shouldKeepNavigationBarVisible />);

    await rerender(<ImmersiveReset shouldKeepNavigationBarVisible={false} />);
    await act(() => jest.advanceTimersByTime(3_000));

    expect(mockSetHidden).toHaveBeenLastCalledWith(true);
    await unmount();
  });
});
