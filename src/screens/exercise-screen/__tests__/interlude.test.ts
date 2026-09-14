import { act, render, screen } from "@testing-library/react-native";
import React from "react";
import { ExerciseInterlude, getInterludeInitialStep } from "../interlude";

jest.mock("@breathly/utils/animate", () => ({
  animate: (_value: unknown, { duration = 0 }: { duration?: number }) => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    return {
      start: (callback?: (result: { finished: boolean }) => void) => {
        timeout = setTimeout(() => callback?.({ finished: true }), duration);
      },
      stop: () => {
        if (timeout != null) clearTimeout(timeout);
      },
    };
  },
}));

describe("exercise interlude", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("uses the selected preparation time as the initial countdown step", () => {
    expect(getInterludeInitialStep(3_000)).toBe(3);
    expect(getInterludeInitialStep(30_000)).toBe(30);
  });

  it("waits for every selected second after the subtitle appears", async () => {
    const onComplete = jest.fn();

    await render(React.createElement(ExerciseInterlude, { preparationTime: 3_000, onComplete }));

    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(onComplete).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(screen.getByText("Starting session in \n3")).not.toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    expect(screen.getByText("Starting session in \n2")).not.toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    expect(screen.getByText("Starting session in \n1")).not.toBeNull();
    expect(onComplete).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    expect(onComplete).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not start an exercise after the countdown unmounts", async () => {
    const onComplete = jest.fn();
    const { unmount } = await render(
      React.createElement(ExerciseInterlude, { preparationTime: 3_000, onComplete }),
    );

    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    await unmount();

    await act(async () => {
      jest.advanceTimersByTime(3_000);
    });
    expect(onComplete).not.toHaveBeenCalled();
  });
});
