import ms from "ms";
import { patternPresets } from "../pattern-presets";

describe("pattern presets", () => {
  it("includes the new breathing techniques with their intended patterns", () => {
    expect(patternPresets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "advanced-5-7-9",
          steps: [ms("5s"), ms("7s"), ms("9s"), 0],
        }),
        expect.objectContaining({
          id: "ratio-1-4-2",
          steps: [ms("5s"), ms("20s"), ms("10s"), 0],
        }),
        expect.objectContaining({
          id: "rectangular",
          steps: [ms("5s"), ms("8s"), ms("5s"), ms("8s")],
        }),
        expect.objectContaining({
          id: "wim-hof",
          steps: [ms("2s"), 0, ms("2s"), 0],
        }),
      ]),
    );
  });

  it("keeps preset ids unique", () => {
    const ids = patternPresets.map((preset) => preset.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
