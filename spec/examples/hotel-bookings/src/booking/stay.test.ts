import { describe, expect, it } from "vitest";
import { parseStay } from "./stay";

describe("parseStay", () => {
  it("accepts a one-night stay", () => {
    expect(parseStay("2026-12-01", "2026-12-02")).toEqual({
      checkIn: "2026-12-01",
      checkOut: "2026-12-02",
    });
  });

  // docket:verifies rule:minimum-stay@guest-stays
  it("rejects a stay that ends the day it starts", () => {
    expect(() => parseStay("2026-12-01", "2026-12-01")).toThrow();
  });
});
