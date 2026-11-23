import { describe, expect, it } from "vitest";
import { post, type Bill } from "./ledger";

const breakfast = { id: "l1", billId: "b1", businessDay: "2026-12-01", amount: 1800, description: "Breakfast" };

describe("post", () => {
  // docket:verifies component:ledger
  it("adds a charge to an open bill", () => {
    const bill: Bill = { id: "b1", status: "open", lines: [] };
    post(bill, breakfast);
    expect(bill.lines).toHaveLength(1);
  });

  // docket:verifies rule:bills/closed-bills-dont-change
  it("refuses a charge on a closed bill", () => {
    const bill: Bill = { id: "b1", status: "closed", lines: [] };
    expect(() => post(bill, breakfast)).toThrow();
  });
});
