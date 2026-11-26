import { describe, expect, it } from "vitest";
import { refundAmount } from "./refund";

describe("refundAmount", () => {
  // docqet:verifies rule:free-cancellation-window@guest-stays
  it("refunds in full exactly 48 hours ahead", () => {
    expect(refundAmount(300, new Date("2026-12-10T15:00:00Z"), new Date("2026-12-08T15:00:00Z"))).toBe(300);
  });
});
