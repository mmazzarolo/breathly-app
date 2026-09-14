import { getStepperValueWidth } from "../settings-ui.android";

describe("Android settings stepper", () => {
  it("reserves enough width for a two-digit timer value", () => {
    expect(getStepperValueWidth(0)).toBe(48);
  });

  it("keeps the compact width for decimal breathing-pattern values", () => {
    expect(getStepperValueWidth(1)).toBe(44);
  });
});
