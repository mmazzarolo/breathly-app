import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { useSettingsStore } from "@breathly/stores/settings";
import { defaultSettingsState } from "@breathly/stores/settings-state";
import { SettingsRootScreen } from "../settings-screen";

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

describe("settings screen", () => {
  beforeEach(() => {
    useSettingsStore.setState(defaultSettingsState);
  });

  it("updates the preparation time from its stepper", async () => {
    await render(
      <SettingsRootScreen
        {...({ navigation, route: {} } as unknown as React.ComponentProps<
          typeof SettingsRootScreen
        >)}
      />,
    );

    expect(screen.getByTestId("settings.preparation-time.value").props.children).toBe(3);

    await fireEvent.press(screen.getByTestId("settings.preparation-time.increase"));

    await waitFor(() => {
      expect(screen.getByTestId("settings.preparation-time.value").props.children).toBe(4);
      expect(useSettingsStore.getState().preparationTime).toBe(4_000);
    });
  });
});
