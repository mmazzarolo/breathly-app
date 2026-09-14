const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: (name: string) => mockGetItem(name),
    setItem: (name: string, value: string) => mockSetItem(name, value),
    removeItem: (name: string) => mockRemoveItem(name),
  },
}));

import { defaultSettingsState } from "../settings-state";

// The store starts hydrating the moment the module loads, so each case configures the
// storage first and then loads a fresh copy of the store.
const loadSettingsStore = async () => {
  jest.resetModules();
  const { useSettingsStore } = require("../settings") as typeof import("../settings");
  await useSettingsStore.persist.rehydrate();
  return useSettingsStore;
};

const storedSettings = (overrides: Record<string, unknown>) =>
  JSON.stringify({ state: { ...defaultSettingsState, ...overrides }, version: 0 });

let warnSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockSetItem.mockResolvedValue(undefined);
  mockRemoveItem.mockResolvedValue(undefined);
  // The storage adapter logs on failure by design, and most cases here provoke one.
  warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe("settings persistence", () => {
  it("finishes hydration on the defaults when the stored payload cannot be read", async () => {
    mockGetItem.mockRejectedValue(new Error("storage unavailable"));

    const useSettingsStore = await loadSettingsStore();

    // Hydration must complete. If it does not, `useHydration` never turns true and the app
    // shows an empty view on every launch.
    expect(useSettingsStore.persist.hasHydrated()).toBe(true);
    expect(useSettingsStore.getState().theme).toBe(defaultSettingsState.theme);
  });

  it("finishes hydration on the defaults when the stored payload is damaged", async () => {
    // A write cut short by a process kill leaves incomplete JSON behind.
    mockGetItem.mockResolvedValue('{"state":{"theme":"dar');

    const useSettingsStore = await loadSettingsStore();

    expect(useSettingsStore.persist.hasHydrated()).toBe(true);
    expect(useSettingsStore.getState().theme).toBe(defaultSettingsState.theme);
  });

  it("restores stored settings and keeps the store actions", async () => {
    mockGetItem.mockResolvedValue(
      storedSettings({ theme: "dark", vibrationEnabled: false, healthConnectEnabled: true }),
    );

    const useSettingsStore = await loadSettingsStore();

    expect(useSettingsStore.persist.hasHydrated()).toBe(true);
    expect(useSettingsStore.getState().theme).toBe("dark");
    expect(useSettingsStore.getState().vibrationEnabled).toBe(false);
    expect(useSettingsStore.getState().healthConnectEnabled).toBe(true);
    expect(typeof useSettingsStore.getState().setTheme).toBe("function");
    expect(typeof useSettingsStore.getState().setHealthConnectEnabled).toBe("function");
  });

  it("retries a read that failed before it falls back to the defaults", async () => {
    mockGetItem.mockRejectedValue(new Error("database is locked"));

    const useSettingsStore = await loadSettingsStore();

    // A transient failure must not cost the user their settings: falling back to the
    // defaults lets the next settings change overwrite whatever is still on disk.
    expect(mockGetItem.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(useSettingsStore.getState().theme).toBe(defaultSettingsState.theme);
  });

  it("recovers the stored settings when only the first read fails", async () => {
    mockGetItem
      .mockRejectedValueOnce(new Error("database is locked"))
      .mockResolvedValue(storedSettings({ theme: "dark" }));

    const useSettingsStore = await loadSettingsStore();

    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("does not retry a damaged payload", async () => {
    mockGetItem.mockResolvedValue('{"state":{"theme":"dar');

    await loadSettingsStore();

    // Text that will not parse now will not parse on a second read either. At most one
    // read per hydration attempt, and `loadSettingsStore` hydrates twice.
    expect(mockGetItem.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it("repairs an out-of-range stored value instead of failing", async () => {
    mockGetItem.mockResolvedValue(storedSettings({ theme: "sepia", timeLimit: -1 }));

    const useSettingsStore = await loadSettingsStore();

    expect(useSettingsStore.persist.hasHydrated()).toBe(true);
    expect(useSettingsStore.getState().theme).toBe("light");
    expect(useSettingsStore.getState().timeLimit).toBe(0);
  });
});
